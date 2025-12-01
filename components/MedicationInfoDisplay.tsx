import React from 'react';
import type { MedicationInfo } from '../types';
import { PillIcon, DiagnosisIcon, InformationCircleIcon, WarningIcon } from './icons';
import ResultCard from './ResultCard';

interface MedicationInfoDisplayProps {
  result: MedicationInfo;
}

const MedicationInfoDisplay: React.FC<MedicationInfoDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <header className="text-center">
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