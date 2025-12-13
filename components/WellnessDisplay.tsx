
import React, { useRef } from 'react';
import type { WellnessPlan } from '../types';
import { ShieldCheckIcon, DiagnosisIcon, HeartbeatIcon, BrainIcon, InformationCircleIcon, ArrowDownTrayIcon } from './icons';
import ResultCard from './ResultCard';
import { generatePDF } from '../services/pdfService';

interface WellnessDisplayProps {
  result: WellnessPlan;
}

const WellnessDisplay: React.FC<WellnessDisplayProps> = ({ result }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (contentRef.current) {
            generatePDF(contentRef.current, `نبض-خطة-العافية-${new Date().toISOString().split('T')[0]}`);
        }
    };

    const cards = [
        <ResultCard key="nutrition" title={result.nutrition.title} icon={<DiagnosisIcon />}>
            <ul className="list-disc list-inside space-y-2">
                {result.nutrition.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        </ResultCard>,

        <ResultCard key="exercise" title={result.exercise.title} icon={<HeartbeatIcon className="h-8 w-8"/>}>
            <ul className="list-disc list-inside space-y-2">
                {result.exercise.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        </ResultCard>,

        <ResultCard key="mental" title={result.mentalWellness.title} icon={<BrainIcon className="h-8 w-8"/>}>
            <ul className="list-disc list-inside space-y-2">
                {result.mentalWellness.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
        </ResultCard>
    ];
  
  return (
    <div ref={contentRef} className="space-y-8 animate-fade-in-up p-4">
        <header className="text-center border-b border-slate-700 pb-4 relative">
             <button 
                onClick={handleDownload}
                className="no-print absolute left-0 top-0 bg-slate-800 hover:bg-slate-700 text-cyan-400 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md border border-slate-600"
                title="تحميل التقرير كـ PDF"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">تحميل PDF</span>
            </button>
            <p className="text-cyan-400">خطة العافية الشخصية</p>
            <h2 className="text-4xl font-bold text-white mt-1">طريقك نحو صحة فائقة</h2>
        </header>

        <div className="text-center bg-slate-900/50 border border-slate-700 rounded-xl p-6 animate-stagger-in">
            <h3 className="text-lg font-bold text-cyan-300">الهدف الصحي العام</h3>
            <p className="text-gray-300 mt-2">{result.overallGoal}</p>
        </div>

        {cards.map((card, index) => (
            <div key={card.key} className="animate-stagger-in" style={{ animationDelay: `${(index + 1) * 100}ms`}}>
                {card}
            </div>
        ))}

        <div className="animate-stagger-in" style={{ animationDelay: `${(cards.length + 1) * 100}ms`}}>
            <div className="mt-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-lg flex items-start gap-3 text-sm">
                <div className="mt-1 flex-shrink-0"><InformationCircleIcon /></div>
                <div>
                    <h4 className="font-bold">إخلاء مسؤولية</h4>
                    <p>{result.disclaimer}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default WellnessDisplay;
