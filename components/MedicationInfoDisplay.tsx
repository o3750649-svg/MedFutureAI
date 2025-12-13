
import React, { useRef } from 'react';
import type { MedicationInfo } from '../types';
import { PillIcon, DiagnosisIcon, InformationCircleIcon, WarningIcon, ArrowDownTrayIcon } from './icons';
import ResultCard from './ResultCard';
import { generatePDF } from '../services/pdfService';

interface MedicationInfoDisplayProps {
  result: MedicationInfo;
}

const MedicationInfoDisplay: React.FC<MedicationInfoDisplayProps> = ({ result }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (contentRef.current) {
        generatePDF(contentRef.current, `نبض-دواء-${result.name.replace(/\s+/g, '-')}`);
    }
  };

  return (
    <div ref={contentRef} className="space-y-8 animate-fade-in p-4">
        <header className="text-center relative">
            <button 
                onClick={handleDownload}
                className="no-print absolute left-0 top-0 bg-slate-800 hover:bg-slate-700 text-cyan-400 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-md border border-slate-600"
                title="تحميل التقرير كـ PDF"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">تحميل PDF</span>
            </button>
            <p className="text-cyan-400">تقرير الدواء</p>
            <h2 className="text-4xl font-bold text-white mt-1">{result.name}</h2>
            <p className="text-lg text-gray-400 mt-2"><strong>المادة الفعالة:</strong> {result.activeIngredient}</p>
        </header>

        <ResultCard title="الاستخدام الأساسي" icon={<DiagnosisIcon />}>
            <p>{result.usage}</p>
        </ResultCard>

        <ResultCard title="معلومات الجرعة" icon={<InformationCircleIcon />}>
            <p>{result.dosageInfo}</p>
        </ResultCard>

        {result.sideEffects && result.sideEffects.length > 0 && (
            <ResultCard title="الأعراض الجانبية الشائعة" icon={<PillIcon />}>
                <ul className="list-disc list-inside space-y-2">
                    {result.sideEffects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                    ))}
                </ul>
            </ResultCard>
        )}

        {result.warnings && result.warnings.length > 0 && (
             <ResultCard 
                title="تحذيرات هامة" 
                icon={<WarningIcon />}
                className="border-amber-500/50 hover:border-amber-400"
             >
                <ul className="list-disc list-inside space-y-2 text-amber-300">
                    {result.warnings.map((warning, index) => (
                        <li key={index}><strong className="text-amber-200">{warning.split(':')[0]}:</strong>{warning.split(':')[1]}</li>
                    ))}
                </ul>
            </ResultCard>
        )}
    </div>
  );
};

export default MedicationInfoDisplay;
