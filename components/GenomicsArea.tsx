
import React, { useState } from 'react';
import { UploadIcon, SparklesIcon, XCircleIcon, HeartbeatLoaderIcon } from './icons';

interface GenomicsAreaProps {
  genomicsFile: File | null;
  onFileUpload: (file: File) => void;
  onFileClear: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const GenomicsArea: React.FC<GenomicsAreaProps> = ({
  genomicsFile,
  onFileUpload,
  onFileClear,
  onAnalyze,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const hasContent = !!genomicsFile;

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="image-upload" className="block text-lg font-medium text-cyan-300 mb-2">تحليل الشفرة الوراثية</label>
        <p className="text-sm text-gray-400 mb-4">ارفع تقرير بياناتك الجينومية (مثل ملف VCF، TXT، أو PDF) لأكشف لك عن رؤى صحية مخصصة، ومخاطر محتملة، وتوافق الأدوية مع جيناتك.</p>
        
        {genomicsFile ? (
          <div className={`relative group bg-slate-900 border border-slate-600 rounded-xl p-4 text-center transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
            <p className="text-lg font-semibold text-cyan-300">
                📄 {genomicsFile.name}
            </p>
            <p className="text-sm text-gray-400">
                ({(genomicsFile.size / 1024).toFixed(2)} KB)
            </p>
            {!isLoading && (
              <div className="absolute top-2 right-2">
                <button onClick={onFileClear} className="text-gray-400 hover:text-white bg-slate-700 hover:bg-red-600 rounded-full p-1.5 transition-colors" title="إزالة الملف">
                  <XCircleIcon className="w-5 h-5"/>
                </button>
              </div>
            )}
          </div>
        ) : (
          <label 
            className={`flex justify-center w-full h-32 px-4 transition bg-slate-900 border-2 border-dashed rounded-md appearance-none cursor-pointer focus:outline-none 
              ${isLoading ? 'opacity-50 cursor-not-allowed border-slate-700' : isDragging ? 'border-cyan-400 bg-slate-800' : 'border-slate-600 hover:border-cyan-400'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="flex items-center space-x-2 space-x-reverse pointer-events-none">
              <UploadIcon />
              <span className="font-medium text-gray-400">اسحب وأفلت الملف، أو <span className="text-cyan-400 underline">تصفح الملفات</span></span>
            </span>
            <input 
              type="file" 
              name="file_upload" 
              className="hidden" 
              accept=".vcf,.txt,.pdf,application/pdf,text/plain" 
              onChange={handleFileChange} 
              disabled={isLoading}
            />
          </label>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button 
            onClick={onAnalyze} 
            disabled={!hasContent || isLoading} 
            className="bg-cyan-600 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-w-[200px]"
        >
          {isLoading ? (
            <>
              <HeartbeatLoaderIcon className="w-6 h-6 text-white" />
              <span>جاري التحليل...</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              <span>حلل بياناتي الجينومية</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GenomicsArea;
