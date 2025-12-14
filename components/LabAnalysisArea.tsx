
import React, { useState, useEffect } from 'react';
import { UploadIcon, SparklesIcon, XCircleIcon } from './icons';
import { sanitizeText, isValidTextLength, validationRules } from '../services/validation';

interface LabAnalysisAreaProps {
  labText: string;
  setLabText: (text: string) => void;
  labImage: File | null;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onAnalyze: () => void;
}

const LabAnalysisArea: React.FC<LabAnalysisAreaProps> = ({
  labText,
  setLabText,
  labImage,
  onImageUpload,
  onImageClear,
  onAnalyze
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasContent = labText.trim().length > 0 || labImage;
  
  useEffect(() => {
    if (labImage) {
      const url = URL.createObjectURL(labImage);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [labImage]);

  const handleTextChange = (text: string) => {
    setError(null);
    if (!isValidTextLength(text)) {
        setError(validationRules.textInput.message);
        return;
    }
    setLabText(text);
  };

  const handleAnalyze = () => {
    setLabText(sanitizeText(labText));
    onAnalyze();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="lab-results" className="block text-lg font-medium text-cyan-300 mb-2">فك شفرة تحاليلك الطبية</label>
        <p className="text-sm text-gray-400 mb-4">اكتب نتائج تحاليلك أو ارفع صورة من التقرير، وسأقوم بتحليلها لك بالتفصيل.</p>
        <div className="relative">
          <textarea 
            id="lab-results" 
            rows={5} 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-gray-500" 
            placeholder="مثال:&#10;CBC&#10;Hemoglobin: 14.5 g/dL&#10;WBC: 7.2 x 10^9/L&#10;..." 
            value={labText} 
            onChange={(e) => handleTextChange(e.target.value)} 
          />
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="image-upload" className="block text-lg font-medium text-cyan-300 mb-2">أو ارفع صورة للتقرير</label>
        {imagePreviewUrl && labImage ? (
           <div className="relative group bg-slate-900 border border-slate-600 rounded-xl p-4 text-center">
            <img src={imagePreviewUrl} alt="معاينة التقرير" className="max-h-40 w-auto mx-auto rounded-md shadow-lg" />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <button onClick={onImageClear} className="text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-transform transform hover:scale-110" title="إزالة الصورة"><XCircleIcon /></button>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2 truncate">{labImage.name}</p>
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
          حلل النتائج
        </button>
      </div>
    </div>
  );
};

export default LabAnalysisArea;
