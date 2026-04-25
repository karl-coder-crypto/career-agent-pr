import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getAnimationType = (pathname) => {
  if (pathname === '/') return 'core-pulse';
  if (pathname.includes('/consultant')) return 'synapse';
  if (pathname.includes('/opportunities')) return 'growth';
  if (pathname.includes('/resume-checker')) return 'helix';
  if (pathname.includes('/dsa-sniper')) return 'radar';
  if (pathname.includes('/networking-hub')) return 'orbital';
  if (pathname.includes('/skill-architect')) return 'zen';
  return 'ambient';
};

const CanvasAnimation = ({ type }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationId;
    let time = 0;
    let resizeTimeout;

    let items = [];
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLight ? '#F8FAFC' : '#000000';

    const initItems = () => {
      items = [];
      const w = canvas.width;
      const h = canvas.height;

      if (type === 'ambient') {
        items = [
          { x: w * 0.2, y: h * 0.2, r: w * 0.3, color: isLight ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)' },
          { x: w * 0.8, y: h * 0.3, r: w * 0.25, color: isLight ? 'rgba(51, 102, 255, 0.4)' : 'rgba(51, 102, 255, 0.3)' },
          { x: w * 0.5, y: h * 0.8, r: w * 0.35, color: isLight ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)' }
        ];
      } else if (type === 'core-pulse') {
        items = [{ r: 0, timeOffset: 0 }];
      } else if (type === 'synapse') {
        for (let i = 0; i < 40; i++) {
          items.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
          });
        }
      } else if (type === 'growth') {
        for (let i = 0; i < 25; i++) {
          items.push({
            x: Math.random() * w,
            y: Math.random() * h,
            speed: Math.random() * 0.5 + 0.2,
            size: Math.random() * 2 + 1
          });
        }
      } else if (type === 'helix') {
        const cols = Math.floor(w / 40);
        for (let i = 0; i < cols; i++) {
          items.push({
            x: i * 40 + 20,
            y: Math.random() * h,
            speed: Math.random() * 2 + 1,
            length: Math.random() * 100 + 50
          });
        }
      } else if (type === 'radar') {
        items = [{ r: 0, maxR: Math.max(w, h) }];
      } else if (type === 'orbital') {
        items = [
          { x: 0, y: 0, tx: 0, ty: 0, color: isLight ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)' },
          { x: w, y: h, tx: w, ty: h, color: isLight ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.2)' }
        ];
      } else if (type === 'zen') {
        // Wireframe cube vertices
        items = [
          [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
          [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]
        ];
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initItems();
    };

    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 200);
    };

    window.addEventListener('resize', debouncedResize);
    resize();

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    if (type === 'orbital') window.addEventListener('mousemove', onMouseMove);

    const drawBlob = (x, y, r, color) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const t = time * 0.05; // Base time

      if (type === 'ambient') {
        items.forEach((blob, i) => {
          const offsetX = Math.sin(t + i * 2) * 100;
          const offsetY = Math.cos(t + i * 1.5) * 100;
          drawBlob(blob.x + offsetX, blob.y + offsetY, blob.r, blob.color);
        });
      } 
      else if (type === 'core-pulse') {
        const pulse = items[0];
        pulse.timeOffset += 0.05;
        const cx = w / 2;
        const cy = h / 2;
        
        const baseR = Math.min(w, h) * 0.15;
        const currentR = baseR + Math.sin(pulse.timeOffset * 0.5) * 20;
        const orbColor = isLight ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';
        drawBlob(cx, cy, currentR * 3, orbColor);

        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 1; i <= 3; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((pulse.timeOffset * 0.1 * i) * (i % 2 === 0 ? -1 : 1));
          ctx.beginPath();
          ctx.setLineDash([10, 15]);
          ctx.arc(0, 0, baseR * 1.5 * i, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      else if (type === 'synapse') {
        ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.3)';
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        items.forEach(node => {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > w) node.vx *= -1;
          if (node.y < 0 || node.y > h) node.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const dx = items[i].x - items[j].x;
            const dy = items[i].y - items[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(items[i].x, items[i].y);
              ctx.lineTo(items[j].x, items[j].y);
              ctx.stroke();
            }
          }
        }
      } 
      else if (type === 'growth') {
        ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.8)';
        items.forEach(dot => {
          dot.y -= dot.speed;
          if (dot.y < -10) {
            dot.y = h + 10;
            dot.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        });
      } 
      else if (type === 'helix') {
        const gradColor = isLight ? 'rgba(51, 102, 255, 0.8)' : 'rgba(51, 102, 255, 0.6)';
        items.forEach(stream => {
          stream.y += stream.speed;
          if (stream.y - stream.length > h) {
            stream.y = -Math.random() * 100;
            stream.speed = Math.random() * 2 + 1;
          }
          const grad = ctx.createLinearGradient(stream.x, stream.y - stream.length, stream.x, stream.y);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, gradColor);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(stream.x, stream.y - stream.length);
          ctx.lineTo(stream.x, stream.y);
          ctx.stroke();
        });
      } 
      else if (type === 'radar') {
        const pulse = items[0];
        pulse.r += 0.5;
        if (pulse.r > pulse.maxR) pulse.r = 0;
        
        ctx.strokeStyle = isLight ? `rgba(15, 23, 42, ${1 - pulse.r / pulse.maxR})` : `rgba(255, 255, 255, ${(1 - pulse.r / pulse.maxR) * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, pulse.r, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (type === 'orbital') {
        items.forEach((orb, i) => {
          orb.tx = i === 0 ? mouseX * 0.5 : w - mouseX * 0.5;
          orb.ty = i === 0 ? mouseY * 0.5 : h - mouseY * 0.5;
          orb.x += (orb.tx - orb.x) * 0.05;
          orb.y += (orb.ty - orb.y) * 0.05;
          drawBlob(orb.x, orb.y, w * 0.4, orb.color);
        });
      } 
      else if (type === 'zen') {
        ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.2;
        const angle = time * 0.01;
        
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        
        const projected = items.map(v => {
          const x1 = v[0] * cosAngle - v[2] * sinAngle;
          const z1 = v[0] * sinAngle + v[2] * cosAngle;
          const y1 = v[1] * cosAngle - z1 * sinAngle;
          const z2 = v[1] * sinAngle + z1 * cosAngle;
          
          const f = 200 / (200 + z2 * 50);
          return {
            x: cx + x1 * scale * f,
            y: cy + y1 * scale * f
          };
        });

        const edges = [
          [0,1], [1,2], [2,3], [3,0],
          [4,5], [5,6], [6,7], [7,4],
          [0,4], [1,5], [2,6], [3,7]
        ];

        edges.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(projected[a].x, projected[a].y);
          ctx.lineTo(projected[b].x, projected[b].y);
          ctx.stroke();
        });
      }

      time += 1;
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedResize);
      if (type === 'orbital') window.removeEventListener('mousemove', onMouseMove);
    };
  }, [type]);

  // Apply CSS blur only to specific ambient types to save performance on drawing gradients,
  // though we draw radial gradients anyway for blobs. 60px blur creates the "ambient nebula" effect perfectly.
  const shouldBlur = type === 'ambient' || type === 'orbital' || type === 'core-pulse';

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        filter: shouldBlur ? 'blur(60px)' : 'none',
        pointerEvents: 'none'
      }} 
    />
  );
};

const BackgroundManager = () => {
  const location = useLocation();
  const animType = getAnimationType(location.pathname);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={animType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <CanvasAnimation type={animType} />
        </motion.div>
      </AnimatePresence>
      <div className="grain-overlay" style={{ opacity: 0.012, position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}></div>
    </div>
  );
};

export default BackgroundManager;
