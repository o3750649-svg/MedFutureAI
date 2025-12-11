
import React, { useState } from 'react';
import { SparklesIcon, HeartbeatIcon } from './icons';

interface WellnessAreaProps {
    onGenerate: (lifestyleInfo: { diet: string, exercise: string, sleep: string, stress: string }) => void;
}

const LifestyleInput: React.FC<{label: string, value: string, setValue: (val: string) => void, options: string[], placeholder: string}> = ({ label, value, setValue, options, placeholder }) => (
    <div>
        <label className="block text-md font-medium text-cyan-300 mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
        >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const WellnessArea: React.FC<WellnessAreaProps> = ({ onGenerate }) => {
    const [diet, setDiet] = useState('');
    const [exercise, setExercise] = useState('');
    const [sleep, setSleep] = useState('');
    const [stress, setStress] = useState('');

    const canGenerate = diet && exercise && sleep && stress;

    const handleSubmit = () => {
        if (canGenerate) {
            onGenerate({ diet, exercise, sleep, stress });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-center">
            <div className="flex justify-center text-cyan-400">
                <HeartbeatIcon className="w-16 h-16"/>
            </div>
            <h2 className="text-2xl font-bold text-white">مخطط العافية الاستباقي</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
                لصياغة خطة وقائية مخصصة لك، أحتاج إلى فهم نمط حياتك الحالي. ستُستخدم هذه المعلومات مع ملفك الطبي لتقديم توصيات دقيقة.
            </p>

            <div className="space-y-4 text-right">
                <LifestyleInput 
                    label="النظام الغذائي"
                    value={diet}
                    setValue={setDiet}
                    placeholder="اختر الوصف الأقرب..."
                    options={["متوازن وصحي", "غني بالبروتين", "نباتي", "غير منتظم/وجبات سريعة", "أخرى"]}
                />
                 <LifestyleInput 
                    label="ممارسة الرياضة"
                    value={exercise}
                    setValue={setExercise}
                    placeholder="اختر معدل نشاطك..."
                    options={["يوميًا", "3-5 مرات أسبوعيًا", "1-2 مرة أسبوعيًا", "نادرًا أو لا يوجد", "عملي يتطلب حركة مستمرة"]}
                />
                 <LifestyleInput 
                    label="جودة النوم"
                    value={sleep}
                    setValue={setSleep}
                    placeholder="كيف تقيّم نومك؟"
                    options={["ممتاز (7-9 ساعات متواصلة)", "جيد (6-7 ساعات)", "متقطع أو قليل (أقل من 6 ساعات)", "أعاني من الأرق"]}
                />
                 <LifestyleInput 
                    label="مستوى التوتر"
                    value={stress}
                    setValue={setStress}
                    placeholder="اختر مستوى التوتر العام..."
                    options={["منخفض جدًا", "معتدل ومحتمل", "مرتفع بسبب العمل/الدراسة", "مرتفع جدًا ومستمر"]}
                />
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={!canGenerate}
                    className="bg-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    <SparklesIcon />
                    أنشئ خطتي
                </button>
            </div>
        </div>
    );
};

export default WellnessArea;
