
import React, { useState, useCallback } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ReportViewer } from './components/ReportViewer';
import { generateCareAdvice } from './services/geminiService';
import { AssessmentData } from './types';
// Fix: Added ShieldAlert to the lucide-react import list
import { Activity, ClipboardList, AlertCircle, FileBarChart, Clock, ShieldAlert } from 'lucide-react';

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
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorDetail(null);
    setIsQuotaError(false);
    setReport(null);
    
    try {
      const result = await generateCareAdvice(data);
      setReport(result);
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || '生成報告時發生未知錯誤';
      if (errorMessage.includes('模型已滿') || errorMessage.includes('請詢問系統管理員')) {
          setError(errorMessage);
          setIsQuotaError(true);
          return;
      }
      if (errorMessage.includes('429') || /quota/i.test(errorMessage) || /resource_exhausted/i.test(errorMessage)) {
        setIsQuotaError(true);
        setError('目前使用人數較多，達到 AI 額度上限。請稍後再試。');
        setErrorDetail(errorMessage);
        return;
      }
      setError(`錯誤：${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">長照風險評估與心理危機預警系統</h1>
              <p className="text-xs text-slate-500">Risk Assessment & Psychological Crisis Early Warning</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center"><ShieldAlert className="w-4 h-4 mr-1 text-red-500"/> 心理危機預警</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center"><FileBarChart className="w-4 h-4 mr-1"/> AI 綜合報告</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">1. 資料輸入與風險評估</h2>
                <p className="text-sm text-slate-500">請完成基本資料、心理危機判定與30題量表</p>
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

          <div className="lg:col-span-7">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col">
               <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-teal-900">AI 綜合評估與管家處置建議</h2>
                    <p className="text-sm text-teal-700">整合健康風險、社交衝突與心理危機之決策支援</p>
                  </div>
               </div>
               
               <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                 {error ? (
                   <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4">
                     {isQuotaError ? <Clock className="w-12 h-12 text-yellow-500" /> : <AlertCircle className="w-12 h-12 text-red-500" />}
                     <div className="max-w-md">
                        <p className={`font-bold text-lg mb-2 ${isQuotaError ? 'text-slate-800' : 'text-red-600'}`}>
                           {error.includes('模型已滿') ? '系統管理員訊息' : '處理發生問題'}
                        </p>
                        <p className="text-slate-600 font-medium">{error}</p>
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
