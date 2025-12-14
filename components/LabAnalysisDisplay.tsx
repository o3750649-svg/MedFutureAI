
import React, { useRef } from 'react';
import type { LabAnalysisResult } from '../types';
import { TestTubeIcon, DiagnosisIcon, InformationCircleIcon, ArrowDownTrayIcon } from './icons';
import ResultCard from './ResultCard';
import { generatePDF } from '../services/pdfService';

interface GaugeProps {
    value: number;
    min: number;
    max: number;
    isAbnormal: boolean;
}

const Gauge: React.FC<GaugeProps> = ({ value, min, max, isAbnormal }) => {
    const range = max - min;
    const percentage = range === 0 ? (value > 0 ? 100 : 0) : Math.max(0, Math.min(100, ((value - min) / range) * 100));
    
    const indicatorColor = isAbnormal ? 'bg-amber-400' : 'bg-cyan-400';
    const trackColor = isAbnormal ? 'bg-amber-500/20' : 'bg-cyan-500/20';
    const glowClass = isAbnormal ? 'shadow-[0_0_8px_rgba(251,191,36,0.7)]' : 'shadow-[0_0_8px_rgba(34,211,238,0.7)]';


    return (
        <div className="w-full">
            <div className={`w-full ${trackColor} rounded-full h-2.5`}>
                <div className={`${indicatorColor} h-2.5 rounded-full ${glowClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};


interface LabAnalysisDisplayProps {
  result: LabAnalysisResult;
}

const LabAnalysisDisplay: React.FC<LabAnalysisDisplayProps> = ({ result }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (contentRef.current) {
            generatePDF(contentRef.current, `نبض-تحليل-مختبر-${new Date().toISOString().split('T')[0]}`);
        }
    };

    const cards = [
        <ResultCard key="summary" title={result.summary.title} icon={<DiagnosisIcon />}>
            <p>{result.summary.overview}</p>
        </ResultCard>,
        <ResultCard key="indicators" title={result.keyIndicators.title} icon={<TestTubeIcon />}>
            <div className="space-y-6">
                {result.keyIndicators.indicators.map((indicator, index) => (
                    <div key={index} className={`p-4 rounded-lg border transition-colors ${indicator.isAbnormal ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-600'}`}>
                        <div className="flex justify-between items-center">
                            <h4 className={`font-bold text-lg ${indicator.isAbnormal ? 'text-amber-300' : 'text-cyan-300'}`}>{indicator.name}</h4>
                            <span className={`font-bold text-xl ${indicator.isAbnormal ? 'text-amber-200' : 'text-white'}`}>{indicator.value}</span>
                        </div>
                         <p className="text-xs text-gray-500 mb-2">المعدل الطبيعي: {indicator.normalRange}</p>
                        
                        <Gauge value={indicator.valueAsNumber} min={indicator.rangeMin} max={indicator.rangeMax} isAbnormal={indicator.isAbnormal} />

                        <p className={`mt-3 text-sm ${indicator.isAbnormal ? 'text-amber-200' : 'text-gray-300'}`}><strong>التفسير:</strong> {indicator.interpretation}</p>
                    </div>
                ))}
            </div>
        </ResultCard>,
        <ResultCard key="conclusion" title={result.conclusion.title} icon={<InformationCircleIcon />}>
            <p>{result.conclusion.details}</p>
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
            <p className="text-cyan-400">تقرير التحاليل المخبرية</p>
            <h2 className="text-4xl font-bold text-white mt-1">نظرة معمقة على صحتك</h2>
        </header>
        
        {cards.map((card, index) => (
            <div key={card.key} className="animate-stagger-in" style={{ animationDelay: `${index * 100}ms` }}>
                {card}
            </div>
        ))}

        <div className="animate-stagger-in" style={{ animationDelay: `${cards.length * 100}ms` }}>
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-start gap-3 text-sm">
                <div className="mt-1 flex-shrink-0"><InformationCircleIcon /></div>
                <div>
                    <h4 className="font-bold">إخلاء مسؤولية هام</h4>
                    <p>{result.disclaimer}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LabAnalysisDisplay;
