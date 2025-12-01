import React, { useState, useEffect } from 'react';
import { adminLogin, adminLogout, generateCode, getCodes, deleteCode, AccessCode } from '../services/authService';
import { LockClosedIcon, KeyIcon, XCircleIcon, ArrowPathIcon, ClipboardDocumentIcon, CheckIcon, UserCircleIcon, ExclamationTriangleIcon } from './icons';

interface AdminDashboardProps {
    onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [ownerName, setOwnerName] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            refreshCodes();
        }
    }, [isLoggedIn]);

    const refreshCodes = () => {
        setCodes(getCodes().reverse()); // Show newest first
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminLogin(username, password)) {
            setIsLoggedIn(true);
            setError(null);
        } else {
            setError("بيانات الدخول غير صحيحة");
        }
    };

    const handleGenerate = (type: 'monthly' | 'yearly') => {
        if (!ownerName.trim()) {
            setError("يرجى إدخال اسم صاحب الكود أولاً");
            return;
        }
        setError(null);
        const newCode = generateCode(type, ownerName);
        setGeneratedCode(newCode);
        setOwnerName(''); // Reset name field
        refreshCodes();
    };

    const handleDeleteClick = (code: string) => {
        setCodeToDelete(code);
        setShowDeleteModal(true);
    }

    const confirmDelete = () => {
        if (codeToDelete) {
            deleteCode(codeToDelete);
            refreshCodes();
            setShowDeleteModal(false);
            setCodeToDelete(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <LockClosedIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold text-white">منطقة الإدارة</h2>
                        <p className="text-gray-400 text-sm">يجب تسجيل الدخول للمتابعة</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="اسم المستخدم"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                        />
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                        />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                            دخول
                        </button>
                        <button type="button" onClick={onBack} className="w-full text-gray-500 text-sm hover:text-gray-300">
                            العودة للرئيسية
                        </button>
                    </form>
                </div>
                <footer className="text-center mt-8 text-sm text-slate-600">
                    <p className="font-bold text-slate-500">تم تصميمه بالكامل بواسطة عمرو</p>
                    <p className="font-serif italic mt-1">"اللهم احفظ عمرو ووالديه، وارزقهم العافية والستر في الدنيا والآخرة"</p>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-gray-200 font-sans p-6 flex flex-col relative">
            
            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                        <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            هل أنت متأكد من حذف الكود 
                            <span className="block font-mono text-cyan-400 font-bold my-1">{codeToDelete}</span>
                            نهائياً؟ لن يتمكن المستخدم من استخدامه مرة أخرى.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-colors">
                                نعم، حذف
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-6 py-2 rounded-xl transition-colors border border-slate-600">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-white">لوحة تحكم نَبِض</h1>
                <div className="flex gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white">العودة للتطبيق</button>
                    <button onClick={() => setIsLoggedIn(false)} className="bg-red-900/50 hover:bg-red-800 px-4 py-2 rounded-lg text-red-200">تسجيل خروج</button>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-8 flex-grow">
                {/* Generator Section */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <KeyIcon className="w-6 h-6 text-cyan-400" />
                            توليد أكواد جديدة
                        </h3>

                        {/* Owner Name Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-1">اسم المشترك صاحب الكود</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <UserCircleIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input 
                                    type="text" 
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="أدخل الاسم هنا..."
                                    className="w-full pr-10 pl-3 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={() => handleGenerate('monthly')}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                توليد كود شهري (99 ج.م)
                            </button>
                            <button 
                                onClick={() => handleGenerate('yearly')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                توليد كود سنوي (999 ج.م)
                            </button>
                        </div>
                    </div>

                    {generatedCode && (
                        <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-xl text-center animate-fade-in relative">
                            <p className="text-green-400 text-sm mb-2">تم توليد الكود بنجاح</p>
                            <div className="text-3xl font-mono font-bold text-white select-all bg-slate-950 p-3 rounded-lg border border-green-500/30 flex items-center justify-between gap-2">
                                <span>{generatedCode}</span>
                                <button 
                                    onClick={() => copyToClipboard(generatedCode)}
                                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                                    title="نسخ الكود"
                                >
                                    {copiedCode === generatedCode ? <CheckIcon className="w-6 h-6 text-green-500" /> : <ClipboardDocumentIcon className="w-6 h-6 text-gray-400" />}
                                </button>
                            </div>
                            <p className="text-gray-500 text-xs mt-2">انسخ الكود وأرسله للمستخدم</p>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="md:col-span-2">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white">سجل الأكواد</h3>
                            <button onClick={refreshCodes} className="text-gray-400 hover:text-white"><ArrowPathIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-800/50 text-gray-400">
                                    <tr>
                                        <th className="p-4">اسم المشترك</th>
                                        <th className="p-4">الكود</th>
                                        <th className="p-4">النوع</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4">تاريخ الإنشاء</th>
                                        <th className="p-4">تاريخ الانتهاء</th>
                                        <th className="p-4">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {codes.map((c) => (
                                        <tr key={c.code} className="hover:bg-slate-800/30">
                                             <td className="p-4 font-semibold text-white">
                                                {c.ownerName || 'غير محدد'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-cyan-300">{c.code}</span>
                                                    <button 
                                                        onClick={() => copyToClipboard(c.code)}
                                                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
                                                        title="نسخ الكود"
                                                    >
                                                        {copiedCode === c.code ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${c.type === 'monthly' ? 'bg-cyan-900/50 text-cyan-200' : 'bg-purple-900/50 text-purple-200'}`}>
                                                    {c.type === 'monthly' ? 'شهري' : 'سنوي'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {c.isUsed ? (
                                                    <span className="text-red-400">مستخدم</span>
                                                ) : (
                                                    <span className="text-green-400">نشط</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-400">{formatDate(c.generatedAt)}</td>
                                            <td className="p-4 text-gray-400 font-mono">
                                                {formatDate(c.expiryDate)}
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleDeleteClick(c.code)} 
                                                    className="text-red-500 hover:text-red-400 bg-red-900/10 p-2 rounded-full hover:bg-red-900/30 transition-colors" 
                                                    title="حذف الكود"
                                                    type="button"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {codes.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">لا توجد أكواد مولدة بعد</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="text-center mt-12 pt-6 border-t border-slate-800 text-sm text-gray-500">
                <p className="font-bold text-slate-500">تم تصميمه بالكامل بواسطة عمرو</p>
                <p className="font-serif italic mt-1">"اللهم احفظ عمرو ووالديه، وارزقهم العافية والستر في الدنيا والآخرة"</p>
            </footer>
        </div>
    );
};

export default AdminDashboard;