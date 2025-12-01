
import React, { useState, useEffect } from 'react';
import type { DigitalTwinData } from '../types';
import { HeartbeatIcon, BrainIcon, ShieldCheckIcon, DiagnosisIcon, PillIcon, TestTubeIcon, InformationCircleIcon, ArrowPathIcon } from './icons';
import type { AppMode } from '../App';


interface DigitalTwinDashboardProps {
  data: DigitalTwinData;
  onNavigate: (mode: AppMode) => void;
  onUpdateData: (data: DigitalTwinData) => void;
}

const Counter: React.FC<{ to: number; isFloat?: boolean }> = ({ to, isFloat = false }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1500;
        let start = 0;
        const end = to;
        if (end === start) return;

        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        
        const timer = setInterval(() => {
            current += increment;
            setCount(current);
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [to]);

    return <span>{isFloat ? count.toFixed(1) : Math.round(count).toLocaleString()}</span>;
};

const EditDataModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    currentData: DigitalTwinData; 
    onSave: (data: DigitalTwinData) => void 
}> = ({ isOpen, onClose, currentData, onSave }) => {
    // Use 'any' type for local state to allow strings in number fields during editing (handling empty state "")
    const [formData, setFormData] = useState<any>(currentData);

    useEffect(() => {
        if(isOpen) {
            // Create a deep copy to ensure we don't mutate props and reset correctly
            setFormData(JSON.parse(JSON.stringify(currentData)));
        }
    }, [isOpen, currentData]);

    if (!isOpen) return null;

    const handleChange = (section: string, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        // Parse inputs back to numbers before saving
        // Use Number() which converts "" to 0, which is safe for fallbacks, 
        // or we could enforce validation here.
        
        const weight = Number(formData.personal.weight);
        const height = Number(formData.personal.height);
        
        const finalData: DigitalTwinData = {
            ...formData,
            personal: {
                ...formData.personal,
                age: Number(formData.personal.age),
                weight: weight,
                height: height,
            },
            vitals: {
                ...formData.vitals,
                heartRate: Number(formData.vitals.heartRate),
                temperature: Number(formData.vitals.temperature),
                bloodOxygen: Number(formData.vitals.bloodOxygen),
                // Ensure other fields are preserved if they were in formData
                respiratoryRate: Number(formData.vitals.respiratoryRate || currentData.vitals.respiratoryRate),
            },
            activity: {
                ...formData.activity,
                steps: Number(formData.activity.steps),
                sleepHours: Number(formData.activity.sleepHours),
            }
        };

        // Recalculate basic risks based on BMI
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        let newRisks = [...(formData.riskFactors || [])];
        
        // Remove old BMI based risks to avoid duplicates
        newRisks = newRisks.filter((r: any) => !r.name.includes('الوزن') && !r.name.includes('السمنة'));

        if (bmi > 30) {
            newRisks.push({ name: 'السمنة', level: 'مرتفع' });
        } else if (bmi > 25) {
            newRisks.push({ name: 'زيادة الوزن', level: 'متوسط' });
        }

        const updatedData = { ...finalData, riskFactors: newRisks };
        onSave(updatedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">تحديث بياناتك الحيوية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <h4 className="text-cyan-400 font-semibold">البيانات الشخصية</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">السن</label>
                                <input 
                                    type="number" 
                                    value={formData.personal.age} 
                                    onChange={e => handleChange('personal', 'age', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">الوزن (كجم)</label>
                                <input 
                                    type="number" 
                                    value={formData.personal.weight} 
                                    onChange={e => handleChange('personal', 'weight', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">الطول (سم)</label>
                                <input 
                                    type="number" 
                                    value={formData.personal.height} 
                                    onChange={e => handleChange('personal', 'height', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h4 className="text-cyan-400 font-semibold">المؤشرات الحيوية</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">النبض (BPM)</label>
                                <input 
                                    type="number" 
                                    value={formData.vitals.heartRate} 
                                    onChange={e => handleChange('vitals', 'heartRate', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">الضغط</label>
                                <input 
                                    type="text" 
                                    value={formData.vitals.bloodPressure} 
                                    onChange={e => handleChange('vitals', 'bloodPressure', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">الحرارة</label>
                                <input 
                                    type="number" 
                                    value={formData.vitals.temperature} 
                                    onChange={e => handleChange('vitals', 'temperature', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                    step="0.1"
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">الأكسجين (SpO2)</label>
                                <input 
                                    type="number" 
                                    value={formData.vitals.bloodOxygen} 
                                    onChange={e => handleChange('vitals', 'bloodOxygen', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                        </div>
                    </div>

                     <div className="space-y-4 md:col-span-2">
                         <h4 className="text-cyan-400 font-semibold">النشاط اليومي</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">الخطوات</label>
                                <input 
                                    type="number" 
                                    value={formData.activity.steps} 
                                    onChange={e => handleChange('activity', 'steps', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">النوم (ساعات)</label>
                                <input 
                                    type="number" 
                                    value={formData.activity.sleepHours} 
                                    onChange={e => handleChange('activity', 'sleepHours', e.target.value)} 
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                    step="0.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-end border-t border-slate-800 pt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white">إلغاء</button>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-cyan-500/20">حفظ التغييرات</button>
                </div>
            </div>
        </div>
    );
};

const DigitalTwinDashboard: React.FC<DigitalTwinDashboardProps> = ({ data, onNavigate, onUpdateData }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'منخفض': return 'text-green-400 bg-green-500/10';
      case 'متوسط': return 'text-yellow-400 bg-yellow-500/10';
      case 'مرتفع': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const ActionCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="group text-right bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 hover:bg-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 w-full h-full flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1">
        <div>
            <div className="w-12 h-12 text-cyan-400 mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-2">{description}</p>
        </div>
        <p className="text-sm font-semibold text-cyan-400 mt-4 transition-transform duration-300 group-hover:translate-x-1">ابدأ الآن &rarr;</p>
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in-up relative">
      <EditDataModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        currentData={data} 
        onSave={onUpdateData} 
      />

      <header className="text-center relative">
        <h2 className="text-4xl font-extrabold text-white mt-1">لوحة قيادة توأمك الرقمي</h2>
        <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">نظرة شاملة ولحظية على صحتك، مصممة لمساعدتك على اتخاذ قرارات استباقية.</p>
        
        <button 
            onClick={() => setIsEditOpen(true)}
            className="absolute top-0 left-0 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors shadow-lg"
        >
            <ArrowPathIcon className="w-4 h-4" />
            تحديث بياناتي
        </button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6">
              <div> <p className="text-sm text-gray-400">نبض القلب</p> <p className="text-3xl font-bold text-white"><Counter to={data.vitals.heartRate} /> <span className="text-base font-normal">BPM</span></p> </div>
              <div> <p className="text-sm text-gray-400">ضغط الدم</p> <p className="text-3xl font-bold text-white">{data.vitals.bloodPressure}</p> </div>
              <div> <p className="text-sm text-gray-400">الخطوات</p> <p className="text-3xl font-bold text-white"><Counter to={data.activity.steps} /></p> </div>
              <div> <p className="text-sm text-gray-400">ساعات النوم</p> <p className="text-3xl font-bold text-white"><Counter to={data.activity.sleepHours} isFloat /></p> </div>
            </section>

             <section className="bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 flex flex-wrap gap-6 justify-center md:justify-between items-center text-sm text-gray-300">
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 mb-1">الوزن</span>
                    <span className="font-bold text-white text-lg">{data.personal.weight} كجم</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 mb-1">الطول</span>
                    <span className="font-bold text-white text-lg">{data.personal.height} سم</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 mb-1">مؤشر كتلة الجسم (BMI)</span>
                    <span className="font-bold text-cyan-300 text-lg">{ (data.personal.weight / Math.pow(data.personal.height/100, 2)).toFixed(1) }</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-gray-500 mb-1">نسبة الأكسجين</span>
                    <span className="font-bold text-white text-lg">{data.vitals.bloodOxygen}%</span>
                </div>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionCard title="تشخيص الأعراض" description="هل تشعر بتوعك؟ احصل على تحليل فوري ودقيق لأعراضك." icon={<DiagnosisIcon className="w-full h-full" />} onClick={() => onNavigate('symptom')} />
              <ActionCard title="معرّف الدواء" description="لديك دواء لا تعرفه؟ صوّره أو اكتب اسمه للحصول على تقرير كامل." icon={<PillIcon className="w-full h-full" />} onClick={() => onNavigate('medication')} />
              <ActionCard title="تحليل المختبر" description="فك شفرة تقاريرك المخبرية. افهم كل رقم وما يعنيه لصحتك." icon={<TestTubeIcon className="w-full h-full" />} onClick={() => onNavigate('lab')} />
              <ActionCard title="خطة العافية" description="احصل على خطة وقائية مخصصة لنمط حياتك لتحسين صحتك." icon={<HeartbeatIcon className="w-full h-full" />} onClick={() => onNavigate('wellness')} />
            </div>
        </div>
        
        <aside className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3"><ShieldCheckIcon className="w-6 h-6 text-cyan-400" />عوامل الخطر</h3>
                {data.riskFactors.length > 0 ? (
                    <ul className="space-y-3 mt-4">
                    {data.riskFactors.map((factor, index) => (
                        <li key={index} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-md">
                        <span className="font-medium text-gray-300">{factor.name}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-sm ${getRiskColor(factor.level)}`}>{factor.level}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm mt-4 text-center">لا توجد عوامل خطر مسجلة حالياً. حافظ على نمط حياة صحي!</p>
                )}
            </div>
             <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3"><BrainIcon className="w-6 h-6 text-cyan-400" />آخر تحليل</h3>
                {data.lastAnalysis ? (
                    <div className="mt-4">
                        <p className="text-gray-300 text-sm">{data.lastAnalysis.title}</p>
                        <button onClick={() => onNavigate(data.lastAnalysis!.mode)} className="text-sm font-semibold text-cyan-400 mt-2 hover:underline">عرض التفاصيل &rarr;</button>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mt-4">لم تقم بأي تحليل بعد. ابدأ بتشخيص أعراضك للحصول على رؤى فورية.</p>
                )}
            </div>
             <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-4 flex items-start gap-3 text-sm">
                 <InformationCircleIcon className="w-8 h-8 flex-shrink-0 mt-0.5" />
                <span>هذا النظام هو نموذج تجريبي. استشر دائمًا طبيبًا متخصصًا بشأن أي مخاوف صحية.</span>
             </div>
        </aside>
      </div>
    </div>
  );
};

export default DigitalTwinDashboard;
