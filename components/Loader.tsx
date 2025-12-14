
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message = "مزامنة أنوية Amr Ai..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <div className="relative w-24 h-24 mb-8">
         {/* CSS 3D Spinner mimicking DNA/Neural Net */}
         <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
         <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
         <div className="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
      </div>
      
      <h2 className="text-2xl font-bold text-white tracking-widest animate-pulse">AMR AI PROCESSING</h2>
      <p className="text-cyan-400/70 text-sm mt-2 font-mono">{message}</p>
    </div>
  );
};

export default Loader;
