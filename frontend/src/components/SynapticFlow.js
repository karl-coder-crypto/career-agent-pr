import React, { useRef, useEffect } from 'react';

const SynapticFlow = ({ children }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let ripples = [];
    let scrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseVy: (Math.random() - 0.5) * 0.4
      });
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const deltaY = currentScroll - scrollY;
      targetScrollVelocity += deltaY * 0.02;
      scrollY = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.1;
      targetScrollVelocity *= 0.95;

      if (Math.random() < 0.005) {
        const p = particles[Math.floor(Math.random() * particles.length)];
        ripples.push({ x: p.x, y: p.y, radius: 0, opacity: 0.6 });
      }

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy + scrollVelocity;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.fill();

        particles.forEach(other => {
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.15 * (1 - dist / 200)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.5;
        r.opacity -= 0.006;
        if (r.opacity <= 0) {
          ripples.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(96, 165, 250, ${r.opacity})`;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', zIndex: 1 }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none'
        }}
      />
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', opacity: 0.02, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default SynapticFlow;
