import { useEffect, useRef } from 'react';
import { createScreens } from './devScreens.js';

// Site-wide 3D backdrop: a developer's laptop typing real code, ringed by floating terminal / API / Python /
// dashboard windows and glowing 3D code symbols. A scroll-driven camera flies through the page, and the
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
      const screens = createScreens(THREE);

      // ---- Laptop ----
      const laptop = new THREE.Group(); laptop.position.y = -0.9; laptop.scale.setScalar(1.1); rig.add(laptop);
      const metal = new THREE.MeshStandardMaterial({ color: 0x2a2e44, metalness: 0.85, roughness: 0.32 });
      laptop.add(new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 2.2), metal));
      const keys = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.35), new THREE.MeshBasicMaterial({ map: screens.keyboard }));
      keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.062, -0.22); laptop.add(keys);
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), new THREE.MeshStandardMaterial({ color: 0x1c2036, metalness: 0.4, roughness: 0.5 }));
      pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.062, 0.72); laptop.add(pad);
      const lid = new THREE.Group(); lid.position.set(0, 0.06, -1.1); lid.rotation.x = -0.22; laptop.add(lid);
      const shell = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.2, 0.08), metal); shell.position.y = 1.1; lid.add(shell);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.06, 1.91), new THREE.MeshBasicMaterial({ map: screens.editor.tex, toneMapped: false }));
      screen.position.set(0, 1.1, 0.045); lid.add(screen);
      const logoMat = new THREE.MeshBasicMaterial({ color: cA });
      const logo = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), logoMat); logo.position.set(0, 1.1, -0.045); logo.rotation.y = Math.PI; lid.add(logo);
      const screenGlow = new THREE.PointLight(cA, 14, 9); screenGlow.position.set(0, 1.1, 1.6); lid.add(screenGlow);

      // ---- Floating windows ----
      const panelDefs = [
        { s: screens.terminal, r: 4.3, y: 1.7, a: 0.0 }, { s: screens.dash, r: 4.6, y: -1.7, a: Math.PI / 2 },
        { s: screens.api, r: 4.2, y: 1.5, a: Math.PI }, { s: screens.py, r: 4.7, y: -2.0, a: (3 * Math.PI) / 2 },
      ];
      const panels = panelDefs.map((d) => {
        const w = 2.15, h = (w * d.s.h) / d.s.w;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: d.s.tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }));
        rig.add(m); return { ...d, m };
      });

      // ---- Glowing 3D code symbols ----
      const font = new FontLoader().parse(fontJson);
      const warm = new THREE.Color('#ffc247'), mint = new THREE.Color('#2ee6b0');
      const mkSym = (txt, color, size, depth = 0.22) => {
        const g = new TextGeometry(txt, { font, size, depth, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 });
        g.center();
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.25, emissive: color, emissiveIntensity: 0.4 });
        const mesh = new THREE.Mesh(g, mat); rig.add(mesh); return mesh;
      };
      const syms = [
        { m: mkSym('</>', cA, 0.7), r: 3.4, sp: 0.35, ph: 0.4, y: 0.9, role: 'A' },
        { m: mkSym('{ }', cB, 0.7), r: 3.9, sp: -0.28, ph: 2.0, y: -0.2, role: 'B' },
        { m: mkSym(';', warm, 0.9), r: 3.1, sp: 0.5, ph: 3.5, y: 2.2, role: '' },
        { m: mkSym('#', mint, 0.8), r: 4.5, sp: -0.22, ph: 4.6, y: 0.6, role: '' },
        { m: mkSym('( )', cA, 0.6), r: 3.7, sp: 0.3, ph: 5.6, y: -1.4, role: 'A' },
        { m: mkSym('=>', cB, 0.6), r: 4.1, sp: -0.4, ph: 1.2, y: -2.4, role: 'B' },
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

        // live screens (~11 fps)
        if (now - tickAt > 90) { tickAt = now; screens.editor.tick(t); screens.terminal.tick(t); screens.py.tick(t); screens.dash.tick(t); }

        m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05;
        laptop.rotation.y = Math.sin(st.ry) * 0.45 + m.x * 0.7 + Math.sin(t * 0.4) * 0.08;
        laptop.rotation.x = m.y * 0.15;
        lid.rotation.x = -0.22 + Math.sin(t * 0.6) * 0.015;

        cam.position.set(m.x * 1.2 + st.cx, -m.y * 0.9 + st.cy, st.cz + (wide ? 0 : 2.5));
        cam.lookAt(0, 0, 0); cam.rotateZ(st.roll);

        panels.forEach((d, i) => {
          const a = place(d.m, d.r * st.orbit, 0.12, d.a, d.y, t, true, i);
          rig.getWorldQuaternion(qTmp).invert().multiply(cam.quaternion);          // face the camera
          eTmp.set(Math.sin(t * 0.5 + i) * 0.1, Math.cos(t * 0.4 + i) * 0.12, 0);
          d.m.quaternion.copy(qTmp).multiply(new THREE.Quaternion().setFromEuler(eTmp));
          const k = (Math.sin(a) + 1) / 2;                                           // 1 = nearest the camera
          d.m.material.opacity = 0.95 - 0.5 * k;
          d.m.scale.setScalar(0.85 + 0.15 * (1 - k));
        });
        syms.forEach((s, i) => {
          place(s.m, s.r * st.orbit, s.sp * 0.6, s.ph, s.y, t, false, i);
          s.m.rotation.y = t * 0.6 * (i % 2 ? -1 : 1); s.m.rotation.x = Math.sin(t * 0.5 + i) * 0.4;
          if (s.role === 'A') { s.m.material.color.copy(cA); s.m.material.emissive.copy(cA); } else if (s.role === 'B') { s.m.material.color.copy(cB); s.m.material.emissive.copy(cB); }
        });
        dust.rotation.y = t * 0.02 + p * 2; dust.rotation.x = p * 0.8;

        const [n0, n1] = window.__acc || [];
        if (n0) { tA.set(n0); tB.set(n1); }
        cA.lerp(tA, 0.04); cB.lerp(tB, 0.04);
        logoMat.color.copy(cA); screenGlow.color.copy(cA); l2.color.copy(cB); dustMat.color.copy(cB);
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
