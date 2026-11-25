import * as T from "three";

// The settled mesh already follows the food. Reveal its rings from the impact
// point outwards while a ladle releases a short, tapering ribbon of gravy.
export function animatePours(
  pools: T.Mesh[],
  scene: T.Scene,
  render: () => void,
) {
  const steel = new T.MeshStandardMaterial({
    color: "#bab7af",
    metalness: 0.32,
    roughness: 0.37,
    side: T.DoubleSide,
  });
  const pours = pools.map((pool) => {
    const prop = new T.Group();
    const surface = pool.geometry.attributes.position.getY(0);
    prop.position.set(pool.position.x, surface, pool.position.z);
    const ladle = new T.Group();
    const bowl = new T.Mesh(
      new T.SphereGeometry(
        0.19,
        20,
        10,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI / 2,
      ),
      steel,
    );
    bowl.scale.y = 0.75;
    const handle = new T.Mesh(
      new T.CylinderGeometry(0.024, 0.026, 0.66, 8),
      steel,
    );
    handle.rotation.z = -1.1;
    handle.position.set(0.43, 0.13, 0);
    ladle.add(bowl, handle);
    const stream = new T.Mesh(
      new T.CylinderGeometry(0.043, 0.063, 1, 12),
      pool.material,
    );
    prop.add(ladle, stream);
    prop.visible = false;
    scene.add(prop);
    pool.geometry.setDrawRange(0, 0);
    return { pool, prop, ladle, stream };
  });
  let frame = 0,
    finished = false;
  function clean() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    for (const { pool, prop } of pours) {
      pool.geometry.setDrawRange(0, Infinity);
      scene.remove(prop);
      prop.traverse((o) => {
        if (o instanceof T.Mesh) o.geometry.dispose();
      });
    }
    steel.dispose();
  }
  const start = performance.now();
  function tick(now: number) {
    let complete = true;
    pours.forEach(({ pool, prop, ladle, stream }, i) => {
      const t = (now - start - i * 120) / 850;
      prop.visible = t >= 0 && t < 1;
      if (t >= 1) {
        pool.geometry.setDrawRange(0, Infinity);
        return;
      }
      complete = false;
      if (t < 0) return;
      const reach = T.MathUtils.smoothstep(t, 0.03, 0.24);
      const drain = T.MathUtils.smoothstep(t, 0.66, 0.88);
      const height = 0.92 + 0.09 * Math.cos(t * Math.PI * 2);
      ladle.position.set(0.15, height + 0.1 + 0.17 * drain, 0);
      ladle.rotation.z = 0.22 + 0.55 * Math.sin(t * Math.PI);
      const top = height * (1 - drain),
        bottom = height * (1 - reach);
      stream.position.y = (top + bottom) / 2;
      stream.visible = top > bottom && t < 0.88;
      stream.scale.set(
        0.85 + 0.18 * Math.sin(t * 12),
        Math.max(0.001, top - bottom),
        1,
      );
      const spread = Math.sqrt(T.MathUtils.smoothstep(t, 0.16, 0.97));
      const indices = pool.geometry.index!.count;
      pool.geometry.setDrawRange(0, 3 * Math.floor((spread * indices) / 3));
    });
    if (complete) clean();
    else frame = requestAnimationFrame(tick);
    render();
  }
  frame = requestAnimationFrame(tick);
  return clean;
}
