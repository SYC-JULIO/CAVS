
import React, { useState, useCallback } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ReportViewer } from './components/ReportViewer';
import { generateCareAdvice } from './services/geminiService';
import { AssessmentData } from './types';
import { Activity, AlertCircle, Clock, HelpCircle, Key } from 'lucide-react';

const INITIAL_DATA: AssessmentData = {
  personalDetails: { name: '', gender: '', age: '', contact: '', roomNumber: '' },
  personBrief: '',
  answers: {},
  crisisAnswers: {},
  crisisStatus: 'Green',
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
      // 檢查是否已選擇 API 金鑰，若無則啟動選擇對話框
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
          // 觸發選擇後繼續執行，不中斷
        }
      }

      const result = await generateCareAdvice(data);
      setReport(result);
    } catch (err: any) {
      console.error("Operation Failed:", err);
      
      if (err.message === "AUTH_REQUIRED") {
        // @ts-ignore
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
           // @ts-ignore
           await window.aistudio.openSelectKey();
           setError("請點擊上方金鑰圖示，選擇具備權限的 API 金鑰後再次嘗試。");
        } else {
           setError("未偵測到有效的 API_KEY。請確認環境變數已正確注入或金鑰未過期。");
        }
        setIsLoading(false);
        return;
      }

      const errorMessage = err.message || '連線逾時，請檢查網路狀態。';
      if (errorMessage.includes('額度') || errorMessage.includes('429')) {
          setIsQuotaError(true);
          setError("當前免費配額已用完，請稍候重試。");
      } else {
          setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [data]);

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
            <button 
              onClick={() => {
                // @ts-ignore
                if (window.aistudio) window.aistudio.openSelectKey();
              }}
              className="flex items-center space-x-2 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-all text-xs font-bold"
            >
              <Key className="w-4 h-4" />
              <span>設定金鑰</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
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
                     <div className="max-w-md">
                        <h3 className="font-black text-2xl mb-3 text-slate-800">系統提示</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{error}</p>
                        <button 
                          onClick={handleGenerate}
                          className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
                        >
                          重新嘗試生成
                        </button>
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
