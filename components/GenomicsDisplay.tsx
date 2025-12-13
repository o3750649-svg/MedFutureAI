
import React, { useRef } from 'react';
import type { GenomicsResult } from '../types';
import { DnaIcon, DiagnosisIcon, WarningIcon, PillIcon, InformationCircleIcon, ArrowDownTrayIcon } from './icons';
import ResultCard from './ResultCard';
import { generatePDF } from '../services/pdfService';

interface GenomicsDisplayProps {
  result: GenomicsResult;
}

const GenomicsDisplay: React.FC<GenomicsDisplayProps> = ({ result }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (contentRef.current) {
            generatePDF(contentRef.current, `نبض-جينوم-${new Date().toISOString().split('T')[0]}`);
        }
    };

    const getRiskColor = (level: string) => {
        const lowerLevel = level.toLowerCase();
        if (lowerLevel.includes('high') || lowerLevel.includes('elevated') || lowerLevel.includes('مرتفع')) {
            return 'text-red-400 border-red-500/50 bg-red-500/10';
        }
        if (lowerLevel.includes('medium') || lowerLevel.includes('moderate') || lowerLevel.includes('متوسط')) {
            return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
        }
        return 'text-green-400 border-green-500/50 bg-green-500/10';
    };

    const cards = [
        <ResultCard key="summary" title={result.summary.title} icon={<DiagnosisIcon />}>
            <p>{result.summary.overview}</p>
        </ResultCard>,
        <ResultCard key="findings" title={result.keyFindings.title} icon={<DnaIcon />}>
            <div className="space-y-4">
                {result.keyFindings.findings.map((finding, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                        <h4 className="font-bold text-lg text-cyan-300">{finding.gene} - <span className="font-normal text-gray-300">{finding.variant}</span></h4>
                        <p className="mt-2 text-sm text-gray-300"><strong>الأثر:</strong> {finding.implication}</p>
                        <p className="mt-1 text-sm text-cyan-200"><strong>التوصية:</strong> {finding.recommendation}</p>
                    </div>
                ))}
            </div>
        </ResultCard>,
        <ResultCard key="risk" title={result.riskAnalysis.title} icon={<WarningIcon />}>
             <div className="space-y-3">
                {result.riskAnalysis.risks.map((risk, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg border ${getRiskColor(risk.riskLevel)}`}>
                        <span className="font-semibold">{risk.condition}</span>
                        <span className="font-bold">{risk.riskLevel}</span>
                    </div>
                ))}
            </div>
        </ResultCard>,
        <ResultCard key="pharma" title={result.pharmacogenomics.title} icon={<PillIcon />}>
            <div className="space-y-4">
                {result.pharmacogenomics.insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                       <h4 className="font-bold text-lg text-cyan-300">{insight.drugCategory}</h4>
                       <p className="mt-2 text-sm text-gray-400">الجين المؤثر: {insight.gene}</p>
                       <p className="mt-1 text-sm text-gray-200">{insight.impact}</p>
                    </div>
                ))}
            </div>
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
                <p className="text-cyan-400">تقرير التحليل الجينومي</p>
                <h2 className="text-4xl font-bold text-white mt-1">خارطة صحتك الوراثية</h2>
            </header>

            {cards.map((card, index) => (
                <div key={card.key} className="animate-stagger-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {card}
                </div>
            ))}
            
            <div className="animate-stagger-in" style={{ animationDelay: `${cards.length * 100}ms` }}>
                <div className="mt-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-lg flex items-start gap-3 text-sm">
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

export default GenomicsDisplay;
