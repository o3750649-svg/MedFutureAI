
import React from 'react';

export const Footer: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <footer className={`text-center py-6 w-full relative z-20 pointer-events-none ${className}`}>
            <div className="inline-block bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-cyan-900/30 pointer-events-auto hover:bg-black/80 transition-colors shadow-lg">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-1 font-orbitron">
                    POWERED BY <span className="text-cyan-400 text-glow">AMR AI HYBRID MODEL</span>
                </p>
                <p className="font-serif text-[11px] text-gray-400 italic">
                    "اللهم احفظ عمرو ووالديه، وارزقهم العافية والستر"
                </p>
            </div>
        </footer>
    );
};
