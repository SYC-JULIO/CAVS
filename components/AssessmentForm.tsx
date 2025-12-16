
import React, { useEffect } from 'react';
import { AssessmentData } from '../types';
import { QUESTIONS } from '../constants';
import { calculateScores, getRiskColorClass } from '../utils/scoring';
import { PlayCircle, User, Activity, MessageSquare, FileText } from 'lucide-react';

interface Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<Props> = ({ data, onChange, onGenerate, isLoading }) => {
  
  // Real-time recalculation when answers OR age change
  useEffect(() => {
    const calculated = calculateScores(data.answers, data.personalDetails.age);
    
    // Check if score actually changed to prevent loops, but also update if just dimensions changed
    const dimsChanged = 
        calculated.dimensions.physical !== data.dimensions.physical ||
        calculated.dimensions.family !== data.dimensions.family ||
        calculated.dimensions.mental !== data.dimensions.mental ||
        calculated.dimensions.management !== data.dimensions.management;

    if (calculated.totalScore !== data.totalScore || dimsChanged) {
      onChange({
        ...data,
        ...calculated
      });
    }
  }, [data.answers, data.personalDetails.age]);

  const handlePersonalChange = (field: keyof AssessmentData['personalDetails'], value: string) => {
    onChange({
      ...data,
      personalDetails: { ...data.personalDetails, [field]: value }
    });
  };

  const handleAnswerChange = (qId: number, value: 'low' | 'medium' | 'high' | '') => {
    const newAnswers = { ...data.answers };
    if (value === '') {
      delete newAnswers[qId];
    } else {
      newAnswers[qId] = value;
    }
    onChange({ ...data, answers: newAnswers });
  };

  // Helper to split question text into Main and Subtitle (content in parens)
  const renderQuestionText = (text: string, id: number) => {
    // Regex to capture text before first ( or （
    const match = text.match(/^([^（(]+)[（(](.+)[）)]$/) || text.match(/^([^（(]+)[（(](.+)$/) ;
    
    if (match) {
        return (
            <div className="mb-3">
                <span className="text-sm font-bold text-slate-800">{id}. {match[1]}</span>
                <span className="block text-xs text-slate-500 mt-1 pl-4">{match[2].replace(/[）)]$/, '')}</span>
            </div>
        )
    }
    return <p className="text-sm font-medium text-slate-800 mb-3">{id}. {text}</p>;
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Personal Details */}
      <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="flex items-center mb-4 text-teal-700">
          <User className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">基本資料</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">姓名</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2 text-sm"
              value={data.personalDetails.name}
              onChange={e => handlePersonalChange('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
                <label className="text-xs text-slate-500 mb-1 block">性別</label>
                <select 
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                  value={data.personalDetails.gender}
                  onChange={e => handlePersonalChange('gender', e.target.value)}
                >
                  <option value="">請選擇</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
             </div>
             <div>
                <label className="text-xs text-slate-500 mb-1 block">年齡</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                  value={data.personalDetails.age}
                  onChange={e => handlePersonalChange('age', e.target.value)}
                  placeholder="輸入數字"
                />
             </div>
          </div>
          <div className="md:col-span-2">
             <label className="text-xs text-slate-500 mb-1 block">聯絡方式 (選填)</label>
             <input 
                type="text" 
                className="w-full border border-slate-300 rounded p-2 text-sm"
                value={data.personalDetails.contact}
                onChange={e => handlePersonalChange('contact', e.target.value)}
             />
          </div>
        </div>
      </section>

      {/* 2. Person Brief (New Section) */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center mb-2 text-teal-700">
          <FileText className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">人物簡述與事件描述</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">請簡述個案背景、當前主要問題或近期發生的關鍵事件。</p>
        <textarea
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          value={data.personBrief}
          onChange={(e) => onChange({...data, personBrief: e.target.value})}
          placeholder="例如：王伯伯原本獨居，上週因在家浴室跌倒被鄰居發現，子女希望能安排有人看顧的環境..."
        />
      </section>

      {/* 3. Assessment Matrix */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-6">
           <div className="flex items-center text-teal-700">
            <Activity className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">評估量表 (30題)</h3>
           </div>
           {/* Score display removed to prevent user anxiety */}
        </div>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border-t border-b border-slate-200 py-4">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              {renderQuestionText(q.text, q.id)}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAnswerChange(q.id, '')}
                  className={`text-xs py-2 px-1 rounded border h-full flex items-center justify-center ${!data.answers[q.id] ? 'bg-slate-100 border-slate-400 text-slate-600 font-bold' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  無/未選
                </button>
                <button
                  onClick={() => handleAnswerChange(q.id, 'low')}
                  className={`text-xs py-2 px-1 rounded border h-full flex items-center justify-center text-center ${data.answers[q.id] === 'low' ? 'bg-green-100 border-green-500 text-green-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {q.options.low}
                </button>
                <button
                  onClick={() => handleAnswerChange(q.id, 'medium')}
                  className={`text-xs py-2 px-1 rounded border h-full flex items-center justify-center text-center ${data.answers[q.id] === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {q.options.medium}
                </button>
                <button
                  onClick={() => handleAnswerChange(q.id, 'high')}
                  className={`text-xs py-2 px-1 rounded border h-full flex items-center justify-center text-center ${data.answers[q.id] === 'high' ? 'bg-red-100 border-red-500 text-red-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {q.options.high}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Qualitative Input */}
      <section>
        <div className="flex items-center mb-2 text-teal-700">
          <MessageSquare className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">其他狀態敘述</h3>
        </div>
        <textarea
          rows={4}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          value={data.qualitativeAnalysis}
          onChange={(e) => onChange({...data, qualitativeAnalysis: e.target.value})}
          placeholder="例如：個案飲食習慣、睡眠品質、特殊偏好或家屬特別交辦事項..."
        />
      </section>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className={`w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white transition-all
          ${isLoading 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:transform active:scale-[0.98]'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成分析報告...
          </>
        ) : (
          <>
            <PlayCircle className="w-6 h-6 mr-2" />
            生成照顧建議與服務報價
          </>
        )}
      </button>
    </div>
  );
};
