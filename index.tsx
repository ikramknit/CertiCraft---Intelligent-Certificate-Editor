import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Upload, FileText, Download, Printer, RefreshCw, Wand2, Loader2, Edit3, Image as ImageIcon } from "lucide-react";
import { CertificateData, INITIAL_DATA } from "./types";
import { extractCertificateData } from "./services/geminiService";

const App = () => {
  const [data, setData] = useState<CertificateData>(INITIAL_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      
      setIsAnalyzing(true);
      try {
        const extractedData = await extractCertificateData(base64);
        setData(extractedData);
      } catch (error) {
        console.error("Failed to extract data", error);
        alert("Could not extract data from the image. Please try again or edit manually.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: keyof CertificateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 no-print shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700">
          <FileText className="w-6 h-6" />
          <h1 className="text-xl font-bold font-serif-display tracking-wide">CertiCraft</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Scan
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload}
        />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Panel: Editor */}
        <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 overflow-y-auto no-print z-10 flex flex-col">
          <div className="p-6 space-y-6">
            
            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <div>
                  <h3 className="font-semibold text-indigo-900 text-sm">Analyzing Certificate...</h3>
                  <p className="text-xs text-indigo-700">Extracting details via Gemini Vision</p>
                </div>
              </div>
            )}

            {!isAnalyzing && previewImage && (
               <div className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-[4/3] bg-gray-50">
                 <img src={previewImage} alt="Original" className="w-full h-full object-contain opacity-80" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Reference Image</span>
                 </div>
               </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Edit3 className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Certificate Details</h2>
              </div>

              <InputField 
                label="University (Hindi)" 
                value={data.universityNameHindi} 
                onChange={(v) => handleInputChange("universityNameHindi", v)} 
              />
              <InputField 
                label="University (English)" 
                value={data.universityNameEnglish} 
                onChange={(v) => handleInputChange("universityNameEnglish", v)} 
              />
              <InputField 
                label="Student Name" 
                value={data.studentName} 
                onChange={(v) => handleInputChange("studentName", v)} 
                isBold
              />
              <InputField 
                label="Course / Degree" 
                value={data.courseName} 
                onChange={(v) => handleInputChange("courseName", v)} 
              />
               <InputField 
                label="Division / Class" 
                value={data.division} 
                onChange={(v) => handleInputChange("division", v)} 
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Year" 
                  value={data.year} 
                  onChange={(v) => handleInputChange("year", v)} 
                />
                 <InputField 
                  label="Date/Place Text" 
                  value={data.date} 
                  onChange={(v) => handleInputChange("date", v)} 
                />
              </div>
              <InputField 
                label="Vice Chancellor Name" 
                value={data.viceChancellorName} 
                onChange={(v) => handleInputChange("viceChancellorName", v)} 
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 bg-gray-200/50 p-8 overflow-auto flex items-center justify-center print-container">
          <CertificatePreview data={data} />
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ 
  label, 
  value, 
  onChange, 
  isBold = false 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  isBold?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm text-gray-800 ${isBold ? 'font-bold' : ''}`}
    />
  </div>
);

// The actual certificate design
const CertificatePreview = ({ data }: { data: CertificateData }) => {
  return (
    <div className="certificate-pattern w-[210mm] h-[297mm] bg-white shadow-2xl relative p-[15mm] flex flex-col items-center text-center text-black print-container mx-auto">
      
      {/* Decorative Border */}
      <div className="absolute inset-4 border-4 border-double border-gray-800 pointer-events-none rounded-sm"></div>
      <div className="absolute inset-6 border border-gray-600 pointer-events-none rounded-sm"></div>

      {/* Corner Ornaments (CSS based for simplicity) */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-gray-800 rounded-tl-3xl"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-gray-800 rounded-tr-3xl"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-gray-800 rounded-bl-3xl"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-gray-800 rounded-br-3xl"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col pt-8">
        
        {/* Header Section */}
        <div className="mb-2 relative h-32 w-full flex justify-center">
            {/* SVG for Curved Hindi Text */}
            <svg viewBox="0 0 500 120" className="w-[80%] h-full overflow-visible absolute top-0">
                <path id="curve" d="M 50,120 Q 250,20 450,120" fill="transparent" />
                <text width="500">
                    <textPath xlinkHref="#curve" startOffset="50%" textAnchor="middle" className="text-[38px] font-bold fill-black font-serif">
                        {data.universityNameHindi}
                    </textPath>
                </text>
            </svg>
        </div>

        {/* University Logo Placeholder */}
        <div className="my-2 flex justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-orange-700/50 flex items-center justify-center bg-orange-50/30">
             <div className="w-20 h-20 rounded-full border border-orange-800 flex items-center justify-center">
                <span className="text-4xl">🎓</span>
             </div>
          </div>
        </div>

        {/* English University Name */}
        <h1 className="font-gothic text-[42px] tracking-wide mt-2 mb-8 text-gray-900 leading-tight">
          {data.universityNameEnglish}
        </h1>

        {/* Body Text */}
        <div className="space-y-6 font-serif-display text-gray-800 px-8 flex-1 flex flex-col justify-center">
          
          <div className="space-y-2">
            <p className="text-lg italic text-gray-600">विश्वविद्यालय की विद्या परिषद की अनुशंसा पर</p>
            <p className="text-lg italic">On the recommendation of the Academic Council,</p>
            <p className="text-lg italic">the University hereby confers the degree of</p>
          </div>

          <div className="py-2">
            <h2 className="font-gothic text-3xl mb-2">{data.courseName}</h2>
          </div>

          <div className="space-y-2">
            <p className="text-lg italic">upon</p>
            <h2 className="text-3xl font-bold uppercase tracking-wider font-serif my-3 scale-y-110">{data.studentName}</h2>
          </div>

          <div className="space-y-2">
            <p className="text-lg italic">who has successfully completed the requirement prescribed by the University</p>
            <p className="text-lg italic">for the award of this degree in</p>
            <h3 className="font-gothic text-2xl mt-1">{data.division}</h3>
            <p className="text-lg italic">in the year <span className="font-serif font-bold text-xl">{data.year}</span>.</p>
          </div>

        </div>

        {/* Footer / Signatures */}
        <div className="mt-auto pt-16 pb-8 px-12 flex justify-between items-end">
          
          <div className="text-left">
             <p className="font-serif text-sm font-semibold">{data.date}</p>
             <p className="font-serif text-xs text-gray-500 mt-1">Place/Date</p>
          </div>

          {/* Seal */}
          <div className="mb-2">
            <div className="w-24 h-24 border-2 border-dashed border-blue-300 rounded-full flex items-center justify-center opacity-60 rotate-12">
               <div className="text-center text-[10px] text-blue-800 font-bold uppercase leading-tight">
                 Official<br/>Seal<br/>UPTU
               </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-center w-48">
             <div className="h-12 w-32 relative mb-1">
                 {/* Signature simulation */}
                 <svg viewBox="0 0 200 60" className="w-full h-full absolute bottom-0">
                    <path d="M10,50 Q40,10 70,40 T150,30" stroke="black" strokeWidth="2" fill="none" />
                    <text x="100" y="55" fontSize="12" fontFamily="cursive" textAnchor="middle">{data.viceChancellorName}</text>
                 </svg>
             </div>
             <div className="border-t border-gray-800 w-full pt-1">
                <p className="font-bold font-serif text-sm">{data.viceChancellorName}</p>
                <p className="font-serif text-sm">Vice-Chancellor</p>
                <p className="font-serif text-xs">कुलपति</p>
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);