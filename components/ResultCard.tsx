import React from 'react';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <section className={`group bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 hover:scale-[1.02] ${className}`}>
      <div className="p-5 flex items-center gap-4 bg-slate-900/50 border-b border-cyan-400/20">
        <div className="flex-shrink-0 text-cyan-400 w-8 h-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-full h-full" }) : icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6 text-gray-300">
        {children}
      </div>
    </section>
  );
};

export default ResultCard;