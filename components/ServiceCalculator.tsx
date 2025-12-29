import React, { useState } from 'react';
import { AssessmentData, SelectedService } from '../types';
import { SERVICES_CATALOG } from '../constants';
import { Calculator, Plus, Minus, Trash2, ShoppingBag, Calendar } from 'lucide-react';

interface Props {
  data: AssessmentData;
  selectedServices: SelectedService[];
  onServicesChange: (services: SelectedService[]) => void;
}

export const ServiceCalculator: React.FC<Props> = ({ data, selectedServices, onServicesChange }) => {
  const [selectedAddId, setSelectedAddId] = useState<string>("");

  const addService = (id: string) => {
    if (!id) return;
    const serviceToAdd = SERVICES_CATALOG.find(s => s.id === id);
    if (serviceToAdd) {
      if (!selectedServices.find(s => s.id === id)) {
        let newServices = [...selectedServices];

        if (id === 's_meal') {
            newServices = newServices.filter(s => s.id !== 's_meal_single');
        } else if (id === 's_meal_single') {
            newServices = newServices.filter(s => s.id !== 's_meal');
        }

        onServicesChange([...newServices, { 
            ...serviceToAdd, 
            dailyFreq: serviceToAdd.defaultQuantity,
            monthlyDays: 30
        }]);
      }
    }
    setSelectedAddId("");
  };

  const removeService = (id: string) => {
    onServicesChange(selectedServices.filter(s => s.id !== id));
  };

  const updateDailyFreq = (id: string, delta: number) => {
    onServicesChange(selectedServices.map(s => {
      if (s.id === id) {
        const newFreq = Math.max(1, s.dailyFreq + delta);
        return { ...s, dailyFreq: newFreq };
      }
      return s;
    }));
  };

  const updateMonthlyDays = (id: string, delta: number) => {
    onServicesChange(selectedServices.map(s => {
      if (s.id === id) {
        const newDays = Math.max(1, Math.min(31, s.monthlyDays + delta));
        return { ...s, monthlyDays: newDays };
      }
      return s;
    }));
  };

  const calculateTotal = () => {
    let monthlyTotal = 0;
    selectedServices.forEach(s => {
      if (s.calculationBasis === 'per_month') {
        let dailyUnitPrice = s.price;
        if (s.unit === '月') {
             dailyUnitPrice = s.price / 30;
        }
        monthlyTotal += dailyUnitPrice * s.dailyFreq * s.monthlyDays;
      } else {
        monthlyTotal += s.price * s.dailyFreq * s.monthlyDays;
      }
    });
    return { monthly: Math.round(monthlyTotal) };
  };

  const totals = calculateTotal();
  const availableServices = SERVICES_CATALOG.filter(
    s => !selectedServices.find(selected => selected.id === s.id)
  );

  return (
    <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 mt-8 print:bg-white print:border-slate-300 print:mt-12">
      <div className="flex items-center mb-6 text-teal-800 border-b-2 border-teal-200 pb-3 print:border-slate-300">
        <Calculator className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-bold uppercase tracking-tight">住戶加值服務試算明細</h3>
      </div>
      
      {/* Add New Service Dropdown (Hidden on Print) */}
      <div className="mb-6 flex gap-2 print:hidden">
        <select 
          className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all bg-white"
          value={selectedAddId}
          onChange={(e) => setSelectedAddId(e.target.value)}
        >
          <option value="">+ 新增更多服務項目...</option>
          {availableServices.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (${s.price.toLocaleString()}/{s.unit})
            </option>
          ))}
        </select>
        <button 
          onClick={() => addService(selectedAddId)}
          disabled={!selectedAddId}
          className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-teal-100"
        >
          新增
        </button>
      </div>

      {/* List of Selected Services - Ensure full display in print */}
      <div className="space-y-4 mb-8 overflow-y-visible service-list-container">
        {selectedServices.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            尚未選擇任何加值服務項目。
          </div>
        )}
        
        {selectedServices.map(service => (
          <div 
            key={service.id} 
            className="flex flex-col p-4 rounded-xl border-2 bg-white border-teal-100 shadow-sm gap-4 print:border-slate-300 print:break-inside-avoid print:shadow-none"
          >
            <div className="flex justify-between items-start">
                <div className="flex items-start">
                    <div className="mr-4 text-teal-600 mt-1 print:text-slate-700">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-base text-slate-900">{service.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">{service.description}</div>
                        <div className="text-[10px] font-bold text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded mt-2 print:bg-slate-100">
                            基準價: ${service.price.toLocaleString()} / {service.unit}
                        </div>
                    </div>
                </div>
                <button onClick={() => removeService(service.id)} className="text-slate-300 hover:text-red-500 p-1.5 transition-colors print:hidden">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center justify-end gap-5 bg-slate-50 p-3 rounded-xl print:bg-transparent print:p-0 print:border-t print:pt-3">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                        {service.unit === '月' ? '數量(份)' : `每日${service.unit}`}
                    </span>
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 print:border-none shadow-sm">
                        <button onClick={() => updateDailyFreq(service.id, -1)} className="px-3 py-1.5 hover:bg-slate-100 text-slate-500 border-r print:hidden transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-10 text-center text-sm font-black text-slate-800">{service.dailyFreq}</span>
                        <button onClick={() => updateDailyFreq(service.id, 1)} className="px-3 py-1.5 hover:bg-slate-100 text-slate-500 border-l print:hidden transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                <div className="text-slate-300 font-light">×</div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center uppercase tracking-widest">
                        <Calendar className="w-3 h-3 mr-1.5"/>每月天數
                    </span>
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 print:border-none shadow-sm">
                        <button onClick={() => updateMonthlyDays(service.id, -1)} className="px-3 py-1.5 hover:bg-slate-100 text-slate-500 border-r print:hidden transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-10 text-center text-sm font-black text-slate-800">{service.monthlyDays}</span>
                        <button onClick={() => updateMonthlyDays(service.id, 1)} className="px-3 py-1.5 hover:bg-slate-100 text-slate-500 border-l print:hidden transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                </div>

                <div className="text-slate-300 font-light">=</div>

                <div className="text-right min-w-[100px]">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-widest">單項月估</span>
                    <span className="font-mono text-base font-black text-teal-700 print:text-slate-900">
                        ${Math.round((service.unit === '月' ? service.price/30 : service.price) * service.dailyFreq * service.monthlyDays).toLocaleString()}
                    </span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section - Enhanced for print visibility */}
      <div className="bg-white rounded-2xl p-6 border-2 border-red-100 shadow-md print:total-box">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] text-slate-400 leading-relaxed italic max-w-md">
                * 本預算試算僅供生活服務配置參考，非最終簽約報價。<br/>
                * 週期性項目 (月費) 若天數不足整月，系統自動依比例折算。<br/>
                * 匯出至 Notion 後，此總計將自動同步至對應欄位。
            </div>
            <div className="flex items-center space-x-8">
                <div className="text-right border-l-4 pl-8 border-red-500 print:border-red-600">
                    <div className="text-sm text-red-600 font-black uppercase tracking-[0.2em] mb-1">加值服務月費總計</div>
                    <div className="text-5xl font-black text-red-600 font-mono tracking-tighter tabular-nums">
                      <span className="text-3xl mr-1">$</span>{totals.monthly.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};