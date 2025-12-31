
import React, { useEffect, useState } from 'react';
import { AssessmentData, QuestionConfig } from '../types';
import { QUESTIONS, CRISIS_QUESTIONS } from '../constants';
import { calculateScores, calculateCrisisStatus, determinePersonalityType } from '../utils/scoring';
import { PlayCircle, User, Activity, MessageSquare, FileText, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

interface Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<Props> = ({ data, onChange, onGenerate, isLoading }) => {
  const [hoveredDescription, setHoveredDescription] = useState<Record<number, string>>({});

  useEffect(() => {
    const calculated = calculateScores(data.answers, data.personalDetails.age);
    const crisisStatus = calculateCrisisStatus(data.crisisAnswers);
    const personalityType = determinePersonalityType({ ...data, ...calculated });
    
    onChange({
      ...data,
      ...calculated,
      crisisStatus,
      personalityType
    });
  }, [data.answers, data.personalDetails.age, data.crisisAnswers]);

  const handlePersonalChange = (field: keyof AssessmentData['personalDetails'], value: string) => {
    onChange({
      ...data,
      personalDetails: { ...data.personalDetails, [field]: value }
    });
  };

  const handleAnswerChange = (qId: number, value: 'none' | 'low' | 'medium' | 'high' | null) => {
    const newAnswers = { ...data.answers };
    newAnswers[qId] = value;
    onChange({ ...data, answers: newAnswers });
  };

  const handleCrisisChange = (qId: number, value: boolean) => {
    onChange({
      ...data,
      crisisAnswers: { ...data.crisisAnswers, [qId]: value }
    });
  };

  // Group questions by part
  const groupedQuestions = QUESTIONS.reduce((acc, q) => {
    if (!acc[q.part]) acc[q.part] = [];
    acc[q.part].push(q);
    return acc;
  }, {} as Record<string, QuestionConfig[]>);

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
          <div>
            <label className="text-xs text-slate-500 mb-1 block">房間號碼 (若無請留空)</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2 text-sm"
              value={data.personalDetails.roomNumber}
              onChange={e => handlePersonalChange('roomNumber', e.target.value)}
              placeholder="例如：302-A"
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
          <div>
            <label className="text-xs text-slate-500 mb-1 block">評估人</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2 text-sm"
              value={data.personalDetails.assessor}
              onChange={e => handlePersonalChange('assessor', e.target.value)}
              placeholder="請輸入評估人姓名"
            />
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

      {/* 2. Person Brief */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center mb-2 text-teal-700">
          <FileText className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">人物簡述或其他事件描述</h3>
        </div>
        <textarea
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          value={data.personBrief}
          onChange={(e) => onChange({...data, personBrief: e.target.value})}
          placeholder="例如：個案過往職業背景、家庭狀況簡述..."
        />
      </section>

      {/* 3. Psychological Crisis Assessment */}
      <section className={`p-5 rounded-xl border transition-colors duration-300 ${
        data.crisisStatus === 'Red' ? 'bg-red-50 border-red-200' : 
        data.crisisStatus === 'Yellow' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center font-bold ${data.crisisStatus === 'Red' ? 'text-red-700' : 'text-slate-700'}`}>
            {data.crisisStatus === 'Red' ? <ShieldAlert className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
            心理危機判定 (10題)
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded ${
            data.crisisStatus === 'Red' ? 'bg-red-600 text-white' : 
            data.crisisStatus === 'Yellow' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'
          }`}>
            目前狀態：{data.crisisStatus === 'Red' ? '🔴 高度風險' : data.crisisStatus === 'Yellow' ? '🟡 中度風險' : '🟢 穩定'}
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mb-4">請依個案近兩週狀態回答「是」或「否」。</p>

        {data.crisisAnswers[10] && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-sm font-bold mb-4 flex items-center animate-pulse">
            <ShieldAlert className="w-6 h-6 mr-2" />
            偵測到關鍵題(Q10)危險：請立即啟動危機處理流程！
          </div>
        )}

        <div className="space-y-3">
          {CRISIS_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{q.category}</span>
                <p className="text-sm text-slate-800">{q.id}. {q.text}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleCrisisChange(q.id, true)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    data.crisisAnswers[q.id] === true 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  是
                </button>
                <button
                  onClick={() => handleCrisisChange(q.id, false)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    data.crisisAnswers[q.id] === false 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  否
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Assessment Matrix with Sections */}
      <section>
        <div className="flex items-center text-teal-700 mb-6 mt-6">
          <Activity className="w-5 h-5 mr-2" />
          <h3 className="font-semibold text-lg">風險評估量表 (30題)</h3>
        </div>
        
        <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border-t border-b border-slate-200 py-6">
          {Object.entries(groupedQuestions).map(([partName, questions]) => (
            <div key={partName} className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-teal-500 pl-3 mb-4">
                {partName}
              </h4>
              {questions.map((q) => (
                <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <p className="text-sm font-bold text-slate-800 mb-3">{q.id}. {q.text}</p>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onMouseEnter={() => setHoveredDescription(prev => ({ ...prev, [q.id]: q.descriptions[level] }))}
                        onMouseLeave={() => setHoveredDescription(prev => {
                            const next = {...prev};
                            delete next[q.id];
                            return next;
                        })}
                        onClick={() => handleAnswerChange(q.id, level)}
                        className={`text-xs py-2.5 px-1 rounded-lg border font-bold transition-all h-full flex flex-col items-center justify-center text-center leading-tight
                          ${data.answers[q.id] === level 
                            ? level === 'none' ? 'bg-slate-100 border-slate-500 text-slate-700 shadow-inner' :
                              level === 'low' ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' :
                              level === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800 shadow-inner' :
                              'bg-red-100 border-red-500 text-red-700 shadow-inner'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                      >
                        {q.options[level]}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Tooltip/Description Area */}
                  <div className={`mt-3 p-2.5 rounded-lg border transition-all duration-200 flex items-start ${
                    hoveredDescription[q.id] 
                      ? 'bg-teal-50 border-teal-100 opacity-100 translate-y-0' 
                      : 'bg-slate-50 border-transparent opacity-40 translate-y-1'
                  }`}>
                    <Info className={`w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 ${hoveredDescription[q.id] ? 'text-teal-600' : 'text-slate-300'}`} />
                    <span className={`text-[11px] leading-relaxed italic ${hoveredDescription[q.id] ? 'text-teal-800 font-medium' : 'text-slate-400'}`}>
                      {hoveredDescription[q.id] || "游標懸停選項可查看詳細說明文字"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Qualitative Input */}
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
            分析中，請稍候...
          </>
        ) : (
          <>
            <PlayCircle className="w-6 h-6 mr-2" />
            生成全面分析報告
          </>
        )}
      </button>
    </div>
  );
};
