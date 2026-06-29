import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  color: 'gold' | 'teal';
  speed: number;
  length: number;
  progress: number;
  vertical: boolean;
}

export default function BackgroundGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Animation logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Grid spacing
    const gridSpacing = 60;
    const goldColor = '#C8973A';
    const tealColor = '#4A9EBA';
    const navyGridColor = 'rgba(21, 33, 58, 0.4)';

    // Active blueprint line animations
    const lines: Point[] = [];
    const maxActiveLines = 12;

    const createLine = (isInit = false): Point => {
      const vertical = Math.random() > 0.5;
      const gridX = Math.floor(Math.random() * (dimensions.width / gridSpacing)) * gridSpacing;
      const gridY = Math.floor(Math.random() * (dimensions.height / gridSpacing)) * gridSpacing;
      const color = Math.random() > 0.4 ? 'teal' : 'gold';

      return {
        x: vertical ? gridX : 0,
        y: vertical ? 0 : gridY,
        color,
        speed: (Math.random() * 1.2 + 0.8) * (Math.random() > 0.5 ? 1 : -1),
        length: Math.random() * 250 + 150,
        progress: isInit ? Math.random() * dimensions.width : 0,
        vertical,
      };
    };

    // Initialize lines
    for (let i = 0; i < maxActiveLines; i++) {
      lines.push(createLine(true));
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw standard blueprint grid
      ctx.strokeStyle = navyGridColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < dimensions.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.stroke();

        // Add subtle coordinate labels or cross ticks along grid
        if (x % (gridSpacing * 4) === 0) {
          ctx.fillStyle = 'rgba(74, 158, 186, 0.15)';
          ctx.font = '8px monospace';
          ctx.fillText(`X.${String(x).padStart(4, '0')}`, x + 4, 12);
        }
      }

      // Horizontal lines
      for (let y = 0; y < dimensions.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.stroke();

        if (y % (gridSpacing * 4) === 0) {
          ctx.fillStyle = 'rgba(200, 151, 58, 0.15)';
          ctx.font = '8px monospace';
          ctx.fillText(`Y.${String(y).padStart(4, '0')}`, 4, y - 4);
        }
      }

      // Draw subtle decorative technical crosses at grid intersections
      ctx.strokeStyle = 'rgba(200, 151, 58, 0.08)';
      ctx.lineWidth = 1;
      const crossSize = 4;
      for (let x = gridSpacing * 2; x < dimensions.width; x += gridSpacing * 4) {
        for (let y = gridSpacing * 2; y < dimensions.height; y += gridSpacing * 4) {
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }

      // Update and Draw Animated glowing blueprint line runs
      lines.forEach((line, index) => {
        // Move progress
        line.progress += line.speed;

        const maxCoord = line.vertical ? dimensions.height : dimensions.width;
        
        // Wrap or recreate when out of boundaries
        if (Math.abs(line.progress) > maxCoord + line.length || Math.abs(line.progress) < -line.length) {
          lines[index] = createLine(false);
          return;
        }

        const colorStr = line.color === 'gold' ? goldColor : tealColor;
        
        // Draw glow line
        ctx.shadowBlur = 10;
        ctx.shadowColor = colorStr;
        ctx.strokeStyle = colorStr;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (line.vertical) {
          const startY = line.progress;
          const endY = line.progress + (line.speed > 0 ? -line.length : line.length);
          
          // Gradient for fade tail
          const gradient = ctx.createLinearGradient(line.x, startY, line.x, endY);
          gradient.addColorStop(0, colorStr);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = gradient;

          ctx.moveTo(line.x, startY);
          ctx.lineTo(line.x, endY);
          ctx.stroke();

          // Draw head pulsing node
          ctx.shadowBlur = 15;
          ctx.fillStyle = colorStr;
          ctx.beginPath();
          ctx.arc(line.x, startY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const startX = line.progress;
          const endX = line.progress + (line.speed > 0 ? -line.length : line.length);
          
          // Gradient for fade tail
          const gradient = ctx.createLinearGradient(startX, line.y, endX, line.y);
          gradient.addColorStop(0, colorStr);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = gradient;

          ctx.moveTo(startX, line.y);
          ctx.lineTo(endX, line.y);
          ctx.stroke();

          // Draw head pulsing node
          ctx.shadowBlur = 15;
          ctx.fillStyle = colorStr;
          ctx.beginPath();
          ctx.arc(startX, line.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reset shadow for next drawings
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{ background: '#080D1C' }}
      id="madar-blueprint-bg"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75"
      />
      {/* Blueprint radial vignette for center spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(8, 13, 28, 0) 20%, rgba(8, 13, 28, 0.9) 85%)'
        }}
      />
    </div>
  );
}
