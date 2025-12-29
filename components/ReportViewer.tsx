import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, FileText, Printer, Check, ShieldAlert, AlertTriangle, ShieldCheck, Share2, Link, Loader2, Database, Calendar as CalendarIcon } from 'lucide-react';
import { AssessmentData, SelectedService } from '../types';
import { RadarChart } from './RadarChart';
import { ServiceCalculator } from './ServiceCalculator';
import { SERVICES_CATALOG, DIMENSION_NAMES } from '../constants';
import { sendToMakeWebhook } from '../services/notionService';
import { getDimensionRiskLevel } from '../utils/scoring';

interface Props {
  report: string | null;
  isLoading: boolean;
  data: AssessmentData; 
}

export const ReportViewer: React.FC<Props> = ({ report, isLoading, data }) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>(localStorage.getItem('make_webhook_url') || '');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [todayDate] = useState(new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }));

  useEffect(() => {
    localStorage.setItem('make_webhook_url', webhookUrl);
  }, [webhookUrl]);

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

  const handleExportToNotion = async () => {
    if (!webhookUrl) {
      alert("請先在上方填入 Make.com Webhook URL");
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');

    let monthlyTotal = 0;
    selectedServices.forEach(s => {
      const dailyUnitPrice = s.unit === '月' ? s.price / 30 : s.price;
      monthlyTotal += dailyUnitPrice * s.dailyFreq * s.monthlyDays;
    });

    const getLightLabel = (score: number) => {
      const level = getDimensionRiskLevel(score);
      return level === 'Red' ? '🔴 紅燈' : level === 'Yellow' ? '🟡 黃燈' : '🟢 綠燈';
    };

    const payload = {
      // 按照使用者要求串連的項目
      姓名: data.personalDetails.name,
      房間號碼: data.personalDetails.roomNumber || '未安排',
      心理危機判定: data.crisisStatus === 'Red' ? '🔴 高度風險' : data.crisisStatus === 'Yellow' ? '🟡 中度風險' : '🟢 穩定',
      '照顧模式的複雜度:分數:燈號': `${data.dimensions.physical}分 : ${getLightLabel(data.dimensions.physical)}`,
      '家庭溝通成本:分數:燈號': `${data.dimensions.family}分 : ${getLightLabel(data.dimensions.family)}`,
      '衝突與風險管理:分數:燈號': `${data.dimensions.mental}分 : ${getLightLabel(data.dimensions.mental)}`,
      '後續維運成本:分數:燈號': `${data.dimensions.management}分 : ${getLightLabel(data.dimensions.management)}`,
      加值服務月費總計: Math.round(monthlyTotal),
      
      // 額外細節供後台記錄
      assessment_date: todayDate,
      raw_ai_report: report,
      detailed_services: selectedServices.map(s => ({
        name: s.name,
        price: s.price,
        unit: s.unit,
        qty: s.dailyFreq,
        days: s.monthlyDays,
        subtotal: Math.round((s.unit === '月' ? s.price/30 : s.price) * s.dailyFreq * s.monthlyDays)
      }))
    };

    try {
      await sendToMakeWebhook(webhookUrl, payload);
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-none relative pb-10">
      
      {/* Notion Integration Toolbar */}
      <div className="space-y-4 mb-6 print:hidden share-toolbar">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row gap-3 items-center shadow-inner">
          <div className="flex items-center text-slate-500 shrink-0">
            <Link className="w-4 h-4 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider">Make.com Webhook URL</span>
          </div>
          <input 
            type="text"
            placeholder="請貼上您的 Webhook URL"
            className="flex-1 text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-white"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => window.print()} className="flex items-center text-sm bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
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
      </div>

      {/* 報告標題 (含日期並排，靠右) */}
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
        {/* Psychological Crisis Banner */}
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
          <div>
            <h3 className="font-black text-lg leading-tight">心理危機判定：{
              data.crisisStatus === 'Red' ? '🔴 高度危險 (立即介入)' : 
              data.crisisStatus === 'Yellow' ? '🟡 中度風險 (密切觀察)' : '🟢 穩定 (持續監測)'
            }</h3>
            <p className="text-sm opacity-90 font-medium mt-1">
              {data.crisisStatus === 'Red' ? '指令：啟動危機處理流程，通知家屬，24小時不離人，移除危險物品。' : 
               data.crisisStatus === 'Yellow' ? '指令：增加訪視頻率，與家屬建立聯繫網，連結醫療資源。' : '狀態：維持常規關懷與情緒支持，鼓勵社交。'}
            </p>
          </div>
        </div>

        <RadarChart dimensions={data.dimensions} />

        <div className="prose prose-slate prose-headings:text-teal-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-li:text-slate-700 max-w-none mb-10">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100 print:hidden">
            <Bot className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">AI 管家決策系統生成之專業報告</span>
          </div>
          
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-black mb-4 text-teal-900" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 text-teal-800 border-l-4 border-teal-500 pl-3 bg-slate-50 py-1" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3 text-slate-800 border-b border-slate-100 pb-1" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 mb-4" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-red-700 bg-red-50 px-1 rounded" {...props} />, 
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            }}
          >
            {report}
          </ReactMarkdown>
        </div>

        {/* 加值服務區塊：確保列印時展開 */}
        <div className="print:break-inside-avoid print:mt-8">
          <ServiceCalculator 
             data={data} 
             selectedServices={selectedServices}
             onServicesChange={setSelectedServices}
          />
        </div>
      </div>
    </div>
  );
};