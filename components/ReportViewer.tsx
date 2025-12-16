
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, FileText, Printer, Copy, Check, Table } from 'lucide-react';
import { AssessmentData, SelectedService } from '../types';
import { RadarChart } from './RadarChart';
import { ServiceCalculator } from './ServiceCalculator';
import { SERVICES_CATALOG, DIMENSION_NAMES } from '../constants';

interface Props {
  report: string | null;
  isLoading: boolean;
  data: AssessmentData; // Pass full data for chart and calculator
}

export const ReportViewer: React.FC<Props> = ({ report, isLoading, data }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Effect to initialize recommended services when data changes (logic moved from ServiceCalculator)
  useEffect(() => {
    const scores = [
      data.dimensions.physical,
      data.dimensions.family,
      data.dimensions.mental,
      data.dimensions.management
    ];
    
    // Determine active dimensions (score > 10 is Yellow/Red)
    const activeDimIndices = scores
      .map((score, idx) => score > 10 ? idx : -1)
      .filter(idx => idx !== -1);

    const initialServices = SERVICES_CATALOG
      .filter(service => service.recommendedFor.some(dimIdx => activeDimIndices.includes(dimIdx)))
      // Exclude Service Packages (pkg1, pkg2, pkg3) from auto-selection
      .filter(service => !['pkg1', 'pkg2', 'pkg3'].includes(service.id))
      .map(service => ({
        ...service,
        dailyFreq: service.defaultQuantity,
        monthlyDays: 30 // Default full month
      }));
      
    // Remove duplicates
    let uniqueServices = Array.from(new Map(initialServices.map(item => [item.id, item])).values());
    
    // Mutual Exclusion: s_meal vs s_meal_single
    // If both are present, prioritize s_meal (Daily) and remove s_meal_single
    const hasMeal = uniqueServices.some(s => s.id === 's_meal');
    if (hasMeal) {
        uniqueServices = uniqueServices.filter(s => s.id !== 's_meal_single');
    }

    setSelectedServices(uniqueServices);
  }, [data.dimensions]); // Dependency on dimensions

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

  const handleCopyReport = async () => {
    if (!report) return;
    try {
        await navigator.clipboard.writeText(report);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
        console.error('Failed to copy', err);
        alert('複製失敗，請手動選取文字複製。');
    }
  };

  const handleExportCSV = () => {
    // 1. Prepare Data
    // Calculate total cost
    let monthlyTotal = 0;
    const servicesList = selectedServices.map(s => {
        let cost = 0;
        if (s.calculationBasis === 'per_month') {
            const dailyUnitPrice = s.unit === '月' ? s.price / 30 : s.price;
            cost = dailyUnitPrice * s.dailyFreq * s.monthlyDays;
        } else {
            cost = s.price * s.dailyFreq * s.monthlyDays;
        }
        monthlyTotal += cost;
        return `${s.name}(${s.dailyFreq}${s.unit}/日, ${s.monthlyDays}天)`;
    }).join('; ');

    const headers = [
        '姓名', '性別', '年齡', '總分', '風險等級',
        DIMENSION_NAMES[0], DIMENSION_NAMES[1], DIMENSION_NAMES[2], DIMENSION_NAMES[3],
        '加值服務清單', '預估月費'
    ];

    const row = [
        data.personalDetails.name,
        data.personalDetails.gender,
        data.personalDetails.age,
        data.totalScore,
        data.riskLevel,
        data.dimensions.physical,
        data.dimensions.family,
        data.dimensions.mental,
        data.dimensions.management,
        `"${servicesList}"`, // Quote to handle commas/semicolons
        monthlyTotal
    ];

    // 2. Generate CSV Content with BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + [
        headers.join(','),
        row.join(',')
    ].join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `評估報告_${data.personalDetails.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-none relative pb-10">
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
         <button 
           onClick={handleCopyReport}
           className={`flex items-center text-sm px-3 py-1.5 rounded transition-colors border shadow-sm
             ${copyStatus === 'copied' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
             }`}
           title="複製報告內容 (Markdown 格式)，可直接貼上至 Notion"
         >
           {copyStatus === 'copied' ? (
             <Check className="w-4 h-4 mr-1" />
           ) : (
             <Copy className="w-4 h-4 mr-1" />
           )}
           {copyStatus === 'copied' ? '已複製' : '複製內容'}
         </button>
         
         <button 
            onClick={handleExportCSV}
            className="flex items-center text-sm bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-600 transition-colors"
            title="匯出為 Excel 可讀格式 (.csv)"
         >
            <Table className="w-4 h-4 mr-1 text-green-700" />
            匯出試算表
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
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">決策支援小助手</span>
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

      {/* Service Calculator (Controlled Component) */}
      <ServiceCalculator 
         data={data} 
         selectedServices={selectedServices}
         onServicesChange={setSelectedServices}
      />

      {/* Footer Actions for Print view */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center print:mt-4 print:pt-4">
        <p className="text-xs text-slate-400 italic">
          評估時間：{getTodayDate()}
        </p>
      </div>
    </div>
  );
};
