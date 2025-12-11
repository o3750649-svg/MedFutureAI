import React, { useRef, useState } from 'react';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on cursor position (max 5 degrees)
    const rotX = ((y / rect.height) - 0.5) * -10;
    const rotY = ((x / rect.width) - 0.5) * 10;

    setRotation({ x: rotX, y: rotY });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <section 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`holo-card relative rounded-2xl overflow-hidden mb-6 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
    >
      {/* Dynamic Glow Gradient based on mouse position */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(34,211,238,0.15) 0%, transparent 50%)`
        }}
      />

      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

      {/* Content Layer */}
      <div className="relative z-10">
          <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-slate-900/40">
            <div className="flex-shrink-0 text-cyan-400 w-12 h-12 flex items-center justify-center bg-cyan-900/20 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-cyan-500/30">
                {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-6 h-6" }) : icon}
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide text-glow">{title}</h3>
          </div>
          <div className="p-6 text-gray-200">
            {children}
          </div>
      </div>
    </section>
  );
};

export default ResultCard;