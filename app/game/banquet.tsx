"use client";
import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RotateCcw, RotateCw } from "lucide-react";
import { banquetModel, disposeScene } from "./models";
import type { Drink, Entry, Plate } from "./rules";
type Setting = {
  id: string;
  chef: string;
  mine: boolean;
  served: boolean;
  plate: Plate;
  drink?: Drink | null;
};

// Static scenery shares draw calls. Keep seats separate so plates stay pickable.
function batchRoom(room: T.Group) {
  room.updateMatrixWorld(true);
  const batches = new Map<
    string,
    { material: T.Material; seat?: number; parts: T.BufferGeometry[] }
  >();
  room.traverse((obj) => {
    if (!(obj instanceof T.Mesh) || Array.isArray(obj.material)) return;
    let owner: T.Object3D | null = obj;
    while (owner && owner.userData.seat === undefined) owner = owner.parent;
    const seat = owner?.userData.seat,
      key = obj.material.uuid + "/" + (seat ?? "room");
    let batch = batches.get(key);
    if (!batch) {
      batch = { material: obj.material, seat, parts: [] };
      batches.set(key, batch);
    }
    const part = obj.geometry.index
      ? obj.geometry.toNonIndexed()
      : obj.geometry.clone();
    part.applyMatrix4(obj.matrixWorld);
    for (const attr of Object.keys(part.attributes))
      if (attr !== "position" && attr !== "normal") part.deleteAttribute(attr);
    batch.parts.push(part);
  });
  const compact = new T.Group();
  for (const b of batches.values()) {
    const merged = mergeGeometries(b.parts);
    if (merged) {
      const mesh = new T.Mesh(merged, b.material);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.userData.seat = b.seat;
      compact.add(mesh);
    }
    b.parts.forEach((part) => part.dispose());
  }
  disposeScene(room);
  return compact;
}
export default function Banquet({
  entries,
  open,
  verdict,
  revise,
}: {
  revise: () => void;
  entries: Entry[];
  verdict?: Entry["servings"][number]["verdict"];
  open: (entry: Entry) => void;
}) {
  const [capacity, setCapacity] = useState(8);
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 600px)");
    const fitCards = () => setCapacity(phone.matches ? 4 : 8);
    fitCards();
    phone.addEventListener("change", fitCards);
    return () => phone.removeEventListener("change", fitCards);
  }, []);
  const [page, setPage] = useState(0),
    [fallback, setFallback] = useState(false);
  const host = useRef<HTMLDivElement>(null),
    buttons = useRef<(HTMLButtonElement | null)[]>([]),
    leaders = useRef<(SVGLineElement | null)[]>([]),
    turn = useRef<((delta: number) => void) | null>(null);
  const sorted = [...entries].sort(
    (a, b) =>
      Number(b.mine) - Number(a.mine) ||
      a.chef.localeCompare(b.chef) ||
      a.id.localeCompare(b.id),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / capacity)),
    pageIndex = Math.min(page, pages - 1);
  const visible = sorted.slice(
    pageIndex * capacity,
    (pageIndex + 1) * capacity,
  );
  const settings = visible.map((e) => {
    const last = e.servings.at(-1);
    return {
      id: e.id,
      chef: e.chef,
      mine: e.mine,
      served: !!last,
      plate: last?.plate ?? e.draft,
      drink: last ? last.drink : e.drink,
    };
  });
  const sceneKey = JSON.stringify(settings);
  const visit = useRef<(i: number) => void>(() => {});
  visit.current = (i) => {
    if (visible[i]) open(visible[i]);
  };
  useEffect(() => {
    const mount = host.current!;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFallback(true);
      return;
    }
    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    mount.insertBefore(renderer.domElement, mount.firstChild);
    const parsed: Setting[] = JSON.parse(sceneKey);
    const { room, anchors } = banquetModel(parsed),
      stage = batchRoom(room);
    const scene = new T.Scene(),
      camera = new T.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
    scene.add(stage, new T.HemisphereLight(0xfff0d7, 0xd3aba9, 2.1));
    const key = new T.DirectionalLight(0xffeed1, 2.4);
    key.position.set(-2.6, 11, 3.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -10,
      right: 10,
      top: 9,
      bottom: -9,
    });
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.normalBias = 0.004;
    key.shadow.bias = -0.00012;
    scene.add(key);
    let angle = 0,
      drag = false,
      moved = false,
      lastX = 0,
      startX = 0,
      startY = 0;
    const target = new T.Vector3(0, 1.42, -0.32),
      ray = new T.Raycaster(),
      projected = new T.Vector3();
    function draw() {
      const w = mount.clientWidth,
        h = mount.clientHeight;
      if (!w || !h) return;
      const yaw = (w < 600 ? 1.07 : 0.31) + angle;
      camera.position.set(
        target.x + 15 * Math.sin(yaw),
        target.y + (w < 600 ? 15 : 11),
        target.z + 15 * Math.cos(yaw),
      );
      camera.lookAt(target);
      camera.updateMatrixWorld();
      // Fit all occupied seats and the client's chair while turning on small screens.
      let halfH = 0;
      for (const x of [-5.2, 5.2])
        for (const z of [-3.42, 2.3])
          for (const y of [0, 3.5]) {
            const p = projected
              .set(x, y, z)
              .applyMatrix4(camera.matrixWorldInverse);
            halfH = Math.max(halfH, Math.abs(p.y), (Math.abs(p.x) * h) / w);
          }
      halfH *= 1.04;
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.right = (halfH * w) / h;
      camera.left = -camera.right;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
      const labels = anchors.flatMap((v, i) => {
        const button = buttons.current[i];
        if (!button) return [];
        projected.copy(v).project(camera);
        return [
          {
            button,
            i,
            x: ((projected.x + 1) * w) / 2,
            y: ((1 - projected.y) * h) / 2,
          },
        ];
      });
      if (window.matchMedia("(max-width: 600px)").matches) {
        // Keep names out of the food on a phone, with a line to each tasting plate.
        labels.sort((a, b) => a.x - b.x);
        const split = Math.ceil(labels.length / 2);
        for (const [side, column] of [
          labels.slice(0, split),
          labels.slice(split),
        ].entries()) {
          let previousBottom = 6;
          for (const { button, i, x, y } of column.sort((a, b) => a.y - b.y)) {
            const cx =
              side === 0
                ? 6 + button.offsetWidth / 2
                : w - 6 - button.offsetWidth / 2;
            const top = Math.max(
              previousBottom + 5,
              Math.min(
                h - button.offsetHeight - 6,
                y - button.offsetHeight / 2,
              ),
            );
            const cy = top + button.offsetHeight / 2;
            previousBottom = top + button.offsetHeight;
            button.style.left = cx + "px";
            button.style.top = cy + "px";
            const line = leaders.current[i];
            if (line) {
              line.setAttribute("x1", String(cx));
              line.setAttribute("y1", String(cy));
              line.setAttribute("x2", String(x));
              line.setAttribute("y2", String(y));
            }
          }
        }
      } else {
        for (const { button, x, y } of labels) {
          button.style.left = x + "px";
          button.style.top = y + "px";
        }
      }
    }
    turn.current = (delta) => {
      angle += delta;
      draw();
    };
    const canvas = renderer.domElement;
    function down(e: PointerEvent) {
      if (!e.isPrimary || e.button !== 0) return;
      drag = true;
      moved = false;
      lastX = startX = e.clientX;
      startY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
    function move(e: PointerEvent) {
      if (!drag || !e.isPrimary) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5) moved = true;
      if (moved) {
        angle += (lastX - e.clientX) * 0.008;
        draw();
      }
      lastX = e.clientX;
    }
    function up(e: PointerEvent) {
      if (!drag || !e.isPrimary) return;
      drag = false;
      if (moved) return;
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new T.Vector2(
          ((e.clientX - r.left) * 2) / r.width - 1,
          1 - ((e.clientY - r.top) * 2) / r.height,
        ),
        camera,
      );
      const hit = ray.intersectObjects(stage.children, false)[0];
      if (hit && hit.object.userData.seat !== undefined)
        visit.current(hit.object.userData.seat);
    }
    function cancel() {
      drag = false;
    }
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", cancel);
    const observer = new ResizeObserver(draw);
    observer.observe(mount);
    draw();
    return () => {
      observer.disconnect();
      turn.current = null;
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      disposeScene(stage);
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [sceneKey]);
  return (
    <section className="banquet-room" aria-label="Margo’s 3D banquet table">
      {verdict ? (
        <div className="verdict-ribbon" role="status" aria-atomic="true">
          <img src="./margo.jpg" alt="" />
          <div>
            <strong>Margo’s verdict on your plate · {verdict.score}/3</strong>
            <blockquote>“{verdict.note}”</blockquote>
            <button className="secondary" onClick={revise}>
              Revise my plate
            </button>
          </div>
        </div>
      ) : (
        <div className="banquet-caption">
          <strong>Margo Vale</strong>
          <q>I’ll be judging this blind. Leave your names on.</q>
        </div>
      )}
      <div className={"banquet-stage" + (fallback ? " no-3d" : "")} ref={host}>
        {fallback && (
          <p>
            The 3D view is unavailable on this device. Choose a place card to
            open a plate.
          </p>
        )}
        {!fallback && (
          <svg className="dish-leaders" aria-hidden="true">
            {settings.map((s, i) => (
              <line
                key={s.id}
                ref={(el) => {
                  leaders.current[i] = el;
                }}
              />
            ))}
          </svg>
        )}
        {settings.map((s, i) => (
          <button
            className={"seat-tag" + (s.mine ? " own" : "")}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            key={s.id}
            title={s.chef}
            aria-label={
              "Open " +
              s.chef +
              "’s plate" +
              (s.served ? " and Margo’s verdict" : " in progress")
            }
            onClick={() => visit.current(i)}
          >
            <strong>{s.chef}</strong>
            {!s.served && <small>In the kitchen</small>}
          </button>
        ))}
      </div>
      <div className="banquet-tools">
        {sorted.length > 1 ? (
          <select
            className="banquet-guests"
            aria-label="Find a chef’s plate"
            value=""
            onChange={(e) => {
              const entry = sorted.find((guest) => guest.id === e.target.value);
              if (entry) open(entry);
            }}
          >
            <option value="" disabled>
              Find a chef…
            </option>
            {sorted.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.chef}
                {guest.mine ? " (you)" : ""}
              </option>
            ))}
          </select>
        ) : (
          <span>
            {settings.length
              ? "Tap a plate or name card."
              : "Your team’s plates appear here as the cooks get to work."}
          </span>
        )}
        {!fallback && (
          <div>
            <button
              aria-label="Turn table view left"
              onClick={() => turn.current?.(-0.32)}
            >
              <RotateCcw size={17} />
            </button>
            <button
              aria-label="Turn table view right"
              onClick={() => turn.current?.(0.32)}
            >
              <RotateCw size={17} />
            </button>
          </div>
        )}
        {pages > 1 && (
          <div>
            <button
              disabled={pageIndex === 0}
              onClick={() => setPage(pageIndex - 1)}
            >
              Previous
            </button>
            <span>
              {pageIndex + 1} / {pages}
            </span>
            <button
              disabled={pageIndex + 1 === pages}
              onClick={() => setPage(pageIndex + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
