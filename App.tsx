
import React, { useState, useCallback } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ReportViewer } from './components/ReportViewer';
import { generateCareAdvice } from './services/geminiService';
import { AssessmentData } from './types';
import { Activity, ClipboardList, AlertCircle, FileBarChart, Clock } from 'lucide-react';

const INITIAL_DATA: AssessmentData = {
  personalDetails: { name: '', gender: '', age: '', contact: '' },
  personBrief: '',
  answers: {},
  qualitativeAnalysis: '',
  dimensions: { physical: 0, family: 0, mental: 0, management: 0 },
  totalScore: 0,
  riskLevel: 'Green',
};

const App: React.FC = () => {
  const [data, setData] = useState<AssessmentData>(INITIAL_DATA);
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsQuotaError(false);
    setReport(null);
    
    try {
      const result = await generateCareAdvice(data);
      setReport(result);
    } catch (err: any) {
      console.error(err);
      
      let errorMessage = err.message || '生成報告時發生未知錯誤';
      
      // Handle the specific QUOTA_EXCEEDED error thrown by our service
      if (errorMessage === 'QUOTA_EXCEEDED' || errorMessage.includes('429')) {
        setIsQuotaError(true);
        setError('目前使用人數較多，已達到 AI 模型的免費額度上限。請喝杯水休息一下，建議等待約 60 秒後再重新點擊生成。');
        return;
      }

      // JSON parsing logic for other errors
      try {
         if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
            const errorObj = JSON.parse(errorMessage);
            if (errorObj.error && errorObj.error.message) {
                errorMessage = errorObj.error.message;
            } else if (errorObj.message) {
                errorMessage = errorObj.message;
            }
         }
      } catch (e) {
         // If parsing fails, use the original string
      }

      // Friendly mapping
      if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
          setError('AI 模型目前負載過高 (503 Overloaded)，系統已自動重試但仍忙碌。請稍待片刻後再次點擊生成按鈕。');
      } else if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY')) {
          setError('API Key 設定無效。請確認您的 Render Environment Variables 是否正確設定 VITE_API_KEY。');
      } else {
          setError(`錯誤：${errorMessage} (請檢查 API Key 設定或網路連線)`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">住戶狀態評估與決策支援系統</h1>
              <p className="text-xs text-slate-500">Resident Status Assessment & Decision Support</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center"><ClipboardList className="w-4 h-4 mr-1"/> 結構化評估</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center"><FileBarChart className="w-4 h-4 mr-1"/> AI 分析報告</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">1. 資料輸入與評估</h2>
                <p className="text-sm text-slate-500">請填寫基本資料、人物簡述並完成30題風險評估</p>
              </div>
              <div className="p-6">
                <AssessmentForm 
                  data={data} 
                  onChange={setData}
                  onGenerate={handleGenerate} 
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Report Display */}
          <div className="lg:col-span-7">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col">
               <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-teal-900">數據評估與加值服務建議</h2>
                    <p className="text-sm text-teal-700">基於好好園館生活管家服務模型分析</p>
                  </div>
               </div>
               
               <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                 {error ? (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4">
                     {isQuotaError ? (
                       <Clock className="w-12 h-12 text-yellow-500 flex-shrink-0" />
                     ) : (
                       <AlertCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
                     )}
                     
                     <div className="max-w-md">
                        <p className={`font-bold text-lg mb-2 ${isQuotaError ? 'text-slate-800' : 'text-red-600'}`}>
                           {isQuotaError ? 'AI 正在休息中 (額度緩衝)' : '發生錯誤'}
                        </p>
                        <p className="text-slate-600 font-medium">
                          {error}
                        </p>
                     </div>
                   </div>
                 ) : (
                   <ReportViewer report={report} isLoading={isLoading} data={data} />
                 )}
               </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
