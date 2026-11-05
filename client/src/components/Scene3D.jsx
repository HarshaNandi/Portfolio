import { useEffect, useRef } from 'react';

// Site-wide 3D backdrop: a glossy morphing blob with candy-coloured shapes orbiting it.
// Colours morph with the section in view; the rig drifts and spins with scroll and follows the mouse.
export default function Scene3D() {
  const ref = useRef(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).has('no3d')) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      const { mergeVertices } = await import('three/examples/jsm/utils/BufferGeometryUtils.js');
      if (disposed) return;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 1.0;
      const cam = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      cam.position.set(0, 0, 10);

      const [a0, a1] = window.__acc || ['#6c4cff', '#ff3d8b'];
      const cA = new THREE.Color(a0), cB = new THREE.Color(a1);
      const tA = cA.clone(), tB = cB.clone();
      const rig = new THREE.Group(); scene.add(rig);

      // Core: smooth icosphere whose vertices ripple like a liquid blob.
      let g = new THREE.IcosahedronGeometry(1.7, 12);
      g.deleteAttribute('normal'); g.deleteAttribute('uv');
      g = mergeVertices(g, 1e-4);
      const P = g.attributes.position, base = Float32Array.from(P.array);
      const coreMat = new THREE.MeshPhysicalMaterial({ color: cA, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.6, sheenColor: cB });
      const core = new THREE.Mesh(g, coreMat); rig.add(core);

      // Satellites on tilted orbits.
      const warm = new THREE.Color('#ffc247'), mint = new THREE.Color('#2ee6b0');
      const mk = (geo, color) => {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.08 });
        const mesh = new THREE.Mesh(geo, mat); rig.add(mesh); return mesh;
      };
      const sats = [
        { m: mk(new THREE.TorusGeometry(0.5, 0.17, 24, 64), cB), r: 3.1, sp: 0.5, ph: 0, tilt: 0.5, role: 'B' },
        { m: mk(new THREE.OctahedronGeometry(0.5), cA), r: 3.7, sp: -0.38, ph: 1.4, tilt: -0.3, role: 'A' },
        { m: mk(new THREE.ConeGeometry(0.4, 0.8, 32), warm), r: 2.8, sp: 0.62, ph: 2.6, tilt: 0.9 },
        { m: mk(new THREE.SphereGeometry(0.32, 32, 24), mint), r: 4.2, sp: 0.3, ph: 3.5, tilt: 0.2 },
        { m: mk(new THREE.CapsuleGeometry(0.2, 0.55, 8, 20), cA), r: 3.4, sp: -0.55, ph: 4.4, tilt: -0.8, role: 'A' },
        { m: mk(new THREE.DodecahedronGeometry(0.38), cB), r: 4.5, sp: 0.42, ph: 5.3, tilt: 0.7, role: 'B' },
        { m: mk(new THREE.SphereGeometry(0.2, 24, 16), warm), r: 2.5, sp: -0.8, ph: 0.8, tilt: -0.5 },
        { m: mk(new THREE.TorusGeometry(0.3, 0.1, 16, 40), mint), r: 3.9, sp: 0.35, ph: 2.0, tilt: 1.1 },
      ];

      // Confetti dust.
      const N = 420, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 6 + Math.random() * 14, t = Math.random() * 6.283, u = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(u) * Math.cos(t), r * Math.sin(u) * Math.sin(t), r * Math.cos(u) - 4], i * 3);
      }
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.07, color: cB, transparent: true, opacity: 0.55, depthWrite: false });
      const dust = new THREE.Points(pg, dustMat); scene.add(dust);
      const l1 = new THREE.PointLight(0xffffff, 40, 40); l1.position.set(5, 5, 6); scene.add(l1);

      const m = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e) => { m.tx = e.clientX / innerWidth - 0.5; m.ty = e.clientY / innerHeight - 0.5; };
      window.addEventListener('pointermove', onMove);
      const resize = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
      resize(); window.addEventListener('resize', resize);

      let last = scrollY, vel = 0, spin = 0, raf, frames = 0, slow = 0, tPrev = performance.now();
      const clock = new THREE.Clock();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const now = performance.now(), dt = now - tPrev; tPrev = now;
        if (frames++ > 10 && frames < 200) { // adaptive quality for slow devices
          if (dt > 45) slow++;
          if (slow > 12 && renderer.getPixelRatio() > 0.4) { renderer.setPixelRatio(0.4); slow = 0; resize(); }
        }
        const t = clock.getElapsedTime();
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const p = scrollY / max;
        vel += ((scrollY - last) * 0.0016 - vel) * 0.1; last = scrollY; spin += vel;

        const wide = innerWidth > 860;
        const tx = wide ? Math.cos(p * Math.PI * 4) * 3.1 : 0;
        const ty = wide ? Math.sin(p * Math.PI * 6) * 0.7 : -1.6 + Math.sin(p * 9) * 0.5;
        const s = wide ? 1 : 0.6;
        rig.position.x += (tx - rig.position.x) * 0.05;
        rig.position.y += (ty + Math.sin(t) * 0.15 - rig.position.y) * 0.05;
        rig.scale.setScalar(rig.scale.x + (s - rig.scale.x) * 0.05);

        // Liquid ripple: displace every vertex along its normal direction.
        const k = 1 + Math.min(Math.abs(vel) * 25, 0.6);
        for (let i = 0; i < P.count; i++) {
          const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
          const d = 1 + 0.13 * k * Math.sin(2.1 * x + t * 1.2) * Math.sin(1.9 * y + t * 0.9) + 0.09 * Math.sin(2.6 * z + t * 1.5 + x);
          P.setXYZ(i, x * d, y * d, z * d);
        }
        P.needsUpdate = true; g.computeVertexNormals();
        core.rotation.y = t * 0.2 + p * 6; core.rotation.x = Math.sin(t * 0.3) * 0.3;

        sats.forEach((o) => {
          const a = t * o.sp + o.ph + spin * 1.5;
          o.m.position.set(o.r * Math.cos(a), o.r * Math.sin(a) * Math.sin(o.tilt) * 0.8, o.r * Math.sin(a) * Math.cos(o.tilt) * 0.8);
          o.m.rotation.x = t * 0.8 * (o.sp > 0 ? 1 : -1); o.m.rotation.y = t * 0.6;
          if (o.role === 'A') o.m.material.color.copy(cA); else if (o.role === 'B') o.m.material.color.copy(cB);
        });
        dust.rotation.y = t * 0.02 + p * 2; dust.rotation.x = p * 0.8;
        m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
        cam.position.x = m.x * 1.4; cam.position.y = -m.y * 1.0; cam.lookAt(0, 0, 0);
        rig.rotation.y = m.x * 0.7; rig.rotation.x = m.y * 0.4;

        const [n0, n1] = window.__acc || [];
        if (n0) { tA.set(n0); tB.set(n1); }
        cA.lerp(tA, 0.04); cB.lerp(tB, 0.04);
        coreMat.color.copy(cA); coreMat.sheenColor.copy(cB); dustMat.color.copy(cB);
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
