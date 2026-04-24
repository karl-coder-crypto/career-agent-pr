import React, { useRef, useEffect } from 'react';

const HelixDNA = ({ children }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.fillStyle = isLightMode ? '#FFFFFF' : '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1;
      
      const numLines = Math.floor(canvas.width / 100);
      for (let i = 0; i <= canvas.width; i += 100) {
        ctx.strokeStyle = isLightMode ? '#F3F4F6' : 'rgba(168, 85, 247, 0.15)';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      if (!isLightMode) {
        for (let i = 0; i < 5; i++) {
          const x = (canvas.width / 5) * i + 50 + Math.sin(time + i) * 30;
          const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
          gradient.addColorStop(0, 'rgba(51, 102, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
          gradient.addColorStop(1, 'rgba(51, 102, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const x = (canvas.width / 3) * i + 100 + Math.sin(time + i) * 20;
          const gradient = ctx.createLinearGradient(x, 0, x, canvas.height);
          gradient.addColorStop(0, 'rgba(51, 102, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(51, 102, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(51, 102, 255, 0)');
          
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      time += 0.015;
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', zIndex: 1 }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -2, width: '100vw', height: '100vh', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default HelixDNA;
