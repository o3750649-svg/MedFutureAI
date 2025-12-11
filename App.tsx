
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
import LegalDocs from './components/LegalDocs';
import { AdminDashboard } from './components/AdminDashboard';
import Background3D from './components/Background3D';
import { Footer } from './components/Footer';
import { DiagnosisIcon, PillIcon, TestTubeIcon, HeartbeatIcon, DnaIcon, ChatBubbleLeftRightIcon, UserCircleIcon, ArrowPathIcon, AmrLogoIcon, ExclamationTriangleIcon } from './components/icons';

export type AppMode = 'twin' | 'symptom' | 'medication' | 'lab' | 'wellness' | 'genomics' | 'chat';

// --- Extracted Components to prevent re-renders ---

const MainWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden">
        <Background3D />
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
            {children}
        </div>
    </div>
);

interface NavButtonProps {
    targetMode: AppMode;
    currentMode: AppMode;
    label: string;
    icon: React.ReactNode;
    onClick: (mode: AppMode) => void;
    setRef: (mode: AppMode, node: HTMLButtonElement | null) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ targetMode, currentMode, label, icon, onClick, setRef }) => {
    const isActive = currentMode === targetMode;
    return (
      <button
        ref={(node) => setRef(targetMode, node)}
        onClick={() => onClick(targetMode)}
        className={`relative group flex-shrink-0 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full transition-all duration-300 z-10 focus:outline-none ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        aria-label={label}
      >
        <span className="relative z-10 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">{icon}</span>
        <span className="absolute top-full mt-4 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">{label}</span>
      </button>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLegalView, setIsLegalView] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);

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

  // Check Session on Mount
  useEffect(() => {
      const initSession = async () => {
          const isValid = await checkUserSession();
          setIsAuthenticated(isValid);
          if (isValid) {
              setUserName(getUserName());
              setDigitalTwinData(getUserProfile());
              
              // Check for approaching expiry
              const sessionStr = localStorage.getItem('nabidh_user_session_v2');
              if (sessionStr) {
                  const session = JSON.parse(sessionStr);
                  if (session.expiryDate) {
                      const exp = new Date(session.expiryDate);
                      const now = new Date();
                      const diffTime = exp.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays > 0 && diffDays <= 5) {
                          setExpiryWarning(`تنبيه: سينتهي اشتراكك خلال ${diffDays} أيام (${exp.toLocaleDateString('ar-EG')}). يرجى التجديد لضمان استمرار الخدمة.`);
                      } else {
                          setExpiryWarning(null);
                      }
                  }
              }
          }
          setIsCheckingAuth(false);
      };
      initSession();
  }, [isAuthenticated]); // Added isAuthenticated dependency to re-check after login

  const handleLogout = () => {
      logoutUser();
      setIsAuthenticated(false);
      setUserName(null);
      setExpiryWarning(null);
      clearAllState();
  };
  
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

  const setNavButtonRef = (targetMode: AppMode, node: HTMLButtonElement | null) => {
      const map = getNavButtons();
      if (node) map.set(targetMode, node);
      else map.delete(targetMode);
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
    const isValid = await checkUserSession();
    if (!isValid) {
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

  const handleAnalyzeSymptoms = () => apiHandler(async () => {
    if (!symptomText && !symptomImage) return;
    const result = await analyzeSymptoms(symptomText, symptomImage);
    setAnalysisResult(result);
    updateLastAnalysis(`تحليل الأعراض: ${result.primaryDiagnosis.title}`, 'symptom');
  });

  const handleIdentifyMedication = () => apiHandler(async () => {
    if (!medicationText && !medicationImage) return;
    const result = await identifyMedication(medicationText, medicationImage);
    setMedicationInfo(result);
    updateLastAnalysis(`تعريف دواء: ${result.name}`, 'medication');
  });

  const handleAnalyzeLabResults = () => apiHandler(async () => {
    if (!labText && !labImage) return;
    const result = await analyzeLabResults(labText, labImage);
    setLabResult(result);
    updateLastAnalysis('تحليل نتائج مخبرية', 'lab');
  });

  const handleGenerateWellnessPlan = (lifestyleInfo: { diet: string, exercise: string, sleep: string, stress: string }) => apiHandler(async () => {
    const result = await generateWellnessPlan(lifestyleInfo);
    setWellnessPlan(result);
    updateLastAnalysis('إنشاء خطة عافية', 'wellness');
  });

  const handleAnalyzeGenomics = () => apiHandler(async () => {
    if (!genomicsFile) return;
    const result = await analyzeGenomicsData(genomicsFile);
    setGenomicsResult(result);
    updateLastAnalysis('تحليل بيانات جينومية', 'genomics');
  });

  const renderContent = () => {
    if (isLoading && mode !== 'genomics') return <Loader />;
    if (error) return ( 
      <div className="text-center p-8 bg-red-900/20 backdrop-blur-md border border-red-500/30 rounded-2xl animate-enter shadow-[0_0_30px_rgba(239,68,68,0.2)]"> 
        <h3 className="text-2xl font-bold text-red-400 mb-2">حدث خطأ في النظام</h3> 
        <p className="text-red-200 mb-6">{error}</p> 
        <button onClick={() => { setError(null); clearAllState(); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full transition-all shadow-lg">إعادة المحاولة</button> 
      </div> 
    );
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

  const hasResult = analysisResult || medicationInfo || labResult || wellnessPlan || genomicsResult;

  if (isCheckingAuth) {
      return <div className="min-h-screen bg-black flex items-center justify-center"><Loader message="جاري الاتصال بالخادم الآمن..." /></div>;
  }

  if (isLegalView) {
      return (
        <MainWrapper>
            <LegalDocs onBack={() => setIsLegalView(false)} />
            <Footer />
        </MainWrapper>
      );
  }

  if (isAdminView) {
      return (
        <div className="h-full bg-slate-950 overflow-y-auto custom-scrollbar">
            <AdminDashboard onBack={() => setIsAdminView(false)} />
            <Footer />
        </div>
      );
  }

  if (!isAuthenticated) {
      return (
        <MainWrapper>
          <div className="flex-grow flex items-center justify-center overflow-y-auto custom-scrollbar">
            <LoginPage 
                onLoginSuccess={() => { setIsAuthenticated(true); setUserName(getUserName()); setDigitalTwinData(getUserProfile()); }} 
                onAdminClick={() => setIsAdminView(true)}
                onLegalClick={() => setIsLegalView(true)}
            />
          </div>
        </MainWrapper>
      );
  }

  return (
    <MainWrapper>
        <div className="flex-grow p-4 sm:p-6 flex flex-col max-w-[1920px] mx-auto w-full h-full overflow-hidden">
            <ConfirmDialog isOpen={isConfirmOpen} onConfirm={handleReset} onCancel={() => setConfirmOpen(false)} title="إعادة تعيين النظام" message="سيتم فقدان البيانات الحالية في هذه الجلسة. هل أنت متأكد؟" />
            
            {/* Expiry Warning Banner */}
            {expiryWarning && (
                <div className="bg-amber-900/50 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-lg mb-4 flex items-center gap-3 animate-fade-in text-sm font-bold shadow-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span>{expiryWarning}</span>
                </div>
            )}

            {/* HUD Header */}
            <header className="flex-shrink-0 flex flex-col lg:flex-row justify-between items-center mb-6 gap-6 animate-fade-in-up">
                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4">
                    <AmrLogoIcon className="w-10 h-10 text-cyan-400 animate-pulse-slow" />
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest leading-none font-orbitron">NABIDH</h1>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em]">System Online</p>
                    </div>
                    {userName && <div className="hidden sm:block h-8 w-px bg-white/10 mx-2"></div>}
                    {userName && <p className="hidden sm:block text-xs text-gray-300">مرحباً، <span className="text-white font-bold">{userName}</span></p>}
                </div>

                <nav ref={navRef} className="relative flex items-center gap-2 glass-panel px-2 py-2 rounded-full overflow-x-auto custom-scrollbar max-w-full">
                    <div className="absolute top-2 bottom-2 bg-cyan-500/20 rounded-full transition-all duration-500 ease-out border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]" style={pillStyle} />
                    <NavButton targetMode="twin" currentMode={mode} label="لوحة القيادة" icon={<UserCircleIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="symptom" currentMode={mode} label="التشخيص" icon={<DiagnosisIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="medication" currentMode={mode} label="الأدوية" icon={<PillIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="lab" currentMode={mode} label="المختبر" icon={<TestTubeIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="wellness" currentMode={mode} label="العافية" icon={<HeartbeatIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="genomics" currentMode={mode} label="الجينوم" icon={<DnaIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                    <NavButton targetMode="chat" currentMode={mode} label="المحادثة" icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} onClick={handleModeChange} setRef={setNavButtonRef} />
                </nav>

                <button onClick={handleLogout} className="flex-shrink-0 group relative px-6 py-2 rounded-full overflow-hidden bg-red-900/20 border border-red-500/30 text-red-300 text-xs font-bold hover:text-white transition-colors glass-panel">
                    <span className="relative z-10 flex items-center gap-2">إنهاء الجلسة</span>
                    <div className="absolute inset-0 bg-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </header>

            {/* Main Content Viewport */}
            <main className="flex-1 perspective-container w-full max-w-7xl mx-auto flex flex-col overflow-hidden">
                <div className="relative flex-grow glass-panel rounded-3xl p-6 sm:p-10 transition-all duration-500 flex flex-col overflow-hidden">
                    {/* Tech Corners */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-3xl pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-3xl pointer-events-none"></div>

                    {mode !== 'twin' && hasResult && !isLoading && (
                        <div className="absolute top-6 left-6 z-20">
                            <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white bg-cyan-900/30 hover:bg-cyan-600 px-4 py-2 rounded-lg border border-cyan-500/30 transition-all">
                                <ArrowPathIcon className="w-4 h-4"/>
                                بحث جديد
                            </button>
                        </div>
                    )}
                    
                    <div className="relative flex-grow overflow-y-auto custom-scrollbar pr-2 pb-4">
                        {renderContent()}
                    </div>
                </div>
            </main>

            <Footer className="mt-4 flex-shrink-0" />
        </div>
    </MainWrapper>
  );
};

export default App;
