import { useEffect, useRef } from 'react';

// Site-wide 3D backdrop: a glowing neural-network orb with data pulses racing along its links, ringed by
// orbiting rings and glowing 3D code symbols. A scroll-driven camera flies through the page, and the
// accent colours morph with the section in view.
export default function Scene3D() {
  const ref = useRef(null);
  useEffect(() => {
    { const q = new URLSearchParams(location.search); if (q.has('no3d') || q.has('nobg')) return; }
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
      const { TextGeometry } = await import('three/examples/jsm/geometries/TextGeometry.js');
      const fontJson = (await import('three/examples/fonts/helvetiker_bold.typeface.json')).default;
      try { await document.fonts?.ready; } catch { /* ignore */ }
      if (disposed) return;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: ref.current, antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.9;
      const cam = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      cam.position.set(0, 0, 10);

      const [a0, a1] = window.__acc || ['#7c5cff', '#ff4d8d'];
      const cA = new THREE.Color(a0), cB = new THREE.Color(a1);
      const tA = cA.clone(), tB = cB.clone();
      const rig = new THREE.Group(); scene.add(rig);

      // ---- Neural-network orb: nodes on two shells, links between near neighbours, pulses racing along them ----
      const orb = new THREE.Group(); rig.add(orb);
      const glowTex = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
        const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
      })();
      const pts = [];
      const OUT = 110, INN = 34;
      for (let i = 0; i < OUT; i++) {
        const y = 1 - (i / (OUT - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, R = 2.5 + (Math.random() - 0.5) * 0.35;
        pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R));
      }
      for (let i = 0; i < INN; i++) {
        const y = 1 - (i / (INN - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.4 + 1, R = 1.25 + (Math.random() - 0.5) * 0.3;
        pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R));
      }
      const edges = [], adj = pts.map(() => []);
      for (let i = 0; i < pts.length; i++) {
        const near = pts.map((p, j) => [p.distanceTo(pts[i]), j]).filter(([d, j]) => j !== i && d < (i < OUT ? 1.0 : 1.45)).sort((a, b) => a[0] - b[0]).slice(0, 4);
        near.forEach(([, j]) => { if (!edges.some(([u, v]) => (u === i && v === j) || (u === j && v === i))) { edges.push([i, j]); adj[i].push(j); adj[j].push(i); } });
      }
      const lp = new Float32Array(edges.length * 6), lc = new Float32Array(edges.length * 6);
      edges.forEach(([i, j], k) => { pts[i].toArray(lp, k * 6); pts[j].toArray(lp, k * 6 + 3); });
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('color', new THREE.BufferAttribute(lc, 3));
      const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false });
      orb.add(new THREE.LineSegments(lg, lineMat));
      const mkPoints = (arr, size, opacity) => {
        const g = new THREE.BufferGeometry(); const pa = new Float32Array(arr.length * 3); arr.forEach((v, i) => v.toArray(pa, i * 3));
        g.setAttribute('position', new THREE.BufferAttribute(pa, 3));
        const mat = new THREE.PointsMaterial({ size, map: glowTex, transparent: true, opacity, depthWrite: false, sizeAttenuation: true });
        const p = new THREE.Points(g, mat); orb.add(p); return mat;
      };
      const outerMat = mkPoints(pts.slice(0, OUT), 0.34, 1), innerMat = mkPoints(pts.slice(OUT), 0.22, 0.9);
      // pulses
      const PN = 26, pulse = Array.from({ length: PN }, () => { const e = edges[Math.floor(Math.random() * edges.length)]; return { a: e[0], b: e[1], u: Math.random(), sp: 0.5 + Math.random() * 0.9 }; });
      const pp = new Float32Array(PN * 3), pg2 = new THREE.BufferGeometry(); pg2.setAttribute('position', new THREE.BufferAttribute(pp, 3));
      const pulseMat = new THREE.PointsMaterial({ size: 0.5, map: glowTex, transparent: true, opacity: 1, depthWrite: false, color: 0xffffff });
      orb.add(new THREE.Points(pg2, pulseMat));
      // core glow
      const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: cA, transparent: true, opacity: 0.9, depthWrite: false }));
      coreGlow.scale.setScalar(3.4); orb.add(coreGlow);
      const coreDot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); orb.add(coreDot);
      const mkRing = (rad, col, tx, tz) => { const r = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.012, 8, 240), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 })); r.rotation.set(tx, 0, tz); rig.add(r); return r; };
      const ringA = mkRing(3.3, cB, Math.PI / 2.2, 0), ringB = mkRing(3.75, cA, Math.PI / 2.7, 0.6);

      // ---- Glowing 3D code symbols ----
      const font = new FontLoader().parse(fontJson);
      const warm = new THREE.Color('#ffc247');
      const mkSym = (txt, color, size, depth = 0.22) => {
        const g = new TextGeometry(txt, { font, size, depth, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 });
        g.center();
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.25, emissive: color, emissiveIntensity: 0.45 });
        const mesh = new THREE.Mesh(g, mat); rig.add(mesh); return mesh;
      };
      const syms = [
        { m: mkSym('</>', cA, 0.62), r: 4.3, sp: 0.35, ph: 0.4, y: 1.5, role: 'A' },
        { m: mkSym('{ }', cB, 0.62), r: 4.7, sp: -0.28, ph: 2.4, y: -0.9, role: 'B' },
        { m: mkSym(';', warm, 0.8), r: 4.1, sp: 0.5, ph: 3.9, y: 2.3, role: '' },
        { m: mkSym('=>', cB, 0.55), r: 4.5, sp: -0.4, ph: 5.3, y: -2.2, role: 'B' },
      ];

      // ---- Dust ----
      const N = 420, pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 6 + Math.random() * 14, t = Math.random() * 6.283, u = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(u) * Math.cos(t), r * Math.sin(u) * Math.sin(t), r * Math.cos(u) - 4], i * 3);
      }
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const dustMat = new THREE.PointsMaterial({ size: 0.07, color: cB, transparent: true, opacity: 0.55, depthWrite: false });
      const dust = new THREE.Points(pg, dustMat); scene.add(dust);
      const l1 = new THREE.PointLight(0xffffff, 40, 40); l1.position.set(5, 5, 6); scene.add(l1);
      const l2 = new THREE.PointLight(cB, 25, 30); l2.position.set(-6, -2, 4); scene.add(l2);

      const m = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e) => { m.tx = e.clientX / innerWidth - 0.5; m.ty = e.clientY / innerHeight - 0.5; };
      window.addEventListener('pointermove', onMove);
      const resize = () => { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
      resize(); window.addEventListener('resize', resize);

      // Scroll-driven camera: one keyframe per section; the rig eases between them.
      const IDS = ['home', 'work', 'story', 'projects', 'toolbox', 'cta'];
      const KF = [
        { x: 3.0, y: 0.2, s: 1.0, ry: 0.0, cz: 10.0, cx: 0.0, cy: 0.0, orbit: 1.0, roll: 0 },
        { x: -3.3, y: -0.2, s: 1.15, ry: 1.3, cz: 9.2, cx: 0.8, cy: 0.4, orbit: 1.15, roll: 0.04 },
        { x: 3.5, y: 0.1, s: 1.0, ry: -1.0, cz: 9.8, cx: -0.7, cy: -0.1, orbit: 0.95, roll: -0.04 },
        { x: -3.5, y: 0.0, s: 1.2, ry: 2.1, cz: 9.0, cx: 0.0, cy: 0.5, orbit: 1.2, roll: 0.05 },
        { x: 3.7, y: 2.0, s: 0.6, ry: -2.3, cz: 11.5, cx: 0.0, cy: -0.3, orbit: 1.0, roll: -0.05 },
        { x: 3.9, y: 0.0, s: 1.05, ry: 3.3, cz: 9.8, cx: -0.4, cy: 0.2, orbit: 1.0, roll: 0 },
      ];
      let tops = [];
      const measure = () => { tops = IDS.map((id) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + scrollY : 0; }); };
      measure(); window.addEventListener('resize', measure);
      const st = { ...KF[0] };
      const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

      let last = scrollY, vel = 0, spin = 0, raf, frames = 0, slow = 0, tPrev = performance.now(), tickAt = 0;
      const clock = new THREE.Clock(), qTmp = new THREE.Quaternion(), eTmp = new THREE.Euler();
      const place = (obj, r, sp, ph, y, t, billboard, i) => {
        const a = t * sp + ph + spin * 1.5 + st.ry * 0.5;
        obj.position.set(Math.cos(a) * r, y + Math.sin(t * 0.8 + i) * 0.14, Math.sin(a) * r * 0.5);
        return a;
      };
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
        if (frames % 90 === 0) measure();
        const pos2 = scrollY + innerHeight * 0.45;
        let si = 0; while (si < IDS.length - 1 && pos2 >= tops[si + 1]) si++;
        const nextTop = tops[si + 1] ?? tops[si] + innerHeight * 1.5;
        const f = Math.min(1, Math.max(0, (pos2 - tops[si]) / Math.max(1, nextTop - tops[si])));
        const e = si >= IDS.length - 1 ? 0 : smooth(0.5, 1, f);
        const A = KF[si], B = KF[Math.min(si + 1, KF.length - 1)];
        for (const key of Object.keys(st)) st[key] += (A[key] + (B[key] - A[key]) * e - st[key]) * 0.06;
        const tx = wide ? st.x : 0, ty = wide ? st.y : -1.4 + Math.sin(p * 9) * 0.4, sc = wide ? st.s : st.s * 0.55;
        rig.position.x += (tx - rig.position.x) * 0.08;
        rig.position.y += (ty + Math.sin(t) * 0.12 - rig.position.y) * 0.08;
        rig.scale.setScalar(rig.scale.x + (sc - rig.scale.x) * 0.08);

        m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
        cam.position.set(m.x * 1.2 + st.cx, -m.y * 0.9 + st.cy, st.cz + (wide ? 0 : 2.5));
        cam.lookAt(0, 0, 0); cam.rotateZ(st.roll);

        // orb: slow spin (faster while scrolling), gentle breathing, pulses hopping along links
        orb.rotation.y = t * 0.16 + st.ry * 0.5 + spin * 2; orb.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.1 + m.y * 0.3;
        orb.scale.setScalar(1 + Math.sin(t * 1.4) * 0.025);
        ringA.rotation.z += 0.004; ringB.rotation.z -= 0.003; ringA.scale.setScalar(st.orbit); ringB.scale.setScalar(st.orbit);
        const dark = document.documentElement.dataset.theme !== 'light';
        const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        if (outerMat.blending !== blend) { [outerMat, innerMat, pulseMat, coreGlow.material].forEach((mm) => { mm.blending = blend; mm.needsUpdate = true; }); lineMat.blending = blend; lineMat.needsUpdate = true; }
        pulse.forEach((u, i) => {
          u.u += dt * 0.001 * u.sp;
          if (u.u >= 1) { const next = adj[u.b][Math.floor(Math.random() * adj[u.b].length)] ?? u.a; u.a = u.b; u.b = next; u.u = 0; }
          const A2 = pts[u.a], B2 = pts[u.b];
          pp[i * 3] = A2.x + (B2.x - A2.x) * u.u; pp[i * 3 + 1] = A2.y + (B2.y - A2.y) * u.u; pp[i * 3 + 2] = A2.z + (B2.z - A2.z) * u.u;
        });
        pg2.attributes.position.needsUpdate = true;
        // gradient colours along the links (accent A → accent B by height)
        for (let k = 0; k < edges.length * 2; k++) {
          const yy = Math.min(1, Math.max(0, (lp[k * 3 + 1] / 2.8 + 1) / 2));
          lc[k * 3] = cA.r + (cB.r - cA.r) * yy; lc[k * 3 + 1] = cA.g + (cB.g - cA.g) * yy; lc[k * 3 + 2] = cA.b + (cB.b - cA.b) * yy;
        }
        lg.attributes.color.needsUpdate = true;

        syms.forEach((s, i) => {
          place(s.m, s.r * st.orbit, s.sp * 0.6, s.ph, s.y, t, false, i);
          s.m.rotation.y = t * 0.6 * (i % 2 ? -1 : 1); s.m.rotation.x = Math.sin(t * 0.5 + i) * 0.4;
          if (s.role === 'A') { s.m.material.color.copy(cA); s.m.material.emissive.copy(cA); } else if (s.role === 'B') { s.m.material.color.copy(cB); s.m.material.emissive.copy(cB); }
        });
        dust.rotation.y = t * 0.02 + p * 2; dust.rotation.x = p * 0.8;

        const [n0, n1] = window.__acc || [];
        if (n0) { tA.set(n0); tB.set(n1); }
        cA.lerp(tA, 0.04); cB.lerp(tB, 0.04);
        outerMat.color.copy(cA); innerMat.color.copy(cB); pulseMat.color.copy(cB).lerp(new THREE.Color(0xffffff), 0.5); coreGlow.material.color.copy(cA);
        ringA.material.color.copy(cB); ringB.material.color.copy(cA); l2.color.copy(cB); dustMat.color.copy(cB);
        renderer.render(scene, cam);
      };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', resize); window.removeEventListener('resize', measure);
        renderer.dispose(); pmrem.dispose();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, []);
  return <canvas ref={ref} className="scene" aria-hidden="true" />;
}
