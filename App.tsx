import React, { useState, useCallback } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ReportViewer } from './components/ReportViewer';
import { generateCareAdvice } from './services/geminiService';
import { AssessmentData } from './types';
import { Activity, AlertCircle, Clock, HelpCircle, Terminal } from 'lucide-react';

// Added missing personalityType property to satisfy AssessmentData interface and fix line 8 error
const INITIAL_DATA: AssessmentData = {
  personalDetails: { name: '', gender: '', age: '', contact: '', roomNumber: '' },
  personBrief: '',
  answers: {},
  crisisAnswers: {},
  crisisStatus: 'Green',
  personalityType: '待觀察',
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
      console.error("Critical API Error:", err);
      
      const errorMessage = err.message || '發生未知錯誤';
      
      if (errorMessage.includes('額度') || errorMessage.includes('429')) {
          setIsQuotaError(true);
          setError("今日免費額度已用完，請聯繫工作人員");
      } else {
          setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const handleReset = useCallback(() => {
    setData(INITIAL_DATA);
    setReport(null);
    setError(null);
    setIsQuotaError(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">住戶狀態評估與決策支援系統</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Resident Status Assessment System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center text-slate-500 text-xs font-bold tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <span className="hover:text-teal-600 transition-colors">住戶狀態評估</span>
              <span className="mx-3 text-slate-300">|</span>
              <span className="hover:text-teal-600 transition-colors">心理狀態評估</span>
              <span className="mx-3 text-slate-300">|</span>
              <span className="text-teal-600 font-black">決策支援</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
            <HelpCircle className="w-5 h-5 text-slate-300 cursor-help hover:text-teal-600 transition-colors" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左側：評估輸入 */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-24 ring-1 ring-slate-100">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 flex items-center">
                  <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  評估資料輸入
                </h2>
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

          {/* 右側：報告呈現 */}
          <div className="lg:col-span-7">
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 h-full min-h-[700px] flex flex-col overflow-hidden ring-1 ring-teal-50">
               <div className="bg-teal-600 px-6 py-5 border-b border-teal-700">
                  <h2 className="text-lg font-black text-white flex items-center">
                    <span className="w-6 h-6 bg-white text-teal-600 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                    好好園館決策支援報告
                  </h2>
               </div>
               
               <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-white to-slate-50">
                 {error ? (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-10 bg-white rounded-3xl border border-slate-200 shadow-inner">
                     <div className="p-4 bg-red-50 rounded-full">
                        {isQuotaError ? <Clock className="w-16 h-16 text-amber-500" /> : <AlertCircle className="w-16 h-16 text-red-500" />}
                     </div>
                     <div className="max-w-md w-full">
                        <h3 className="font-black text-2xl mb-3 text-slate-800">API 呼叫異常</h3>
                        
                        <div className="bg-slate-900 rounded-xl p-4 mb-8 text-left overflow-hidden">
                          <div className="flex items-center text-slate-500 mb-2 border-b border-slate-800 pb-2">
                            <Terminal className="w-4 h-4 mr-2" />
                            <span className="text-[10px] font-mono uppercase tracking-widest">Debug Diagnostic Information</span>
                          </div>
                          <p className="text-red-400 font-mono text-sm leading-relaxed break-words italic">
                            Error: {error}
                          </p>
                        </div>

                        <button 
                          onClick={handleGenerate}
                          className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 w-full sm:w-auto"
                        >
                          重新嘗試生成
                        </button>
                        <p className="mt-4 text-xs text-slate-400">
                          若持續報錯，請確認系統環境變數配置是否正確。
                        </p>
                     </div>
                   </div>
                 ) : (
                   <ReportViewer report={report} isLoading={isLoading} data={data} onReset={handleReset} />
                 )}
               </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium">
            本系統分析報告僅供生活管家與管理決策參考，不具備醫療診斷之法律效力。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;