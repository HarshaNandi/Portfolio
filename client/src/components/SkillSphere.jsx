import { useEffect, useRef } from 'react';
import { GROUP_COLORS as COLORS } from './colors.js';

// Interactive 3D tag-sphere: skills sit on a rotating sphere you can drag; far labels fade back.
export default function SkillSphere({ skills }) {
  const ref = useRef(null);
  useEffect(() => {
    if (new URLSearchParams(location.search).has('no3d')) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      try { await document.fonts?.ready; } catch { /* ignore */ }
      if (disposed) return;
      const canvas = ref.current;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 50); cam.position.z = 10.8;
      const group = new THREE.Group(); scene.add(group);
      const fam = getComputedStyle(document.body).fontFamily;

      const label = (text, color) => {
        const c = document.createElement('canvas'), ctx = c.getContext('2d');
        const font = `600 44px ${fam}`; ctx.font = font;
        const w = Math.ceil(ctx.measureText(text).width) + 60, h = 84;
        c.width = w; c.height = h; ctx.font = font;
        const gr = ctx.createLinearGradient(0, 0, w, h); gr.addColorStop(0, color); gr.addColorStop(1, '#00000055');
        ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 40); ctx.fill();
        ctx.fillStyle = gr; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.stroke();
        const sh = ctx.createLinearGradient(0, 0, 0, h / 2); sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sh; ctx.beginPath(); ctx.roundRect(8, 6, w - 16, h / 2 - 6, 34); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, w / 2, h / 2 + 2);
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        const sc = 0.44; spr.scale.set((w / h) * sc, sc, 1); spr.userData.base = spr.scale.clone();
        return spr;
      };

      const items = skills.flatMap((g, gi) => g.items.map((t) => ({ t, gi })));
      const n = items.length, R = 3.1;
      const sprites = items.map((it, i) => {
        const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
        const s = label(it.t, COLORS[it.gi % COLORS.length]);
        s.position.set(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R); group.add(s); return s;
      });
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.97, 2),
        new THREE.MeshBasicMaterial({ color: 0x8b7cff, wireframe: true, transparent: true, opacity: 0.1, depthTest: false, depthWrite: false }));
      shell.renderOrder = -1; group.add(shell);
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 48, 32),
        new THREE.MeshStandardMaterial({ color: 0x8b6bff, emissive: 0x5a3df0, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.1 }));
      group.add(coreMesh);
      const mkRing = (rad, col, tiltX, tiltZ) => {
        const r = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.014, 8, 220), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
        r.rotation.set(tiltX, 0, tiltZ); group.add(r); return r;
      };
      const ringA = mkRing(R * 1.04, 0xff4d8d, Math.PI / 2.1, 0), ringB = mkRing(R * 1.12, 0x2f80ff, Math.PI / 2.6, 0.5);
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const pl = new THREE.PointLight(0xffffff, 40, 40); pl.position.set(4, 4, 8); scene.add(pl);

      const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize); ro.observe(canvas);

      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let hover = null;
      let drag = false, lx = 0, ly = 0, vx = 0, vy = 0, visible = true, raf;
      const down = (e) => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; };
      const move = (e) => {
        if (!drag) {
          const r = canvas.getBoundingClientRect();
          ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
          ray.setFromCamera(ndc, cam);
          const hit = ray.intersectObjects(sprites, false).find((h) => h.object.material.opacity > 0.45);
          hover = hit ? hit.object : null; canvas.style.cursor = hover ? 'pointer' : 'grab';
          return;
        } vy = (e.clientX - lx) * 0.006; vx = (e.clientY - ly) * 0.006; lx = e.clientX; ly = e.clientY; };
      const up = () => { drag = false; canvas.style.cursor = 'grab'; };
      canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up); canvas.addEventListener('pointerleave', () => { hover = null; }); canvas.addEventListener('pointercancel', up);
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(canvas);

      const v = new THREE.Vector3();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        group.rotation.y += (hover ? 0.0008 : 0.004) + vy; ringA.rotation.z += 0.004; ringB.rotation.z -= 0.003; coreMesh.scale.setScalar(1 + Math.sin(performance.now() / 600) * 0.05); group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + vx));
        if (!drag) { vx *= 0.94; vy *= 0.94; } else { vx *= 0.8; vy *= 0.8; }
        group.updateMatrixWorld(true);
        sprites.forEach((s) => {
          s.getWorldPosition(v);
          const k = (v.z + R) / (2 * R);
          s.material.opacity = s === hover ? 1 : 0.2 + 0.8 * k;
          s.scale.copy(s.userData.base).multiplyScalar((0.75 + 0.5 * k) * (s === hover ? 1.35 : 1));
        });
        renderer.render(scene, cam);
      };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
        canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
        renderer.dispose();
      };
    })();
    return () => { disposed = true; cleanup(); };
  }, [skills]);
  return (
    <div className="sphere-box reveal">
      <canvas ref={ref} className="sphere" aria-label="Interactive 3D sphere of my skills" />
      <span className="sphere-hint">Drag to spin</span>
    </div>
  );
}
