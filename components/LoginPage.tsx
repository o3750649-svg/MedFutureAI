
import React, { useState, useEffect } from 'react';
import { validateAndUseCode, getLogoutReason } from '../services/authService';
import { AmrLogoIcon, KeyIcon, LockClosedIcon, BanknotesIcon, ShieldCheckIcon, ExclamationTriangleIcon, ClipboardDocumentIcon, CheckIcon } from './icons';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onAdminClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onAdminClick }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
    const [phoneCopied, setPhoneCopied] = useState(false);

    const PHONE_NUMBER = "01090991769";

    useEffect(() => {
        const reason = getLogoutReason();
        if (reason === 'expired') {
            setLogoutMessage("عفواً، لقد انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للحصول على كود جديد.");
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLogoutMessage(null);
        setIsLoading(true);

        setTimeout(() => {
            const result = validateAndUseCode(code);
            setIsLoading(false);
            if (result.success) {
                onLoginSuccess();
            } else {
                setError(result.message);
            }
        }, 800); // Fake delay for effect
    };

    const copyPhoneNumber = () => {
        navigator.clipboard.writeText(PHONE_NUMBER);
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col justify-between p-4 relative overflow-hidden bg-slate-950">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto flex-grow flex flex-col items-center justify-center">
                <div className="text-center mb-8 animate-fade-in-up">
                    <AmrLogoIcon className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
                    <h1 className="text-5xl font-extrabold text-white tracking-wider mb-2">نَبِض</h1>
                    <p className="text-xl text-cyan-200">الاستثمار الأمثل في صحتك ومستقبلك</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start w-full">
                    {/* Payment Info Card */}
                    <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-600 rounded-3xl p-6 md:p-8 shadow-2xl animate-stagger-in relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BanknotesIcon className="w-40 h-40 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <BanknotesIcon className="w-6 h-6 text-amber-400" />
                            اختر خطتك وابدأ رحلتك
                        </h2>
                        
                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-cyan-900/30 hover:border-cyan-400/50 transition-colors group cursor-default">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">الباقة الشهرية</h3>
                                    <span className="text-2xl font-bold text-cyan-400">99 ج.م</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    جرّب قوة الذكاء الاصطناعي في تشخيص حالتك ومتابعة أدويتك لمدة 30 يومًا. مثالية للتجربة والاطمئنان السريع.
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/20 p-4 rounded-xl border border-purple-500/30 hover:border-purple-400/80 transition-all group relative overflow-hidden shadow-lg shadow-purple-900/10">
                                <div className="absolute -right-8 -top-8 bg-purple-600 w-24 h-24 transform rotate-45 shadow-lg"></div>
                                <span className="absolute top-2 right-1 text-xs font-bold text-white z-10 transform rotate-45">توفير</span>
                                
                                <div className="flex justify-between items-center mb-2 relative z-10">
                                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">الباقة السنوية (VIP)</h3>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 line-through block">1188 ج.م</span>
                                        <span className="text-2xl font-bold text-purple-400">999 ج.م</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 relative z-10">
                                    <strong className="text-purple-300">وفر 189 جنيه!</strong> احصل على رعاية مستمرة، توأم رقمي دائم، وتحليلات غير محدودة لمدة عام كامل. استثمارك الحقيقي في صحتك.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
                             <p className="font-bold text-cyan-200 mb-4 text-center">طرق الدفع والتحويل</p>
                             
                             {/* Phone Number Display */}
                             <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">رقم فودافون كاش / واتساب</span>
                                    <span className="text-xl font-mono font-bold text-white tracking-wider">{PHONE_NUMBER}</span>
                                </div>
                                <button 
                                    onClick={copyPhoneNumber}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${phoneCopied ? 'bg-green-600 text-white' : 'bg-slate-700 text-cyan-300 hover:bg-slate-600'}`}
                                >
                                    {phoneCopied ? (
                                        <><span>تم النسخ</span> <CheckIcon className="w-5 h-5" /></>
                                    ) : (
                                        <><span>نسخ</span> <ClipboardDocumentIcon className="w-5 h-5" /></>
                                    )}
                                </button>
                             </div>

                             <div className="grid grid-cols-1 gap-3">
                                {/* Vodafone Cash Button */}
                                <a 
                                    href="tel:*9*7#" 
                                    className="flex items-center justify-center gap-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-red-900/30 transform hover:-translate-y-0.5"
                                >
                                    <span>ادفع عبر فودافون كاش</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono">*9*7#</span>
                                </a>

                                {/* InstaPay Button */}
                                <a 
                                    href="https://ipn.eg/S/amrabushalaby010/instapay/016Jbg" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-900/30 transform hover:-translate-y-0.5"
                                >
                                    <span>ادفع عبر InstaPay</span>
                                    <span className="text-xs opacity-80 font-normal">(amrabushalaby010@instapay)</span>
                                </a>
                             </div>

                             <p className="text-center text-xs text-gray-400 mt-4 border-t border-slate-700 pt-3">
                                بعد التحويل، يرجى إرسال صورة الإيصال (Screenshot) إلى واتساب على نفس الرقم لاستلام كود التفعيل فوراً.
                             </p>
                        </div>
                    </div>

                    {/* Login Form Card */}
                    <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-600 rounded-3xl p-6 md:p-8 shadow-2xl animate-stagger-in flex flex-col justify-center h-full" style={{ animationDelay: '200ms' }}>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                                <LockClosedIcon className="w-8 h-8 text-cyan-400" />
                                تفعيل الاشتراك
                            </h2>
                            <p className="text-gray-400">
                                أدخل كود الدخول الذي استلمته لفتح بوابتك نحو الرعاية الصحية المستقبلية.
                            </p>
                        </div>

                        {logoutMessage ? (
                             <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3 animate-pulse">
                                <ExclamationTriangleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-red-400">الاشتراك منتهي</h3>
                                    <p className="text-sm text-red-200 mt-1">{logoutMessage}</p>
                                </div>
                             </div>
                        ) : null}

                        <form onSubmit={handleLogin} className="space-y-6 flex-grow flex flex-col justify-center">
                            <div>
                                <label className="block text-sm font-medium text-cyan-300 mb-2">كود التفعيل (Access Code)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyIcon className="h-6 w-6 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-5 bg-slate-900 border border-slate-600 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center text-2xl tracking-[0.2em] font-mono uppercase transition-all shadow-inner"
                                        placeholder="XXXX-XXXX-XXXX"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !code}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 disabled:from-slate-700 disabled:to-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed transform active:scale-95 text-lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري التحقق...
                                    </span>
                                ) : (
                                    <>
                                        دخول النظام <ShieldCheckIcon className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                            
                            <a 
                                href={`https://wa.me/2${PHONE_NUMBER}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 text-sm mt-4 font-semibold hover:underline py-2"
                            >
                                <span>إرسال الإيصال وطلب الكود عبر واتساب</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                            </a>
                        </form>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <button 
                        onClick={onAdminClick}
                        className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
                    >
                        الدخول للوحة الإدارة (Admin)
                    </button>
                </div>
            </div>

            <footer className="relative z-10 w-full text-center mt-6 text-sm text-slate-600">
                <p className="font-bold text-slate-500">تم تصميمه بالكامل بواسطة عمرو</p>
                <p className="font-serif italic mt-1">"اللهم احفظ عمرو ووالديه، وارزقهم العافية والستر في الدنيا والآخرة"</p>
            </footer>
        </div>
    );
};

export default LoginPage;
