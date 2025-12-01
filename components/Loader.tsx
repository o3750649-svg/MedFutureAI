import React from 'react';
import { HeartbeatLoaderIcon } from './icons';

const Loader: React.FC<{ message?: string }> = ({ message = "جاري معايرة توأمك الرقمي..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-96">
      <HeartbeatLoaderIcon className="w-24 h-24 text-cyan-400" />
      <h2 className="text-2xl font-bold text-white mt-6 animate-pulse">لحظات من فضلك...</h2>
      <p className="text-gray-400 mt-2">{message}</p>
    </div>
  );
};

export default Loader;