import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, FileText, Printer, Copy, Check } from 'lucide-react';
import { AssessmentData } from '../types';
import { RadarChart } from './RadarChart';
import { ServiceCalculator } from './ServiceCalculator';

interface Props {
  report: string | null;
  isLoading: boolean;
  data: AssessmentData; // Pass full data for chart and calculator
}

export const ReportViewer: React.FC<Props> = ({ report, isLoading, data }) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-3 w-full max-w-lg">
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          <div className="h-3 bg-slate-200 rounded w-4/6"></div>
        </div>
        <p className="text-slate-400 text-sm font-medium">AI 正在分析問卷數據並規劃建議...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p>尚未生成報告</p>
        <p className="text-sm mt-2">請填寫左側完整問卷後點擊「生成」</p>
      </div>
    );
  }

  const handleCopyNotion = () => {
    // Basic Markdown format that pastes well into Notion
    const content = `
# 住戶評估報告: ${data.personalDetails.name}

**基本資料**
- 性別: ${data.personalDetails.gender}
- 年齡: ${data.personalDetails.age}
- 總分: ${data.totalScore} (${data.riskLevel})

**四面向得分**
- 身體照顧: ${data.dimensions.physical}
- 家庭溝通: ${data.dimensions.family}
- 精神行為: ${data.dimensions.mental}
- 照顧管理: ${data.dimensions.management}

---
**AI 建議報告**

${report}
    `;
    navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-none relative">
      
      {/* Action Buttons */}
      <div className="absolute top-[-4rem] right-0 flex gap-2 print:hidden">
         <button 
           onClick={handleCopyNotion}
           className="flex items-center text-sm bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600 transition-colors"
         >
           {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
           {copied ? '已複製' : '複製為 Notion 格式'}
         </button>
         <button 
            onClick={() => window.print()} 
            className="flex items-center text-sm bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 transition-colors shadow-sm"
         >
            <Printer className="w-4 h-4 mr-1" />
            列印 / PDF
         </button>
      </div>

      {/* Visual Analytics */}
      <RadarChart dimensions={data.dimensions} />

      <div className="prose prose-slate prose-headings:text-teal-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 max-w-none">
        <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
          <Bot className="w-5 h-5 text-teal-600" />
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">AI Generated Assessment</span>
        </div>
        
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-teal-900" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 text-teal-800 border-l-4 border-teal-500 pl-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-800" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 mb-4" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-red-600 bg-red-50 px-1 rounded" {...props} />, 
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
          }}
        >
          {report}
        </ReactMarkdown>
      </div>

      {/* Service Calculator */}
      <ServiceCalculator data={data} />

      <div className="mt-12 pt-6 border-t border-slate-200 text-center print:mt-4 print:pt-4">
        <p className="text-xs text-slate-400 italic">
          本報告由 AI 輔助生成，僅供參考。實際護理計畫應由專業醫療團隊評估後執行。
        </p>
      </div>
    </div>
  );
};
