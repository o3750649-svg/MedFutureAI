
import React, { useState, useEffect } from 'react';
import { adminLogin, adminLogout } from '../services/authService';
import { dbAPI, UserRecord, PlanType } from '../services/dbAdapter';
import { sanitizeText, isValidName, validationRules } from '../services/validation';
import { LockClosedIcon, KeyIcon, XCircleIcon, ArrowPathIcon, ClipboardDocumentIcon, CheckIcon, UserCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon, BanknotesIcon } from './icons';

interface AdminDashboardProps {
    onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Generator State
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [ownerName, setOwnerName] = useState('');

    // Modal States
    const [modalAction, setModalAction] = useState<'delete' | 'ban' | 'renew' | null>(null);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            refreshData();
        }
    }, [isLoggedIn]);

    const refreshData = async () => {
        setIsLoading(true);
        const data = await dbAPI.getAllUsers();
        // Sort: Active first, then Frozen, then Banned. Within that, newest first.
        const sorted = data.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
        setUsers(sorted);
        setIsLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanUser = sanitizeText(username);
        const cleanPass = sanitizeText(password);

        if (cleanUser.length < validationRules.adminAuth.minLength || cleanPass.length < validationRules.adminAuth.minLength) {
             setError("بيانات الدخول قصيرة جداً");
             return;
        }

        setIsLoading(true);
        const success = await adminLogin(cleanUser, cleanPass);
        setIsLoading(false);
        
        if (success) {
            setIsLoggedIn(true);
            setError(null);
        } else {
            setError("بيانات الدخول غير صحيحة");
        }
    };

    const handleGenerate = async (type: PlanType) => {
        const cleanName = sanitizeText(ownerName);
        if (!cleanName.trim()) {
            setError("يرجى إدخال اسم المشترك");
            return;
        }

        if (!isValidName(cleanName)) {
            setError(validationRules.name.message);
            return;
        }

        setIsLoading(true);
        const code = await dbAPI.generateCode(cleanName, type);
        setGeneratedCode(code);
        setOwnerName('');
        await refreshData();
        setIsLoading(false);
    };

    const executeAction = async () => {
        if (!selectedCode || !modalAction) return;

        if (modalAction === 'delete') {
            await dbAPI.deleteUser(selectedCode);
        } else if (modalAction === 'ban') {
            await dbAPI.banUser(selectedCode);
        } else if (modalAction === 'renew') {
            await dbAPI.renewUser(selectedCode);
        }

        setModalAction(null);
        setSelectedCode(null);
        await refreshData();
    };

    const handleUnban = async (code: string) => {
        await dbAPI.unbanUser(code);
        await refreshData();
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">نشط</span>;
            case 'frozen': return <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold border border-amber-500/30">مجمد (منتهي)</span>;
            case 'banned': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">محظور</span>;
            default: return null;
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 font-sans">
                <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
                    <div className="text-center mb-8">
                        <ShieldCheckIcon className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-3xl font-black text-white">SYSTEM ADMIN</h2>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mt-2">Restricted Access</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 bg-black border border-slate-700 rounded-xl text-white focus:border-red-500 outline-none transition-colors" />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border border-slate-700 rounded-xl text-white focus:border-red-500 outline-none transition-colors" />
                        {error && <div className="bg-red-900/30 text-red-400 text-sm p-3 rounded-lg border border-red-900/50 text-center">{error}</div>}
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                            AUTHENTICATE
                        </button>
                    </form>
                    <button onClick={onBack} className="w-full mt-4 text-gray-500 text-xs hover:text-white transition-colors">Abort Sequence</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-gray-200 font-sans p-4 md:p-8 flex flex-col relative">
            
            {/* Confirmation Modal */}
            {modalAction && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-600 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            {modalAction === 'delete' && <XCircleIcon className="w-8 h-8 text-red-500" />}
                            {modalAction === 'ban' && <LockClosedIcon className="w-8 h-8 text-red-500" />}
                            {modalAction === 'renew' && <ArrowPathIcon className="w-8 h-8 text-green-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد الإجراء</h3>
                        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                            {modalAction === 'delete' && 'هل أنت متأكد من حذف هذا الكود نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'}
                            {modalAction === 'ban' && 'سيتم منع هذا المستخدم من الدخول للنظام فوراً.'}
                            {modalAction === 'renew' && 'سيتم تمديد صلاحية الاشتراك وفك تجميد الحساب.'}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={executeAction} className={`text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg ${modalAction === 'renew' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                تنفيذ
                            </button>
                            <button onClick={() => { setModalAction(null); setSelectedCode(null); }} className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-6 py-3 rounded-xl transition-colors border border-slate-600">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-slate-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">System Dashboard</h1>
                    <p className="text-cyan-500 text-xs font-bold uppercase tracking-[0.2em]">Designed by Amr Ai</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={onBack} className="px-6 py-2 rounded-full border border-slate-700 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">Main App</button>
                    <button onClick={() => { adminLogout(); setIsLoggedIn(false); }} className="px-6 py-2 rounded-full bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 transition-colors text-sm font-bold">Log Out</button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Code Generator */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><KeyIcon className="w-24 h-24 text-cyan-500"/></div>
                        <h3 className="text-xl font-bold text-white mb-6 relative z-10">إصدار اشتراك جديد</h3>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">اسم العميل</label>
                                <input 
                                    type="text" 
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="أدخل الاسم..."
                                    className="w-full p-4 bg-black/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleGenerate('monthly')}
                                    disabled={isLoading}
                                    className="bg-cyan-900/30 hover:bg-cyan-600/80 border border-cyan-700/50 text-cyan-100 py-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2 group"
                                >
                                    <span className="text-xs uppercase tracking-widest opacity-70">Monthly</span>
                                    <span className="text-xl">99 EGP</span>
                                </button>
                                <button 
                                    onClick={() => handleGenerate('yearly')}
                                    disabled={isLoading}
                                    className="bg-purple-900/30 hover:bg-purple-600/80 border border-purple-700/50 text-purple-100 py-4 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
                                >
                                    <span className="text-xs uppercase tracking-widest opacity-70">Yearly</span>
                                    <span className="text-xl">999 EGP</span>
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-xs mt-4 font-bold text-center bg-red-900/20 py-2 rounded-lg">{error}</p>}
                    </div>

                    {generatedCode && (
                        <div className="bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/30 p-8 rounded-2xl text-center animate-fade-in shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">تم إنشاء الكود بنجاح</p>
                            <div className="bg-black/60 border border-green-500/50 p-4 rounded-xl flex items-center justify-between gap-4 mb-4 group">
                                <span className="text-3xl font-mono font-bold text-white tracking-widest">{generatedCode}</span>
                                <button onClick={() => copyToClipboard(generatedCode)} className="text-gray-400 group-hover:text-green-400 transition-colors">
                                    {copiedCode === generatedCode ? <CheckIcon className="w-6 h-6" /> : <ClipboardDocumentIcon className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Database View */}
                <div className="xl:col-span-2">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full max-h-[800px]">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <h3 className="font-bold text-white">قاعدة البيانات الحية</h3>
                                <span className="bg-slate-800 text-gray-400 text-xs px-2 py-1 rounded-full">{users.length} Records</span>
                            </div>
                            <button onClick={refreshData} className="text-cyan-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
                                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-950 text-gray-500 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 font-normal">المشترك</th>
                                        <th className="p-4 font-normal">الكود</th>
                                        <th className="p-4 font-normal">الحالة</th>
                                        <th className="p-4 font-normal">الصلاحية</th>
                                        <th className="p-4 font-normal text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-gray-300">
                                    {users.map(user => (
                                        <tr key={user.code} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{user.ownerName}</div>
                                                <div className="text-xs text-gray-500">{formatDate(user.generatedAt)}</div>
                                            </td>
                                            <td className="p-4 font-mono text-cyan-200 tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <span className="select-all">{user.code}</span>
                                                    <button 
                                                        onClick={() => copyToClipboard(user.code)}
                                                        className="text-gray-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="نسخ الكود"
                                                    >
                                                         {copiedCode === user.code ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">{getStatusBadge(user.status)}</td>
                                            <td className="p-4 font-mono text-xs" dir="ltr">{user.expiryDate ? formatDate(user.expiryDate) : 'غير مفعل'}</td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {user.status === 'active' && (
                                                        <button onClick={() => { setSelectedCode(user.code); setModalAction('ban'); }} className="p-2 bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="حظر">
                                                            <LockClosedIcon className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                    {user.status === 'banned' && (
                                                        <button onClick={() => handleUnban(user.code)} className="p-2 bg-green-900/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors" title="فك الحظر">
                                                            <ShieldCheckIcon className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                    {(user.status === 'frozen' || user.status === 'active') && (
                                                        <button onClick={() => { setSelectedCode(user.code); setModalAction('renew'); }} className="p-2 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg transition-colors" title="تجديد الاشتراك">
                                                            <BanknotesIcon className="w-4 h-4"/>
                                                        </button>
                                                    )}
                                                    <button onClick={() => { setSelectedCode(user.code); setModalAction('delete'); }} className="p-2 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors" title="حذف نهائي">
                                                        <XCircleIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
