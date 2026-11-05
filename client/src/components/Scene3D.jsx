import { useEffect, useRef } from 'react';

// Site-wide 3D backdrop: a metallic torus-knot, wire icosahedron, rings and particles.
// Colours morph with the section in view; the whole rig drifts and spins with scroll.
export default function Scene3D() {
  const ref = useRef(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).has('no3d')) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const cam = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      cam.position.set(0, 0, 10);

      const [a0, a1] = window.__acc || ['#7c5cff', '#ff4d8d'];
      const cA = new THREE.Color(a0), cB = new THREE.Color(a1);
      const tA = cA.clone(), tB = cB.clone();

      const rig = new THREE.Group(); scene.add(rig);
      const knotMat = new THREE.MeshStandardMaterial({ color: cA, metalness: 0.85, roughness: 0.2, emissive: cA, emissiveIntensity: 0.12 });
      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.48, 180, 24, 2, 3), knotMat); rig.add(knot);
      const wireMat = new THREE.MeshBasicMaterial({ color: cB, wireframe: true, transparent: true, opacity: 0.22 });
      const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(3.3, 1), wireMat); rig.add(wire);
      const ringMat = new THREE.MeshBasicMaterial({ color: cB, transparent: true, opacity: 0.5 });
      const rings = [2.5, 3.1, 3.7].map((r, i) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), ringMat);
        m.rotation.set(Math.PI / 2.3 + i * 0.5, i * 0.7, 0); rig.add(m); return m;
      });
      const N = 500, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 6 + Math.random() * 14, t = Math.random() * 6.283, u = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(u) * Math.cos(t), r * Math.sin(u) * Math.sin(t), r * Math.cos(u) - 4], i * 3);
      }
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }));
      scene.add(dust);
      const l1 = new THREE.PointLight(cA, 60, 40); l1.position.set(5, 4, 6); scene.add(l1);
      const l2 = new THREE.PointLight(cB, 60, 40); l2.position.set(-6, -3, 5); scene.add(l2);

      const m = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e) => { m.tx = e.clientX / innerWidth - 0.5; m.ty = e.clientY / innerHeight - 0.5; };
      window.addEventListener('pointermove', onMove);
      const resize = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
      resize(); window.addEventListener('resize', resize);

      let last = scrollY, vel = 0, spin = 0, raf, frames = 0, slow = 0, tPrev = performance.now();
      const clock = new THREE.Clock();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        // Adaptive quality: on slow devices drop the render resolution so the page stays responsive.
        const now = performance.now(), dt = now - tPrev; tPrev = now;
        if (frames++ > 10 && frames < 200) {
          if (dt > 45) slow++;
          if (slow > 12 && renderer.getPixelRatio() > 0.4) { renderer.setPixelRatio(0.4); slow = 0; resize(); }
        }
        const t = clock.getElapsedTime();
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const p = scrollY / max;
        vel += ((scrollY - last) * 0.0016 - vel) * 0.1; last = scrollY;
        spin += vel;
        const wide = innerWidth > 860;
        const tx = wide ? Math.cos(p * Math.PI * 4) * 3.1 : 0;
        const ty = wide ? Math.sin(p * Math.PI * 6) * 0.7 : -1.6 + Math.sin(p * 9) * 0.5;
        const s = wide ? 1 : 0.62;
        rig.position.x += (tx - rig.position.x) * 0.05;
        rig.position.y += (ty + Math.sin(t) * 0.15 - rig.position.y) * 0.05;
        rig.scale.setScalar(rig.scale.x + (s - rig.scale.x) * 0.05);
        knot.rotation.x = t * 0.25 + spin * 2; knot.rotation.y = t * 0.35 + p * 9;
        wire.rotation.y = -t * 0.12 + spin; wire.rotation.x = t * 0.08;
        rings.forEach((r, i) => { r.rotation.z = t * (0.15 + i * 0.07) * (i % 2 ? -1 : 1); });
        dust.rotation.y = t * 0.02 + p * 2; dust.rotation.x = p * 0.8;
        m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
        cam.position.x = m.x * 1.4; cam.position.y = -m.y * 1.0; cam.lookAt(0, 0, 0);
        rig.rotation.y = m.x * 0.8; rig.rotation.x = m.y * 0.5;
        const [n0, n1] = window.__acc || [];
        if (n0) { tA.set(n0); tB.set(n1); }
        cA.lerp(tA, 0.04); cB.lerp(tB, 0.04);
        knotMat.color.copy(cA); knotMat.emissive.copy(cA); wireMat.color.copy(cB); ringMat.color.copy(cB);
        l1.color.copy(cA); l2.color.copy(cB);
        renderer.render(scene, cam);
      };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', resize);
        renderer.dispose(); pmrem.dispose();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, []);
  return <canvas ref={ref} className="scene" aria-hidden="true" />;
}
