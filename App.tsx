
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AnalysisResult, MedicationInfo, LabAnalysisResult, WellnessPlan, GenomicsResult, DigitalTwinData, ChatMessage } from './types';
import { analyzeSymptoms, identifyMedication, analyzeLabResults, generateWellnessPlan, analyzeGenomicsData } from './services/geminiService';
import { checkUserSession, logoutUser, getUserName, getUserProfile, saveUserProfile } from './services/authService';

import InputArea from './components/InputArea';
import ResultDisplay from './components/ResultDisplay';
import IdentifierArea from './components/IdentifierArea';
import MedicationInfoDisplay from './components/MedicationInfoDisplay';
import LabAnalysisArea from './components/LabAnalysisArea';
import LabAnalysisDisplay from './components/LabAnalysisDisplay';
import WellnessArea from './components/WellnessArea';
import WellnessDisplay from './components/WellnessDisplay';
import GenomicsArea from './components/GenomicsArea';
import GenomicsDisplay from './components/GenomicsDisplay';
import DigitalTwinDashboard from './components/DigitalTwinDashboard';
import ChatArea from './components/ChatArea';
import Loader from './components/Loader';
import ConfirmDialog from './components/ConfirmDialog';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { DiagnosisIcon, PillIcon, TestTubeIcon, HeartbeatIcon, DnaIcon, ChatBubbleLeftRightIcon, UserCircleIcon, ArrowPathIcon, AmrLogoIcon } from './components/icons';

