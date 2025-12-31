
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, FileText, Printer, Check, ShieldAlert, AlertTriangle, ShieldCheck, Database, Calendar as CalendarIcon, Loader2, UserPlus, Fingerprint } from 'lucide-react';
import { AssessmentData, SelectedService, RiskLevelType, ReportParts } from '../types';
import { RadarChart } from './RadarChart';
import { ServiceCalculator } from './ServiceCalculator';
import { SERVICES_CATALOG } from '../constants';
import { sendToMakeWebhook } from '../services/notionService';
import { getDimensionRiskLevel } from '../utils/scoring';

interface Props {
  report: ReportParts | null;
  isLoading: boolean;
  data: AssessmentData; 
  onReset: () => void;
}

const DEFAULT_WEBHOOK_URL = 'https://hook.us2.make.com/gt5gvni691qb5c2ne2cd3j5lpq9gdpky';

export const ReportViewer: React.FC<Props> = ({ report, isLoading, data, onReset }) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [todayDate] = useState(new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }));

  useEffect(() => {
    const scores = [
      data.dimensions.physical,
      data.dimensions.family,
      data.dimensions.mental,
      data.dimensions.management
    ];
    
    const activeDimIndices = scores
      .map((score, idx) => score > 10 ? idx : -1)
      .filter(idx => idx !== -1);

    const initialServices = SERVICES_CATALOG
      .filter(service => service.recommendedFor.some(dimIdx => activeDimIndices.includes(dimIdx)))
      .filter(service => !['pkg1', 'pkg2', 'pkg3'].includes(service.id))
      .map(service => ({
        ...service,
        dailyFreq: service.defaultQuantity,
        monthlyDays: 30 
      }));
      
    let uniqueServices = Array.from(new Map(initialServices.map(item => [item.id, item])).values());
    const hasMeal = uniqueServices.some(s => s.id === 's_meal');
    if (hasMeal) uniqueServices = uniqueServices.filter(s => s.id !== 's_meal_single');

    setSelectedServices(uniqueServices);
  }, [data.dimensions]);

  const handleExportToNotion = async () => {
    if (!report) return;
    setIsExporting(true);
    setExportStatus('idle');

    let monthlyTotal = 0;
    selectedServices.forEach(s => {
      const dailyUnitPrice = s.unit === '月' ? s.price / 30 : s.price;
      monthlyTotal += dailyUnitPrice * s.dailyFreq * s.monthlyDays;
    });

    // 個別加值服務名稱轉為標籤化項目 (逗號分隔，Notion 可設為多選)
    const serviceTags = selectedServices.map(s => s.name).join(', ');

    const getLightLabel = (score: number) => {
      const level = getDimensionRiskLevel(score);
      return level === 'Red' ? '🔴 紅燈' : level === 'Yellow' ? '🟡 黃燈' : '🟢 綠燈';
    };

    const payload = {
      評估人: data.personalDetails.assessor || '未填寫',
      姓名: data.personalDetails.name,
      房間號碼: data.personalDetails.roomNumber || '未安排',
      心理危機判定: data.crisisStatus === 'Red' ? '🔴 高度風險' : data.crisisStatus === 'Yellow' ? '🟡 中度風險' : '🟢 穩定',
      性格行為型態: data.personalityType,
      '照顧模式的複雜度:分數:燈號': `${data.dimensions.physical}分 : ${getLightLabel(data.dimensions.physical)}`,
      '家庭溝通成本:分數:燈號': `${data.dimensions.family}分 : ${getLightLabel(data.dimensions.family)}`,
      '衝突與風險管理:分數:燈號': `${data.dimensions.mental}分 : ${getLightLabel(data.dimensions.mental)}`,
      '後續維運成本:分數:燈號': `${data.dimensions.management}分 : ${getLightLabel(data.dimensions.management)}`,
      加值服務項目: serviceTags, 
      加值服務月費總計: Math.round(monthlyTotal),
      // 報告內容分拆匯出
      心理危機處置建議: report.crisisAdvice,
      風險管理策略: report.riskStrategy,
      服務預期產生效益: report.benefitAnalysis,
      評估日期: todayDate
    };

    try {
      await sendToMakeWebhook(DEFAULT_WEBHOOK_URL, payload);
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      alert("匯出至 Notion 失敗，請檢查網路連接。");
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAssessNext = () => {
    if (window.confirm("請確認已匯出pdf或匯出到notion，並清空本次評估結果？")) {
      onReset();
    }
  };

  const getSectionTheme = (status: RiskLevelType) => {
    switch(status) {
      case 'Red': return 'bg-red-50 border-red-200 text-red-900 border-l-8';
      case 'Yellow': return 'bg-amber-50 border-amber-200 text-amber-900 border-l-8';
      case 'Green': return 'bg-green-50 border-green-200 text-green-900 border-l-8';
      default: return 'bg-slate-50 border-slate-200 text-slate-900 border-l-8';
    }
  };

  const mdComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-black mb-4 text-teal-900" {...props} />,
    h2: ({node, children, ...props}) => {
      const textContent = String(children);
      let themeClass = "bg-slate-50 border-slate-200 text-slate-800";
      
      if (textContent.includes("心理危機處置建議")) {
        themeClass = getSectionTheme(data.crisisStatus);
      } else if (textContent.includes("風險管理策略")) {
        themeClass = getSectionTheme(data.riskLevel);
      } else if (textContent.includes("服務預期產生效益")) {
        themeClass = "bg-teal-50 border-teal-200 text-teal-900 border-l-8";
      }

      return (
        <h2 className={`text-xl font-bold mt-8 mb-4 p-4 rounded-r-xl transition-all ${themeClass}`} {...props}>
          {children}
        </h2>
      );
    },
    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3 text-slate-800 border-b border-slate-100 pb-1" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 mb-4" {...props} />,
    li: ({node, ...props}) => <li className="pl-1" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-red-700 bg-red-50 px-1 rounded" {...props} />, 
    p: ({node, ...props}) => <p className="mb-4 leading-relaxed px-2" {...props} />,
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-3 w-full max-w-lg">
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          <div className="h-3 bg-slate-200 rounded w-4/6"></div>
        </div>
        <p className="text-slate-400 text-sm font-medium">AI 正在整合風險評估與心理危機數據...</p>
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
        <p className="text-sm mt-2">請完成左側評估與心理危機判定</p>
      </div>
    );
  }

  return (
    <div className="max-w-none relative pb-10">
      
      <div className="bg-teal-700 text-white px-6 py-4 rounded-t-xl mb-0 flex justify-between items-center print:rounded-none">
        <h2 className="text-xl font-black flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          好好園館決策支援報告
        </h2>
        <div className="flex items-center text-sm font-bold opacity-90">
          <CalendarIcon className="w-4 h-4 mr-2" />
          評估日期：{todayDate}
        </div>
      </div>

      <div className="bg-white border-x border-b border-slate-200 p-8 rounded-b-xl print:border-none print:p-0">
        {/* Personal Details Row for Report */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">
          <div><span className="text-slate-400 text-[10px] uppercase block">評估人</span> {data.personalDetails.assessor || '-'}</div>
          <div><span className="text-slate-400 text-[10px] uppercase block">姓名</span> {data.personalDetails.name}</div>
          <div><span className="text-slate-400 text-[10px] uppercase block">房間</span> {data.personalDetails.roomNumber || '-'}</div>
          <div><span className="text-slate-400 text-[10px] uppercase block">年齡</span> {data.personalDetails.age} 歲</div>
        </div>

        <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-4 ${
          data.crisisStatus === 'Red' ? 'bg-red-50 border-red-200 text-red-800' :
          data.crisisStatus === 'Yellow' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className={`p-3 rounded-full shrink-0 ${
            data.crisisStatus === 'Red' ? 'bg-red-200' :
            data.crisisStatus === 'Yellow' ? 'bg-amber-200' : 'bg-green-200'
          }`}>
            {data.crisisStatus === 'Red' ? <ShieldAlert className="w-8 h-8 text-red-600" /> : 
             data.crisisStatus === 'Yellow' ? <AlertTriangle className="w-8 h-8 text-amber-600" /> : <ShieldCheck className="w-8 h-8 text-green-600" />}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-lg leading-tight">心理危機判定：{
              data.crisisStatus === 'Red' ? '🔴 高度危險 (立即介入)' : 
              data.crisisStatus === 'Yellow' ? '🟡 中度風險 (密切觀察)' : '🟢 穩定 (持續監測)'
            }</h3>
            <p className="text-sm opacity-90 font-medium mt-1">
              {data.crisisStatus === 'Red' ? '指令：啟動危機處理流程，通知家屬，24小時不離人，移除危險物品。' : 
               data.crisisStatus === 'Yellow' ? '指令：增加訪視頻率，與家屬建立聯繫網，連結醫療資源。' : '狀態：維持常規關懷與情緒支持，鼓勵社交。'}
            </p>
          </div>
          
          <div className="bg-white/50 px-4 py-2 rounded-lg border border-current flex flex-col items-center justify-center min-w-[120px]">
             <Fingerprint className="w-4 h-4 mb-1" />
             <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">行為型態</span>
             <span className="text-sm font-black">{data.personalityType}</span>
          </div>
        </div>

        <RadarChart dimensions={data.dimensions} />

        <div className="prose prose-slate prose-headings:text-teal-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 max-w-none mb-10 relative">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100 print:hidden">
            <Bot className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">管家決策系統專業報告</span>
          </div>
          
          <div className="space-y-4">
            <section>
              <h2 className={`text-xl font-bold p-4 rounded-r-xl ${getSectionTheme(data.crisisStatus)}`}>心理危機處置建議</h2>
              <ReactMarkdown components={mdComponents}>{report.crisisAdvice}</ReactMarkdown>
            </section>
            
            <section>
              <h2 className={`text-xl font-bold p-4 rounded-r-xl ${getSectionTheme(data.riskLevel)}`}>風險管理策略</h2>
              {/* Fixed undefined variable mdMarkdown by replacing it with mdComponents */}
              <ReactMarkdown components={mdComponents}>{report.riskStrategy}</ReactMarkdown>
            </section>

            <section>
              <h2 className="text-xl font-bold p-4 rounded-r-xl bg-teal-50 border-teal-200 text-teal-900 border-l-8">服務預期產生效益</h2>
              <ReactMarkdown components={mdComponents}>{report.benefitAnalysis}</ReactMarkdown>
            </section>
          </div>
        </div>

        <div className="print:break-inside-avoid print:mt-12">
          <ServiceCalculator 
             data={data} 
             selectedServices={selectedServices}
             onServicesChange={setSelectedServices}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4 border-t pt-8 print:hidden share-toolbar">
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center text-sm bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-bold">
              <Printer className="w-4 h-4 mr-2" />
              列印完整報告 / PDF
            </button>

            <button 
              onClick={handleExportToNotion}
              disabled={isExporting}
              className={`flex items-center text-sm font-bold px-6 py-2 rounded-lg transition-all shadow-md active:scale-95 ${
                exportStatus === 'success' 
                  ? 'bg-green-600 text-white' 
                  : isExporting 
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : exportStatus === 'success' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2 text-teal-100" />
              )}
              {isExporting ? '處理中...' : exportStatus === 'success' ? '匯出成功' : '確認並匯出到 Notion'}
            </button>
          </div>

          <button 
            onClick={handleAssessNext}
            className="flex items-center text-sm font-bold bg-slate-100 text-slate-600 px-6 py-2 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all shadow-sm active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-2 text-teal-600" />
            評估下一位
          </button>
        </div>
      </div>
    </div>
  );
};
