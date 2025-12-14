
import React, { useRef } from 'react';
import type { AnalysisResult } from '../types';
import { DiagnosisIcon, TreatmentIcon, PreventionIcon, MedicationIcon, InformationCircleIcon, BrainIcon, LeafIcon, ArrowDownTrayIcon } from './icons';
import ResultCard from './ResultCard';
import { generatePDF } from '../services/pdfService';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (contentRef.current) {
        generatePDF(contentRef.current, `نبض-تشخيص-${result.primaryDiagnosis.title.replace(/\s+/g, '-')}`);
    }
  };

  const cards = [
    <ResultCard key="primary" title="التشخيص الأساسي" icon={<DiagnosisIcon />}>
      <p>{result.primaryDiagnosis.details}</p>
    </ResultCard>,
  ];

  if (result.differentialDiagnosis && result.differentialDiagnosis.length > 0) {
    cards.push(
      <ResultCard key="differential" title="التشخيص التفريقي" icon={<BrainIcon className="h-8 w-8" />}>
        <p className="text-sm text-gray-400 mb-4">بالإضافة إلى التشخيص الأساسي، تم أخذ هذه الاحتمالات في الاعتبار بناءً على الأعراض المقدمة:</p>
        <div className="space-y-4">
          {result.differentialDiagnosis.map((diag, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="font-bold text-lg text-cyan-300">{diag.title}</h4>
              <p className="text-sm font-semibold text-amber-400 mt-1">الاحتمالية: {diag.likelihood}</p>
              <p className="mt-2 text-sm text-gray-300">{diag.rationale}</p>
            </div>
          ))}
        </div>
      </ResultCard>
    );
  }

  if (result.medicationPlan && result.medicationPlan.medications.length > 0) {
    cards.push(
      <ResultCard key="medication" title={result.medicationPlan.title} icon={<MedicationIcon />}>
        <div className="space-y-4">
          {result.medicationPlan.medications.map((med, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="font-bold text-lg text-cyan-300">{med.name}</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li><strong>الجرعة:</strong> {med.dosage}</li>
                <li><strong>التكرار:</strong> {med.frequency}</li>
                <li><strong>ملاحظات:</strong> {med.notes}</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg flex items-start gap-3 text-sm">
          <div className="mt-1 flex-shrink-0"><InformationCircleIcon /></div>
          <div>
            <h4 className="font-bold">تحذير أمان</h4>
            <p>{result.medicationPlan.disclaimer} لا تتناول أي دواء دون استشارة طبيب أو صيدلي مؤهل أولاً.</p>
          </div>
        </div>
      </ResultCard>
    );
  }

  if (result.herbalRemediesPlan && result.herbalRemediesPlan.remedies.length > 0) {
    cards.push(
      <ResultCard 
        key="herbal" 
        title={result.herbalRemediesPlan.title} 
        icon={<LeafIcon />}
        className="border-green-400/20 hover:border-green-400/50 hover:shadow-green-500/10"
      >
        <div className="space-y-4">
          {result.herbalRemediesPlan.remedies.map((remedy, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="font-bold text-lg text-green-300">{remedy.name}</h4>
              <ul className="mt-2 text-sm space-y-1">
                <li><strong>طريقة الاستخدام:</strong> {remedy.usage}</li>
                <li><strong>ملاحظات:</strong> {remedy.notes}</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg flex items-start gap-3 text-sm">
          <div className="mt-1 flex-shrink-0"><InformationCircleIcon /></div>
          <div>
            <h4 className="font-bold">تحذير هام</h4>
            <p>{result.herbalRemediesPlan.disclaimer} الأعشاب قد تتفاعل مع الأدوية وتختلف فعاليتها. استشر طبيبًا أو خبير أعشاب قبل استخدامها.</p>
          </div>
        </div>
      </ResultCard>
    );
  }


  cards.push(
    <ResultCard key="treatment" title={result.treatmentPlan.title} icon={<TreatmentIcon />}>
      <ul className="list-disc list-inside space-y-2">
        {result.treatmentPlan.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </ResultCard>
  );
  
  cards.push(
    <ResultCard key="prevention" title={result.prevention.title} icon={<PreventionIcon />}>
      <ul className="list-disc list-inside space-y-2">
        {result.prevention.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </ResultCard>
  );

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
        <p className="text-cyan-400">تقرير التشخيص الشامل</p>
        <h2 className="text-4xl font-bold text-white mt-1">{result.primaryDiagnosis.title}</h2>
      </header>

      {cards.map((card, index) => (
        <div key={card.key} className="animate-stagger-in" style={{ animationDelay: `${index * 100}ms` }}>
            {card}
        </div>
      ))}
    </div>
  );
};

export default ResultDisplay;
