
import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import { isValidCode, sanitizeText } from '../services/validation';
import { AmrLogoIcon, KeyIcon, LockClosedIcon, ShieldCheckIcon, CheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon, WhatsAppIcon, BanknotesIcon } from './icons';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onAdminClick: () => void;
    onLegalClick: () => void;
}

const PricingCard: React.FC<{
    title: string;
    price: string;
    features: string[];
    isVip?: boolean;
    onClick: () => void;
}> = ({ title, price, features, isVip, onClick }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between h-full ${isVip ? 'bg-gradient-to-b from-purple-900/40 to-slate-900 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-slate-900/60 border-slate-700 hover:border-cyan-500/50'}`}>
        {isVip && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">BEST VALUE</div>}
        
        <div>
            <h3 className={`text-lg font-bold mb-2 ${isVip ? 'text-purple-300' : 'text-cyan-300'}`}>{title}</h3>
            <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-sm text-gray-400 font-medium mb-1.5">ج.م</span>
            </div>
            
            <ul className="space-y-3 mb-6">
                {features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckIcon className={`w-4 h-4 ${isVip ? 'text-purple-400' : 'text-cyan-500'}`} />
                        {feat}
                    </li>
                ))}
            </ul>
        </div>

        <button 
            onClick={onClick}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${isVip ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/30'}`}
        >
            <WhatsAppIcon className="w-5 h-5" />
            اشترك الآن
        </button>
    </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onAdminClick, onLegalClick }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneCopied, setPhoneCopied] = useState(false);

    const PHONE_NUMBER = "01090991769";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // 1. Sanitize Input
        const cleanCode = sanitizeText(code).toUpperCase();
        setCode(cleanCode);

        // 2. Validate Input
        if (!cleanCode) {
            setError("يرجى إدخال كود التفعيل");
            return;
        }
        
        if (!isValidCode(cleanCode)) {
            setError("صيغة الكود غير صحيحة. التأكد من النمط XXXX-XXXX-XXXX");
            return;
        }

        setIsLoading(true);

        try {
            const result = await loginUser(cleanCode);
            if (result.success) {
                onLoginSuccess();
            } else {
                setError(result.message || 'حدث خطأ غير متوقع');
            }
        } catch (e) {
            setError("خطأ في الاتصال بالخادم");
        } finally {
            setIsLoading(false);
        }
    };

    const copyPhoneNumber = () => {
        navigator.clipboard.writeText(PHONE_NUMBER);
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
    };

    const openWhatsApp = (plan: string, price: string) => {
        const message = encodeURIComponent(`مرحباً، أريد الاشتراك في باقة ${plan} (${price}).`);
        window.open(`https://wa.me/201090991769?text=${message}`, '_blank');
    };
    
    const openInstaPay = () => {
        // Direct link to pay via IPN (InstaPay)
        window.open('https://ipn.eg/S/amrabushalaby010/instapay/016Jbg', '_blank');
    };

    return (
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-start p-4 lg:p-8 h-full">
            
            {/* Branding & Pricing Section - Left Column */}
            <div className="order-2 lg:order-1 flex flex-col h-full lg:pr-8 overflow-y-auto custom-scrollbar">
                <div className="text-center lg:text-right mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-4 mb-2">
                        <AmrLogoIcon className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                        <div>
                            <h1 className="text-5xl font-black text-white leading-none font-orbitron tracking-tighter">NABIDH</h1>
                            <p className="text-sm text-cyan-400 font-bold tracking-[0.4em] uppercase">Future Medical AI</p>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mt-4 max-w-xl mx-auto lg:mx-0">
                        استثمر في صحتك الآن. احصل على تشخيص فوري، تحليل مخبري دقيق، وخطة حياة صحية متكاملة بلمسة واحدة.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <PricingCard 
                        title="الباقة الشهرية" 
                        price="99" 
                        features={["تشخيص ذكي غير محدود", "تحليل نتائج المعامل", "خطة أدوية تفصيلية", "دعم فني عبر واتساب"]}
                        onClick={() => openWhatsApp("الشهرية", "99 ج.م")}
                    />
                    <PricingCard 
                        title="الباقة السنوية (VIP)" 
                        price="999" 
                        isVip={true}
                        features={["كل مميزات الباقة الشهرية", "أولوية قصوى في المعالجة", "تحليل الجينوم (DNA)", "تحديثات طبية حصرية"]}
                        onClick={() => openWhatsApp("السنوية", "999 ج.م")}
                    />
                </div>

                <div className="mt-auto bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="w-full sm:w-auto">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 text-center sm:text-right">طرق الدفع المتاحة</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white font-bold">
                            <div className="flex items-center gap-2">
                                <BanknotesIcon className="w-5 h-5 text-green-400" />
                                <span>فودافون كاش</span>
                            </div>
                            <span className="hidden sm:inline text-slate-600">|</span>
                            <button onClick={openInstaPay} className="group flex items-center gap-2 hover:text-purple-400 transition-colors">
                                <BanknotesIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                                <span className="underline decoration-purple-500/30 underline-offset-4 group-hover:decoration-purple-400">إنستا باي (InstaPay)</span>
                            </button>
                        </div>
                    </div>
                    <button onClick={copyPhoneNumber} className="flex flex-col items-center sm:items-end text-right group">
                         <span className="text-xs text-cyan-400 font-mono tracking-wider mb-1">01090991769</span>
                         <span className="text-[10px] bg-slate-800 text-gray-400 px-2 py-0.5 rounded group-hover:bg-cyan-900 group-hover:text-cyan-200 transition-colors">
                            {phoneCopied ? 'تم النسخ!' : 'نسخ الرقم'}
                         </span>
                    </button>
                </div>
            </div>

            {/* Login Card - Right Column */}
            <div className="order-1 lg:order-2 flex flex-col justify-center h-full animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="glass-panel rounded-[2rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group border border-cyan-500/20">
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
                                <LockClosedIcon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">تسجيل الدخول</h2>
                            <p className="text-sm text-cyan-200/70 uppercase tracking-widest font-orbitron mt-1">Already a member?</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest text-center">أدخل كود التفعيل</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                                        <KeyIcon className="h-5 w-5 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        className="block w-full pr-12 pl-4 py-4 bg-black/40 border border-slate-600 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-2xl tracking-[0.2em] font-mono uppercase transition-all shadow-inner"
                                        placeholder="XXXX-XXXX-XXXX"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-3 animate-fade-in backdrop-blur-sm">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-xs font-bold text-red-200">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !code}
                                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        تفعيل النظام <ShieldCheckIcon className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <button onClick={onLegalClick} className="hover:text-cyan-400 transition-colors">الشروط والخصوصية</button>
                            <button onClick={onAdminClick} className="hover:text-cyan-400 transition-colors">Admin Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
