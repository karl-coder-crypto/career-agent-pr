import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getSceneType = (pathname) => {
  if (pathname === '/') return 'core-pulse';
  if (pathname.includes('/consultant')) return 'neural-mesh';
  if (pathname.includes('/opportunities')) return 'data-stream';
  if (pathname.includes('/resume-checker')) return 'laser-grid';
  if (pathname.includes('/resume-builder')) return 'laser-grid';
  if (pathname.includes('/dsa-sniper')) return 'tactical-sonar';
  if (pathname.includes('/mock-interview')) return 'fluid-blob';
  if (pathname.includes('/networking-hub')) return 'constellation';
  if (pathname.includes('/skill-architect')) return 'geo3d';
  return 'core-pulse';
};

const CanvasScene = ({ type }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const clickRipples = useRef([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animId;
    let time = 0;
    let nodes = [];
    let stars = [];
    let streams = [];
    let sonarRings = [];
    let sonarTimer = 0;
    let blobPhase = 0;
    let rotX = 0, rotY = 0;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    if (type === 'neural-mesh') {
      const count = Math.min(55, Math.floor(W * H / 18000));
      for (let i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, ox: 0, oy: 0 });
      }
    }

    if (type === 'data-stream') {
      const cols = Math.floor(W / 38);
      for (let i = 0; i < cols; i++) {
        streams.push({ x: i * 38 + 19, y: Math.random() * H, speed: Math.random() * 0.8 + 0.3, len: Math.random() * 120 + 60, chars: Array.from({ length: 8 }, () => Math.random() > 0.5 ? '$' : '%') });
      }
    }

    if (type === 'constellation') {
      const count = Math.min(80, Math.floor(W * H / 12000));
      for (let i = 0; i < count; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 });
      }
    }

    if (type === 'tactical-sonar') {
      for (let i = 0; i < 3; i++) {
        sonarRings.push({ r: Math.random() * Math.max(W, H) * 0.5, speed: Math.random() * 0.6 + 0.3, maxR: Math.max(W, H) * 0.55 });
      }
    }

    const cubeVerts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const cubeEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (type === 'geo3d') {
        rotX = (e.clientY / H - 0.5) * 0.6;
        rotY = (e.clientX / W - 0.5) * 0.6;
      }
    };

    const handleClick = (e) => {
      if (type === 'laser-grid') {
        clickRipples.current.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.5 });
      }
      if (type === 'tactical-sonar') {
        sonarRings.push({ r: 0, speed: 1.2, maxR: Math.max(W, H) * 0.55, cx: e.clientX, cy: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const project3D = (vx, vy, vz, angleX, angleY, scale) => {
      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      const y1 = vy * cosX - vz * sinX;
      const z1 = vy * sinX + vz * cosX;
      const x2 = vx * cosY + z1 * sinY;
      const z2 = -vx * sinY + z1 * cosY;
      const f = 300 / (300 + z2 * 60);
      return { x: cx + x2 * scale * f, y: cy + y1 * scale * f, z: z2 };
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      time++;

      if (type === 'core-pulse') {
        const baseR = Math.min(W, H) * 0.12;
        const pulsed = baseR + Math.sin(time * 0.025) * 14;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulsed * 3.5);
        grad.addColorStop(0, 'rgba(99,102,241,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, pulsed * 3.5, 0, Math.PI * 2); ctx.fill();
        for (let i = 1; i <= 4; i++) {
          ctx.save(); ctx.translate(cx, cy);
          ctx.rotate(time * 0.004 * i * (i % 2 === 0 ? -1 : 1));
          ctx.strokeStyle = `rgba(99,102,241,${0.06 - i * 0.008})`;
          ctx.lineWidth = 1; ctx.setLineDash([8, 14]);
          ctx.beginPath(); ctx.arc(0, 0, baseR * 1.8 * i, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
        ctx.setLineDash([]);
      }

      else if (type === 'neural-mesh') {
        nodes.forEach(n => {
          const dx = mx - n.x, dy = my - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const pull = (180 - dist) / 180 * 1.8;
            n.ox += (dx / dist) * pull * 0.06;
            n.oy += (dy / dist) * pull * 0.06;
          }
          n.ox *= 0.88; n.oy *= 0.88;
          n.x += n.vx + n.ox; n.y += n.vy + n.oy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
          ctx.fillStyle = 'rgba(99,102,241,0.5)';
          ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 160) {
              ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 160) * 0.12})`;
              ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
            }
          }
        }
      }

      else if (type === 'data-stream') {
        const tiltX = (mx / W - 0.5) * 12;
        streams.forEach(s => {
          s.y += s.speed;
          if (s.y - s.len > H) { s.y = -20; s.x = s.x + (Math.random() - 0.5) * 20; s.x = Math.max(0, Math.min(W, s.x)); }
          const grad = ctx.createLinearGradient(s.x + tiltX * 0.3, s.y - s.len, s.x + tiltX * 0.3, s.y);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.6, 'rgba(99,102,241,0.06)');
          grad.addColorStop(1, 'rgba(99,102,241,0.18)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s.x + tiltX * 0.3, s.y - s.len);
          ctx.lineTo(s.x + tiltX * 0.3, s.y);
          ctx.stroke();
          if (time % 40 === 0) { s.chars.shift(); s.chars.push(Math.random() > 0.5 ? '$' : Math.random() > 0.5 ? '₹' : '%'); }
          ctx.fillStyle = 'rgba(99,102,241,0.22)';
          ctx.font = '10px monospace';
          ctx.fillText(s.chars[0], s.x + tiltX * 0.3 - 4, s.y);
        });
      }

      else if (type === 'laser-grid') {
        ctx.strokeStyle = 'rgba(99,102,241,0.07)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < W; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        const scanY = (Math.sin(time * 0.012) * 0.5 + 0.5) * H;
        const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        scanGrad.addColorStop(0, 'rgba(0,0,0,0)');
        scanGrad.addColorStop(0.5, 'rgba(99,102,241,0.18)');
        scanGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = scanGrad; ctx.fillRect(0, scanY - 40, W, 80);
        ctx.strokeStyle = 'rgba(99,102,241,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();
        clickRipples.current = clickRipples.current.filter(r => r.alpha > 0.01);
        clickRipples.current.forEach(r => {
          r.r += 3.5; r.alpha *= 0.93;
          ctx.strokeStyle = `rgba(99,102,241,${r.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = `rgba(99,102,241,${r.alpha * 0.4})`;
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2); ctx.stroke();
        });
      }

      else if (type === 'tactical-sonar') {
        sonarTimer++;
        if (sonarTimer % 180 === 0) sonarRings.push({ r: 0, speed: Math.random() * 0.5 + 0.4, maxR: Math.max(W, H) * 0.55 });
        sonarRings = sonarRings.filter(s => s.r < s.maxR);
        sonarRings.forEach(s => {
          s.r += s.speed;
          const alpha = (1 - s.r / s.maxR) * 0.2;
          ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(s.cx || cx, s.cy || cy, s.r, 0, Math.PI * 2); ctx.stroke();
        });
        const dMouse = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        if (dMouse < W) {
          ctx.fillStyle = 'rgba(16,185,129,0.12)';
          ctx.font = '10px monospace';
          const coordText = `[${Math.round(mx * 0.1) / 10}N, ${Math.round(my * 0.1) / 10}W]`;
          ctx.fillText(coordText, mx + 16, my - 8);
          ctx.strokeStyle = 'rgba(16,185,129,0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(mx, my - 10); ctx.lineTo(mx, my + 10); ctx.stroke();
          ctx.beginPath(); ctx.arc(mx, my, 16, 0, Math.PI * 2); ctx.stroke();
        }
        if (time % 60 === 0) {
          const gx = Math.random() * W, gy = Math.random() * H;
          ctx.fillStyle = 'rgba(16,185,129,0.08)';
          ctx.font = '9px monospace';
          ctx.fillText(`${Math.round(Math.random() * 99)}.${Math.round(Math.random() * 9)}°`, gx, gy);
        }
      }

      else if (type === 'fluid-blob') {
        blobPhase += 0.018;
        const dMouse = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        const breathRate = dMouse < 200 ? 0.04 : 0.018;
        blobPhase += breathRate - 0.018;
        const pts = 120;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const angle = (i / pts) * Math.PI * 2;
          const noise = Math.sin(angle * 3 + blobPhase) * 18 + Math.sin(angle * 5 - blobPhase * 1.3) * 10 + Math.sin(angle * 7 + blobPhase * 0.7) * 6;
          const r = Math.min(W, H) * 0.16 + noise;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const blobGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.2);
        blobGrad.addColorStop(0, 'rgba(99,102,241,0.22)');
        blobGrad.addColorStop(0.6, 'rgba(99,102,241,0.1)');
        blobGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = blobGrad; ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.35);
        outerGrad.addColorStop(0, 'rgba(99,102,241,0.04)');
        outerGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = outerGrad; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.35, 0, Math.PI * 2); ctx.fill();
      }

      else if (type === 'constellation') {
        stars.forEach(s => {
          const dx = mx - s.x, dy = my - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            s.x += (dx / dist) * 0.5;
            s.y += (dy / dist) * 0.5;
          }
          s.x += s.vx; s.y += s.vy;
          if (s.x < 0 || s.x > W) s.vx *= -1;
          if (s.y < 0 || s.y > H) s.vy *= -1;
          ctx.fillStyle = `rgba(255,255,255,0.55)`;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.lineWidth = 1;
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const mdi = Math.sqrt((mx - stars[i].x) ** 2 + (my - stars[i].y) ** 2);
            const mdj = Math.sqrt((mx - stars[j].x) ** 2 + (my - stars[j].y) ** 2);
            const magnetActive = mdi < 160 || mdj < 160;
            const maxDist = magnetActive ? 160 : 90;
            if (d < maxDist) {
              const alpha = magnetActive ? (1 - d / maxDist) * 0.35 : (1 - d / maxDist) * 0.1;
              ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
              ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y); ctx.stroke();
            }
          }
        }
      }

      else if (type === 'geo3d') {
        const autoAngleX = time * 0.003 + rotX;
        const autoAngleY = time * 0.004 + rotY;
        const scale = Math.min(W, H) * 0.2;

        const drawCube = (ox, oy, oz, s, alpha) => {
          const proj = cubeVerts.map(v => project3D(v[0] * s + ox, v[1] * s + oy, v[2] * s + oz, autoAngleX, autoAngleY, scale));
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
          ctx.lineWidth = 1;
          cubeEdges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(proj[a].x, proj[a].y); ctx.lineTo(proj[b].x, proj[b].y); ctx.stroke(); });
        };

        drawCube(0, 0, 0, 1, 0.2);
        drawCube(-2.8, -2.8, -2.8, 0.7, 0.08);
        drawCube(2.8, -2.8, 2.8, 0.7, 0.08);
        drawCube(-2.8, 2.8, 2.8, 0.7, 0.08);
        drawCube(2.8, 2.8, -2.8, 0.7, 0.08);

        const icoPts = Array.from({ length: 12 }, (_, i) => {
          const phi = Math.acos(1 - 2 * (i + 0.5) / 12);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          return [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
        });
        ctx.fillStyle = `rgba(99,102,241,0.4)`;
        icoPts.forEach(v => {
          const p = project3D(v[0] * 1.6, v[1] * 1.6, v[2] * 1.6, autoAngleX, autoAngleY, scale);
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  useEffect(() => {
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'translateZ(0)' }}
    />
  );
};

const BackgroundManager = () => {
  const location = useLocation();
  const sceneType = getSceneType(location.pathname);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', background: '#050505' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <CanvasScene type={sceneType} />
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', opacity: 0.022 }} />
    </div>
  );
};

export default BackgroundManager;
