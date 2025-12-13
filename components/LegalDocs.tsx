
import React from 'react';
import { AmrLogoIcon, ShieldCheckIcon, LockClosedIcon } from './icons';

interface LegalDocsProps {
    onBack: () => void;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ onBack }) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 animate-fade-in font-sans">
            <div className="max-w-4xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <AmrLogoIcon className="w-20 h-20 text-cyan-400 mx-auto" />
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        السياسات والخصوصية
                    </h1>
                </div>

                {/* Terms of Use */}
                <section className="glass-panel rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-2xl font-bold text-white">1. شروط الاستخدام (Terms of Use)</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-300">
                        <p>مرحباً بك في منصة <strong>نَبِض</strong>. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بالشروط التالية:</p>
                        <ul className="list-disc list-inside space-y-2 marker:text-cyan-500">
                            <li><strong>الطبيعة الإرشادية:</strong> هذا النظام هو نموذج ذكاء اصطناعي مساعد. النتائج المقدمة هي لأغراض تعليمية وإرشادية فقط ولا تعتبر بديلاً عن التشخيص الطبي المتخصص.</li>
                            <li><strong>المسؤولية الشخصية:</strong> يتحمل المستخدم كامل المسؤولية عن البيانات المدخلة والقرارات المتخذة بناءً على تحليل النظام.</li>
                            <li><strong>الاستخدام العادل:</strong> يُحظر استخدام النظام لأغراض غير قانونية، أو محاولة اختراق النظام، أو مشاركة كود الوصول مع أشخاص آخرين.</li>
                            <li><strong>الملكية الفكرية:</strong> جميع الحقوق محفوظة لـ <strong>Amr Ai</strong>. يُمنع نسخ أو إعادة هندسة أي جزء من الكود أو التصميم.</li>
                        </ul>
                    </div>
                </section>

                {/* Privacy Policy */}
                <section className="glass-panel rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <LockClosedIcon className="w-8 h-8 text-purple-400" />
                        <h2 className="text-2xl font-bold text-white">2. سياسة الخصوصية والبيانات (Data Privacy)</h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-gray-300">
                        <p>نحن نولي حماية بياناتك أولوية قصوى. إليك كيف نتعامل مع معلوماتك:</p>
                        <ul className="list-disc list-inside space-y-2 marker:text-purple-500">
                            <li><strong>تخزين البيانات:</strong> يتم معالجة البيانات النصية والصور بشكل آمن. في هذه النسخة، يتم تخزين ملفك الشخصي (التوأم الرقمي) محلياً على جهازك لضمان الخصوصية.</li>
                            <li><strong>استخدام المعلومات:</strong> تُستخدم البيانات المدخلة (الأعراض، التحاليل) فقط لغرض توليد التقرير الطبي ولا يتم بيعها لأطراف ثالثة.</li>
                            <li><strong>أمان الجلسة:</strong> نستخدم تقنيات تشفير متقدمة للتحقق من أكواد الدخول وضمان عدم الوصول غير المصرح به لحسابك.</li>
                            <li><strong>حق المسح:</strong> يحق للمستخدم طلب حذف بياناته بالكامل من النظام في أي وقت عبر التواصل مع الإدارة.</li>
                        </ul>
                    </div>
                </section>

                 {/* Security & Alerts */}
                 <section className="grid md:grid-cols-2 gap-6">
                    <div className="glass-panel border-red-900/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-3">الحظر وإيقاف الخدمة</h3>
                        <p className="text-sm text-gray-400">تحتفظ إدارة <strong>Amr Ai</strong> بالحق في تجميد أو حظر أي حساب ينتهك سياسات الاستخدام، أو يستخدم أكواداً مسروقة، أو يحاول العبث بأمن النظام، دون سابق إنذار.</p>
                    </div>
                    <div className="glass-panel border-cyan-900/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-3">التحديثات والصيانة</h3>
                        <p className="text-sm text-gray-400">النظام يخضع لتحديثات دورية لتحسين الدقة الطبية والأمان. قد تتوقف الخدمة مؤقتاً للصيانة، وسيتم إشعار المستخدمين بذلك.</p>
                    </div>
                </section>

                <div className="text-center pt-8">
                    <button 
                        onClick={onBack} 
                        className="bg-white text-black hover:bg-cyan-400 hover:text-black font-bold py-3 px-12 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        الموافقة والعودة
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalDocs;
