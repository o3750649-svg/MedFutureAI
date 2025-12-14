
import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, UploadIcon, SparklesIcon, InformationCircleIcon, XCircleIcon } from './icons';
import { sanitizeText, isValidTextLength, validationRules } from '../services/validation';

// Fix for TypeScript not recognizing the Web Speech API.
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

interface InputAreaProps {
  symptomText: string;
  setSymptomText: (text: string) => void;
  symptomImage: File | null;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onAnalyze: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  symptomText,
  setSymptomText,
  symptomImage,
  onImageUpload,
  onImageClear,
  onAnalyze,
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
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        handleTextChange(symptomText + finalTranscript + interimTranscript);
      };
      
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [symptomText]);
  
  useEffect(() => {
    if (symptomImage) {
      const url = URL.createObjectURL(symptomImage);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [symptomImage]);

  const handleTextChange = (text: string) => {
    setError(null);
    if (!isValidTextLength(text)) {
        setError(validationRules.textInput.message);
        // Don't update state if too long, or truncate
        return;
    }
    setSymptomText(text);
  };

  const handleAnalyze = () => {
      // Final Sanitization before sending
      const cleanText = sanitizeText(symptomText);
      setSymptomText(cleanText);
      onAnalyze();
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSymptomText(''); // Clear text before starting new dictation
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const hasContent = symptomText.trim().length > 0 || symptomImage;

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-lg flex items-start gap-3">
        <div className="mt-1 flex-shrink-0"><InformationCircleIcon /></div>
        <div>
            <h4 className="font-bold">تنبيه هام</h4>
            <p className="text-sm">هذا النظام هو نموذج ذكاء اصطناعي تجريبي. المعلومات المقدمة هي لأغراض إرشادية فقط ولا يجب اعتبارها نصيحة طبية حقيقية. استشر دائمًا طبيبًا متخصصًا بشأن أي مخاوف صحية.</p>
        </div>
      </div>

      <div>
        <label htmlFor="symptoms" className="block text-lg font-medium text-cyan-300 mb-2">التشخيص الذي يُحطم المستحيل</label>
        <p className="text-sm text-gray-400 mb-4">انطق، اكتب، أو التقط صورة. أنا لا أرى مجرد أعراض، بل أقرأ قصة مرضك كاملة.</p>
        <div className="relative">
          <textarea 
            id="symptoms" 
            rows={5} 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-gray-500" 
            placeholder="صف أعراضك هنا..." 
            value={symptomText} 
            onChange={(e) => handleTextChange(e.target.value)} 
          />
          <button onClick={toggleListen} className={`absolute bottom-3 left-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 hover:bg-slate-600 text-cyan-300'}`} title={isListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}>
            <MicrophoneIcon />
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="image-upload" className="block text-lg font-medium text-cyan-300 mb-2">أو ارفع صورة</label>
        {imagePreviewUrl && symptomImage ? (
          <div className="relative group bg-slate-900 border border-slate-600 rounded-xl p-4 text-center">
            <img src={imagePreviewUrl} alt="معاينة الأعراض" className="max-h-40 w-auto mx-auto rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <button onClick={onImageClear} className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-transform transform hover:scale-110" title="إزالة الصورة"><XCircleIcon /></button>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2 truncate">{symptomImage.name}</p>
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
          حلل الآن
        </button>
      </div>
    </div>
  );
};

export default InputArea;
