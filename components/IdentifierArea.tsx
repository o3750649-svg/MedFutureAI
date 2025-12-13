
import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, UploadIcon, SparklesIcon, XCircleIcon } from './icons';
import { sanitizeText, isValidTextLength, validationRules } from '../services/validation';

// Fix for TypeScript not recognizing the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface IdentifierAreaProps {
  medicationText: string;
  setMedicationText: (text: string) => void;
  medicationImage: File | null;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onAnalyze: () => void;
}

const IdentifierArea: React.FC<IdentifierAreaProps> = ({
  medicationText,
  setMedicationText,
  medicationImage,
  onImageUpload,
  onImageClear,
  onAnalyze
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        handleTextChange(medicationText + finalTranscript);
      };
      
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [medicationText]);
  
  useEffect(() => {
    if (medicationImage) {
      const url = URL.createObjectURL(medicationImage);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
        setImagePreviewUrl(null);
    }
  }, [medicationImage]);

  const handleTextChange = (text: string) => {
    setError(null);
    if (!isValidTextLength(text)) {
        setError(validationRules.textInput.message);
        return;
    }
    setMedicationText(text);
  };

  const handleAnalyze = () => {
    setMedicationText(sanitizeText(medicationText));
    onAnalyze();
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const hasContent = medicationText.trim().length > 0 || medicationImage;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="medication" className="block text-lg font-medium text-cyan-300 mb-2">التعرف الفوري على الأدوية</label>
        <p className="text-sm text-gray-400 mb-4">اكتب اسم الدواء، انطق به، أو صوّر العلبة أو الحبة، وسأخبرك بكل شيء عنه.</p>
        <div className="relative">
          <textarea 
            id="medication" 
            rows={3} 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-gray-500" 
            placeholder="اكتب اسم الدواء هنا..." 
            value={medicationText} 
            onChange={(e) => handleTextChange(e.target.value)} 
          />
          <button onClick={toggleListen} className={`absolute bottom-3 left-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-cyan-300'}`} title={isListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}>
            <MicrophoneIcon />
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="image-upload" className="block text-lg font-medium text-cyan-300 mb-2">أو ارفع صورة للدواء</label>
        {imagePreviewUrl && medicationImage ? (
           <div className="relative group bg-slate-900 border border-slate-600 rounded-xl p-4 text-center">
            <img src={imagePreviewUrl} alt="معاينة الدواء" className="max-h-40 w-auto mx-auto rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <button onClick={onImageClear} className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-transform transform hover:scale-110" title="إزالة الصورة">
                <XCircleIcon />
              </button>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2 truncate">{medicationImage.name}</p>
          </div>
        ) : (
          <label className="flex justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-slate-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-cyan-400 focus:outline-none">
            <span className="flex items-center space-x-2 space-x-reverse">
              <UploadIcon />
              <span className="font-medium text-gray-400">اسحب وأفلت صورة، أو <span className="text-cyan-400 underline">تصفح الملفات</span></span>
            </span>
            <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={(e) => e.target.files && onImageUpload(e.target.files[0])} />
          </label>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={handleAnalyze} disabled={!hasContent || !!error} className="bg-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
          <SparklesIcon />
          تعرف على الدواء
        </button>
      </div>
    </div>
  );
};

export default IdentifierArea;
