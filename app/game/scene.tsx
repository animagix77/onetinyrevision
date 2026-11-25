"use client";
import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { SVGRenderer } from "three/examples/jsm/renderers/SVGRenderer.js";
import { RotateCcw, ZoomIn, ZoomOut, Move3d, MapPin } from "lucide-react";
import { board, dish, seatFood, disposeScene, settleToppings } from "./models";
import { animatePours } from "./pour-animation";
import { staysPut, names, type Drink, type Plate } from "./rules";
type Props = {
  plate: Plate;
  roast: boolean;
  drinks?: Drink[];
  onMove?: (index: number, x: number, z: number) => void;
  dropTarget?: React.RefObject<
    | ((
        x: number,
        y: number,
        surface?: boolean,
      ) => { x: number; z: number } | null)
    | null
  >;
  onPlace?: (x: number, z: number, seconds: number) => void;
  pin?: { x: number; z: number } | null;
  label?: string;
};
export default function Scene({
  plate,
  roast,
  onPlace,
  pin,
  label,
  dropTarget,
  drinks,
  onMove,
}: Props) {
  const mount = useRef<HTMLDivElement>(null),
    api = useRef<{
      turn: (n: number) => void;
      zoom: (n: number) => void;
      draw: () => void;
      replace: () => void;
    } | null>(null),
    current = useRef({ plate, roast, onPlace, pin, drinks, onMove });
  current.current = { plate, roast, onPlace, pin, drinks, onMove };
  const [hint, setHint] = useState("");
  const marker = useRef<HTMLSpanElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const host = mount.current!;
    let renderer: T.WebGLRenderer | SVGRenderer;
    try {
      try {
        renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
      } catch {
        renderer = new SVGRenderer();
        renderer.setClearColor(new T.Color("#f0b99d"), 0);
      }
    } catch {
      setFailed(true);
      return;
    }
    host.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.OrthographicCamera(-4, 4, 3, -3, 0.1, 80);
    scene.add(new T.HemisphereLight(0xffebcf, 0xc09b9c, 2.1));
    const sun = new T.DirectionalLight(0xfff1db, 2.3);
    sun.position.set(-2.1, 9, 2.7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.normalBias = 0.003;
    sun.shadow.bias = -0.0001;
    scene.add(sun);
    const fill = new T.DirectionalLight(0xffc298, 0.65);
    fill.position.set(4, 4, -4);
    scene.add(fill);
    const floor = new T.Mesh(
      new T.PlaneGeometry(120, 120),
      new T.ShadowMaterial({ opacity: 0.28 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.012;
    floor.receiveShadow = true;
    if (renderer instanceof T.WebGLRenderer) scene.add(floor);
    let group: T.Group,
      angle = 0.53,
      zoom = 1,
      dragging = false,
      moved = false,
      sx = 0,
      sy = 0,
      last = 0,
      startTime = 0;
    const ray = new T.Raycaster(),
      plane = new T.Plane(new T.Vector3(0, 1, 0), -0.2),
      point = new T.Vector3();
    let selected: T.Object3D | null = null,
      grabbed: T.Object3D | null = null,
      initial: Plate | null = null,
      offset = { x: 0, z: 0 };
    const ring = new T.Mesh(
      new T.TorusGeometry(0.52, 0.025, 6, 40),
      new T.MeshBasicMaterial({ color: 0xa83855 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    scene.add(ring);
    function clearPick() {
      selected = grabbed = null;
      initial = null;
      ring.visible = false;
      setHint("");
    }
    function select(model: T.Object3D) {
      selected = model;
      initial = current.current.plate;
      ring.visible = true;
      setHint(
        names[initial[model.userData.portionIndex].kind] +
          " selected · Tap a new spot",
      );
      draw();
    }
    function draw() {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      const half =
        Math.max(
          current.current.roast
            ? 2.04
            : current.current.drinks?.length ||
                current.current.plate.some((f) => f.inBoat)
              ? 2.1
              : 1.65,
          ((current.current.roast
            ? 3.87
            : current.current.drinks?.length ||
                current.current.plate.some((f) => f.inBoat)
              ? 3.68
              : 2.95) *
            h) /
            w,
        ) / zoom;
      camera.left = (-half * w) / h;
      camera.right = (half * w) / h;
      camera.top = half;
      camera.bottom = -half;
      const center = current.current.roast
        ? 0.7
        : current.current.drinks?.length
          ? 0.63
          : 0.32;
      camera.position.set(
        9 * Math.sin(angle),
        center + 6.65,
        9 * Math.cos(angle),
      );
      camera.lookAt(0, center, 0);
      camera.updateProjectionMatrix();
      if (selected && ring.visible)
        ring.position.set(selected.position.x, 0.37, selected.position.z);
      renderer.render(scene, camera);
      if (marker.current && current.current.pin) {
        const { x, z } = current.current.pin!;
        const v = new T.Vector3(x, 0.62, z).project(camera);
        marker.current.style.left = (v.x + 1) * 50 + "%";
        marker.current.style.top = (1 - v.y) * 50 + "%";
      }
    }
    let lastPlate: Plate | undefined;
    let stopPour: (() => void) | undefined;
    function replace() {
      stopPour?.();
      stopPour = undefined;
      clearPick();
      if (group) {
        scene.remove(group);
        disposeScene(group);
      }
      group = current.current.roast
        ? board(current.current.plate)
        : dish(current.current.plate, current.current.drinks);
      scene.add(group);
      const next = current.current.plate;
      if (
        dropTarget &&
        lastPlate &&
        next.length > lastPlate.length &&
        lastPlate.every(
          (f, i) =>
            f.kind === next[i].kind &&
            f.x === next[i].x &&
            f.z === next[i].z &&
            f.inBoat === next[i].inBoat,
        ) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        const from = lastPlate.length;
        const pools = group.children.filter(
          (child): child is T.Mesh =>
            child instanceof T.Mesh &&
            child.userData.gravy &&
            child.userData.portionIndex >= from,
        );
        if (pools.length) stopPour = animatePours(pools, scene, draw);
      }
      lastPlate = next;
      draw();
    }
    const turn = (n: number) => {
        angle += n;
        draw();
      },
      changeZoom = (n: number) => {
        zoom = T.MathUtils.clamp(zoom + n, 0.72, 1.55);
        draw();
      };
    api.current = { draw, replace, turn, zoom: changeZoom };
    replace();
    function foodAt(x: number, y: number) {
      const r = host.getBoundingClientRect();
      ray.setFromCamera(
        new T.Vector2(
          ((x - r.left) / r.width) * 2 - 1,
          1 - ((y - r.top) / r.height) * 2,
        ),
        camera,
      );
      const obj = ray.intersectObjects(
        group.children.filter((c) => c.userData.portionIndex !== undefined),
        true,
      )[0]?.object;
      let item: T.Object3D | undefined = obj;
      while (item && item.userData.portionIndex === undefined)
        item = item.parent ?? undefined;
      return item ?? null;
    }
    function finishMove(model: T.Object3D, x: number, z: number) {
      const index = model.userData.portionIndex,
        original = current.current.plate[index];
      if (
        !original ||
        staysPut(original.kind) ||
        initial !== current.current.plate
      )
        return;
      seatFood(model, original.x, original.z);
      settleToppings(group, current.current.plate);
      const k = Math.min(1, 2.29 / Math.hypot(x, z));
      clearPick();
      draw();
      current.current.onMove?.(index, x * k, z * k);
    }
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary) return;
      dragging = true;
      moved = false;
      sx = last = e.clientX;
      sy = e.clientY;
      startTime = performance.now();
      grabbed = current.current.onMove ? foodAt(sx, sy) : null;
      const at = platePoint(sx, sy);
      offset =
        grabbed && at
          ? { x: grabbed.position.x - at.x, z: grabbed.position.z - at.z }
          : { x: 0, z: 0 };
      host.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging || !e.isPrimary) return;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 5) moved = true;
      if (moved && grabbed) {
        const food = current.current.plate[grabbed.userData.portionIndex];
        if (food && !staysPut(food.kind)) {
          if (selected !== grabbed) select(grabbed);
          const at = platePoint(e.clientX, e.clientY);
          if (at) {
            const x = at.x + offset.x,
              z = at.z + offset.z,
              k = Math.min(1, 2.29 / Math.hypot(x, z));
            seatFood(grabbed, x * k, z * k);
            stopPour?.();
            stopPour = undefined;
            settleToppings(group, current.current.plate);
            draw();
          }
        } else setHint("This portion stays put.");
      } else if (moved) turn((last - e.clientX) * 0.012);
      last = e.clientX;
    };
    const up = (e: PointerEvent) => {
      if (!dragging || !e.isPrimary) return;
      dragging = false;
      const item = grabbed;
      grabbed = null;
      const at = platePoint(e.clientX, e.clientY);
      if (moved) {
        if (item && selected === item) {
          if (at) finishMove(item, at.x + offset.x, at.z + offset.z);
          else replace();
        }
        return;
      }
      if (selected && current.current.onMove && at) {
        if (selected === item) {
          clearPick();
          draw();
        } else finishMove(selected, at.x, at.z);
        return;
      }
      if (item) {
        if (staysPut(current.current.plate[item.userData.portionIndex].kind))
          setHint("This portion stays put.");
        else select(item);
      } else if (at)
        current.current.onPlace?.(
          at.x,
          at.z,
          (performance.now() - startTime) / 1000,
        );
    };
    function platePoint(clientX: number, clientY: number, surface = false) {
      const r = host.getBoundingClientRect();
      if (
        clientX < r.left ||
        clientX > r.right ||
        clientY < r.top ||
        clientY > r.bottom
      )
        return null;
      ray.setFromCamera(
        new T.Vector2(
          ((clientX - r.left) / r.width) * 2 - 1,
          1 - ((clientY - r.top) / r.height) * 2,
        ),
        camera,
      );
      const hit =
        surface &&
        ray.intersectObjects(
          group.children.filter(
            (c) =>
              c.userData.portionIndex !== undefined &&
              !current.current.plate[c.userData.portionIndex]?.inBoat,
          ),
          true,
        )[0];
      if (hit) point.copy(hit.point);
      else if (!ray.ray.intersectPlane(plane, point)) return null;
      if (Math.hypot(point.x, point.z) > 2.34) return null;
      const k = Math.min(1, 2.29 / Math.hypot(point.x, point.z));
      return { x: point.x * k, z: point.z * k };
    }
    if (dropTarget) dropTarget.current = platePoint;
    const cancel = () => {
      dragging = false;
      replace();
    };
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", cancel);
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    return () => {
      stopPour?.();
      if (dropTarget) dropTarget.current = null;
      observer.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", cancel);
      disposeScene(group);
      ring.geometry.dispose();
      ring.material.dispose();
      floor.geometry.dispose();
      floor.material.dispose();
      sun.shadow.dispose();
      if (renderer instanceof T.WebGLRenderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
      renderer.domElement.remove();
      api.current = null;
    };
  }, []);
  useEffect(() => {
    api.current?.replace();
  }, [plate, roast, drinks]);
  useEffect(() => {
    api.current?.draw();
  }, [pin]);
  return (
    <div className="scene">
      <div
        className="mesh"
        ref={mount}
        role="img"
        aria-label={
          roast
            ? "Rotatable 3D roast turkey on a carving board"
            : "Rotatable 3D Thanksgiving plate"
        }
      />
      <span className="view-tag">
        <i />
        {label || (roast ? "CARVING BOARD" : "YOUR PLATE")}
      </span>
      {hint && (
        <span className="move-tip" role="status">
          {hint}
        </span>
      )}
      {pin && (
        <span className="pin" ref={marker}>
          <a href="#client-verdict" aria-label="Read Margo’s note at this spot">
            <MapPin size={23} />
          </a>
        </span>
      )}
      {failed && (
        <p className="scene-error">
          3D preview unavailable. Use the controls below to build your plate.
        </p>
      )}
      <div className="camera">
        <button
          title="Rotate view"
          aria-label="Rotate view"
          onClick={() => api.current?.turn(0.55)}
        >
          <RotateCcw />
        </button>
        <button
          title="Zoom out"
          aria-label="Zoom out"
          onClick={() => api.current?.zoom(-0.13)}
        >
          <ZoomOut />
        </button>
        <button
          title="Zoom in"
          aria-label="Zoom in"
          onClick={() => api.current?.zoom(0.13)}
        >
          <ZoomIn />
        </button>
      </div>
      <span className="drag">
        <Move3d size={14} />
        Drag to rotate
      </span>
    </div>
  );
}