export type AppMode = 'twin' | 'symptom' | 'medication' | 'lab' | 'wellness' | 'genomics' | 'chat';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);

  // App State
  const [mode, setMode] = useState<AppMode>('twin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pillStyle, setPillStyle] = useState({ transform: 'translateX(0px)', width: '0px' });
  const navRef = useRef<HTMLElement>(null);
  const navButtonsRef = useRef<Map<AppMode, HTMLButtonElement> | null>(null);

  // Data State
  const [symptomText, setSymptomText] = useState('');
  const [symptomImage, setSymptomImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [medicationText, setMedicationText] = useState('');
  const [medicationImage, setMedicationImage] = useState<File | null>(null);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [labText, setLabText] = useState('');
  const [labImage, setLabImage] = useState<File | null>(null);
  const [labResult, setLabResult] = useState<LabAnalysisResult | null>(null);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null);
  const [genomicsFile, setGenomicsFile] = useState<File | null>(null);
  const [genomicsResult, setGenomicsResult] = useState<GenomicsResult | null>(null);
  
  // Digital Twin State loaded from localStorage
  const [digitalTwinData, setDigitalTwinData] = useState<DigitalTwinData>(() => getUserProfile());

  // Check Session on Mount and Interval
  useEffect(() => {
      const check = () => {
          const isValid = checkUserSession();
          setIsAuthenticated(isValid);
          if (isValid) {
              setUserName(getUserName());
              // Refresh profile data just in case
              setDigitalTwinData(getUserProfile());
          }
          return isValid;
      }

      check(); // Initial check
      setIsCheckingAuth(false);

      // Periodically check session (every 30 seconds)
      const interval = setInterval(() => {
          if (!check()) {
              // If session becomes invalid during interval
              clearAllState();
          }
      }, 30000);

      return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
      logoutUser();
      setIsAuthenticated(false);
      setUserName(null);
      clearAllState();
  }
  
  const handleUpdateProfile = (newData: DigitalTwinData) => {
      saveUserProfile(newData);
      setDigitalTwinData(newData);
  };

  const updateLastAnalysis = (title: string, mode: AppMode) => {
      const newData = {
          ...digitalTwinData,
          lastAnalysis: { title, mode }
      };
      handleUpdateProfile(newData);
  };

  const getNavButtons = () => {
    if (!navButtonsRef.current) {
      navButtonsRef.current = new Map();
    }
    return navButtonsRef.current;
  };
  
  useEffect(() => {
    if (!isAuthenticated) return;
    const navButtons = getNavButtons();
    const activeButton = navButtons.get(mode);

    if (activeButton) {
      setPillStyle({
        transform: `translateX(${activeButton.offsetLeft}px)`,
        width: `${activeButton.offsetWidth}px`,
      });
    }
  }, [mode, isAuthenticated]);

  const handleError = useCallback((e: unknown) => {
    console.error(e);
    const message = e instanceof Error ? e.message : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    setError(message);
  }, []);

  const apiHandler = useCallback(async (apiCall: () => Promise<void>) => {
    // Check session before every API call
    if (!checkUserSession()) {
        setIsAuthenticated(false);
        clearAllState();
        return;
    }
    
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiCall();
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, handleError]);

  const clearAllState = useCallback(() => {
    setSymptomText(''); setSymptomImage(null); setAnalysisResult(null);
    setMedicationText(''); setMedicationImage(null); setMedicationInfo(null);
    setLabText(''); setLabImage(null); setLabResult(null);
    setWellnessPlan(null);
    setGenomicsFile(null); setGenomicsResult(null);
    setError(null);
  }, []);

  const handleModeChange = (newMode: AppMode) => {
    if (isLoading) return;
    if (mode !== newMode) {
      clearAllState();
      setMode(newMode);
    }
  };
  
  const handleReset = () => {
      clearAllState();
      setConfirmOpen(false);
  };

  const handleAnalyzeSymptoms = () => apiHandler(async () => { if (!symptomText && !symptomImage) return; const result = await analyzeSymptoms(symptomText, symptomImage); setAnalysisResult(result); const analysisTitle = `تحليل الأعراض: ${result.primaryDiagnosis.title}`; setHistory(prev => [...prev, {role: 'user', content: `طلب تحليل أعراض: ${symptomText}`}, {role: 'model', content: `تم تقديم تحليل لـ ${result.primaryDiagnosis.title}`}]); updateLastAnalysis(analysisTitle, 'symptom'); });
  const handleIdentifyMedication = () => apiHandler(async () => { if (!medicationText && !medicationImage) return; const result = await identifyMedication(medicationText, medicationImage); setMedicationInfo(result); const analysisTitle = `تعريف دواء: ${result.name}`; setHistory(prev => [...prev, {role: 'user', content: `طلب تعريف دواء: ${medicationText}`}, {role: 'model', content: `تم تعريف الدواء كـ ${result.name}`}]); updateLastAnalysis(analysisTitle, 'medication'); });
  const handleAnalyzeLabResults = () => apiHandler(async () => { if (!labText && !labImage) return; const result = await analyzeLabResults(labText, labImage); setLabResult(result); const analysisTitle = 'تحليل نتائج مخبرية'; setHistory(prev => [...prev, {role: 'user', content: 'طلب تحليل نتائج مخبرية.'}, {role: 'model', content: 'تم تقديم تحليل للنتائج.'}]); updateLastAnalysis(analysisTitle, 'lab'); });
  const handleGenerateWellnessPlan = (lifestyleInfo: { diet: string, exercise: string, sleep: string, stress: string }) => apiHandler(async () => { const result = await generateWellnessPlan(lifestyleInfo); setWellnessPlan(result); const analysisTitle = 'إنشاء خطة عافية'; setHistory(prev => [...prev, {role: 'user', content: 'طلب خطة عافية.'}, {role: 'model', content: 'تم إنشاء خطة عافية شخصية.'}]); updateLastAnalysis(analysisTitle, 'wellness'); });
  const handleAnalyzeGenomics = () => apiHandler(async () => { if (!genomicsFile) return; const result = await analyzeGenomicsData(genomicsFile); setGenomicsResult(result); const analysisTitle = 'تحليل بيانات جينومية'; setHistory(prev => [...prev, {role: 'user', content: 'طلب تحليل بيانات جينومية.'}, {role: 'model', content: 'تم تقديم تحليل للبيانات الجينومية.'}]); updateLastAnalysis(analysisTitle, 'genomics'); });

  const renderContent = () => {
    // Only show global loader if NOT in genomics mode (genomics handles its own loading state)
    if (isLoading && mode !== 'genomics') return <Loader />;
    
    if (error) return ( <div className="text-center p-8 bg-red-900/50 border border-red-500/30 rounded-lg animate-fade-in-up"> <h3 className="text-2xl font-bold text-red-400">حدث خطأ</h3> <p className="text-red-300 mt-2">{error}</p> <button onClick={() => { setError(null); clearAllState(); }} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors"> حاول مرة أخرى </button> </div> );
    
    switch (mode) {
      case 'symptom': return analysisResult ? <ResultDisplay result={analysisResult} /> : <InputArea symptomText={symptomText} setSymptomText={setSymptomText} symptomImage={symptomImage} onImageUpload={setSymptomImage} onImageClear={() => setSymptomImage(null)} onAnalyze={handleAnalyzeSymptoms} />;
      case 'medication': return medicationInfo ? <MedicationInfoDisplay result={medicationInfo} /> : <IdentifierArea medicationText={medicationText} setMedicationText={setMedicationText} medicationImage={medicationImage} onImageUpload={setMedicationImage} onImageClear={() => setMedicationImage(null)} onAnalyze={handleIdentifyMedication} />;
      case 'lab': return labResult ? <LabAnalysisDisplay result={labResult} /> : <LabAnalysisArea labText={labText} setLabText={setLabText} labImage={labImage} onImageUpload={setLabImage} onImageClear={() => setLabImage(null)} onAnalyze={handleAnalyzeLabResults} />;
      case 'wellness': return wellnessPlan ? <WellnessDisplay result={wellnessPlan} /> : <WellnessArea onGenerate={handleGenerateWellnessPlan} />;
      case 'genomics': return (genomicsResult && !isLoading) ? <GenomicsDisplay result={genomicsResult} /> : <GenomicsArea genomicsFile={genomicsFile} onFileUpload={setGenomicsFile} onFileClear={() => setGenomicsFile(null)} onAnalyze={handleAnalyzeGenomics} isLoading={isLoading} />;
      case 'twin': return <DigitalTwinDashboard data={digitalTwinData} onNavigate={handleModeChange} onUpdateData={handleUpdateProfile} />;
      case 'chat': return <ChatArea initialHistory={history} setHistory={setHistory} />;
      default: return null;
    }
  };

  const NavButton: React.FC<{ targetMode: AppMode, label: string, icon: React.ReactNode }> = ({ targetMode, label, icon }) => {
    const isActive = mode === targetMode;
    return (
      <button
        ref={(node) => {
          const map = getNavButtons();
          if (node) map.set(targetMode, node);
          else map.delete(targetMode);
        }}
        onClick={() => handleModeChange(targetMode)}
        className={`relative group flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-300 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${isActive ? 'text-cyan-300' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'}`}
        aria-label={label}
        aria-pressed={isActive}
      >
        {icon}
        <span className="absolute top-full mt-2 w-max bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-20">
          {label}
        </span>
      </button>
    );
  };
  
  const hasResult = analysisResult || medicationInfo || labResult || wellnessPlan || genomicsResult;

  // View Logic
  if (isCheckingAuth) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader message="جاري التحقق من بيانات الدخول..." /></div>
  }

  if (isAdminView) {
      return <AdminDashboard onBack={() => setIsAdminView(false)} />
  }

  if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={() => { setIsAuthenticated(true); setUserName(getUserName()); setDigitalTwinData(getUserProfile()); }} onAdminClick={() => setIsAdminView(true)} />;
  }

  return (
    <div className="text-gray-200 min-h-screen font-sans flex flex-col p-4 sm:p-6 md:p-8">
      <ConfirmDialog isOpen={isConfirmOpen} onConfirm={handleReset} onCancel={() => setConfirmOpen(false)} title="بدء جلسة جديدة؟" message="سيؤدي هذا إلى مسح الإدخالات والنتائج الحالية. هل أنت متأكد أنك تريد المتابعة؟" />
      
      <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="text-left">
            <h1 className="text-3xl font-extrabold text-white tracking-wider">نَبِض</h1>
            <p className="text-sm text-cyan-400 font-semibold">رؤية عمرو عبدالله</p>
            {userName && <p className="text-xs text-gray-400 mt-1 animate-fade-in">أهلاً بك، {userName}</p>}
        </div>
        <nav ref={navRef} className="relative flex items-center justify-center flex-grow sm:flex-grow-0 gap-1 sm:gap-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700 p-1 rounded-full">
            <div
              className="absolute top-1 h-14 bg-cyan-500/10 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={pillStyle}
            />
             <div
              className="absolute top-1 h-0.5 bg-cyan-400 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{...pillStyle, filter: 'blur(2px)'}}
            />
            <NavButton targetMode="twin" label="لوحة القيادة" icon={<UserCircleIcon className="w-7 h-7" />} />
            <NavButton targetMode="symptom" label="تشخيص الأعراض" icon={<DiagnosisIcon className="w-7 h-7" />} />
            <NavButton targetMode="medication" label="معرّف الدواء" icon={<PillIcon className="w-7 h-7" />} />
            <NavButton targetMode="lab" label="تحليل المختبر" icon={<TestTubeIcon className="w-7 h-7" />} />
            <NavButton targetMode="wellness" label="خطة العافية" icon={<HeartbeatIcon className="w-7 h-7" />} />
            <NavButton targetMode="genomics" label="علم الجينوم" icon={<DnaIcon className="w-7 h-7" />} />
            <NavButton targetMode="chat" label="محادثة" icon={<ChatBubbleLeftRightIcon className="w-7 h-7" />} />
        </nav>
         <div className="hidden sm:flex flex-col items-center gap-2">
             <AmrLogoIcon className="w-12 h-12 text-cyan-400"/>
             <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">تسجيل خروج</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-900/70 backdrop-blur-md border border-cyan-400/20 rounded-2xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-6 md:p-10 relative">
          <div className="max-w-4xl mx-auto">
              {mode !== 'twin' && hasResult && !isLoading && (
                  <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 px-4 py-2 rounded-full transition-colors">
                        <ArrowPathIcon className="w-4 h-4"/>
                        البدء من جديد
                    </button>
                  </div>
              )}
              {renderContent()}
          </div>
      </main>

      <footer className="text-center p-6 mt-6 text-sm text-gray-500 border-t border-slate-800/50">
        <p className="font-bold text-cyan-500/80 mb-2">تم تصميمه بالكامل بواسطة عمرو</p>
        <p className="font-serif italic text-gray-400">"اللهم احفظ عمرو ووالديه، وارزقهم العافية والستر في الدنيا والآخرة"</p>
      </footer>
    </div>
  );
};

export default App;
