import React, { useRef, useEffect } from 'react';

const AscendingGrowth = ({ children }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lines = [];
    let scrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 75; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 120 + 40,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const deltaY = currentScroll - scrollY;
      targetScrollVelocity += deltaY * 0.03;
      scrollY = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.1;
      targetScrollVelocity *= 0.95;

      lines.forEach(line => {
        line.y -= (line.speed + scrollVelocity);

        if (line.y + line.length < -100) {
          line.y = canvas.height + 100;
          line.x = Math.random() * canvas.width;
        }
        if (line.y > canvas.height + 100) {
          line.y = -line.length - 100;
          line.x = Math.random() * canvas.width;
        }

        const gradient = ctx.createLinearGradient(line.x, line.y, line.x, line.y + line.length);
        gradient.addColorStop(0, `rgba(16, 185, 129, ${line.opacity})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

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
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', opacity: 0.02, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default AscendingGrowth;
