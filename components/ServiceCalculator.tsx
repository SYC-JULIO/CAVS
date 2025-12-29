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
    <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mt-8 print:bg-white print:border-slate-300">
      <div className="flex items-center mb-4 text-teal-800 border-b border-teal-200 pb-2 print:border-slate-300">
        <Calculator className="w-6 h-6 mr-2" />
        <h3 className="text-lg font-bold">住戶加值服務試算</h3>
      </div>
      
      {/* Add New Service Dropdown (Hidden on Print) */}
      <div className="mb-4 flex gap-2 print:hidden">
        <select 
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
          value={selectedAddId}
          onChange={(e) => setSelectedAddId(e.target.value)}
        >
          <option value="">+ 新增服務項目...</option>
          {availableServices.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} (${s.price}/{s.unit})
            </option>
          ))}
        </select>
        <button 
          onClick={() => addService(selectedAddId)}
          disabled={!selectedAddId}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          新增
        </button>
      </div>

      {/* List of Selected Services - Ensure full display in print */}
      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible service-list-container">
        {selectedServices.length === 0 && (
          <div className="text-center py-6 text-slate-400 bg-white rounded border border-dashed border-slate-300">
            尚未選擇任何服務。
          </div>
        )}
        
        {selectedServices.map(service => (
          <div 
            key={service.id} 
            className="flex flex-col p-3 rounded-lg border bg-white border-teal-200 shadow-sm gap-3 print:border-slate-300 print:break-inside-avoid"
          >
            <div className="flex justify-between items-start">
                <div className="flex items-start">
                    <div className="mr-3 text-teal-600 mt-1 print:text-slate-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-900">{service.name}</h4>
                        <div className="text-xs text-slate-500">{service.description}</div>
                        <div className="text-[10px] text-teal-700 bg-teal-50 inline-block px-1 rounded mt-1 print:bg-slate-50">
                            單價: ${service.price.toLocaleString()} / {service.unit}
                        </div>
                    </div>
                </div>
                <button onClick={() => removeService(service.id)} className="text-slate-400 hover:text-red-500 p-1 print:hidden">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center justify-end gap-4 bg-slate-50 p-2 rounded print:bg-transparent print:p-0">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-1">
                        {service.unit === '月' ? '數量(份)' : `每日${service.unit}`}
                    </span>
                    <div className="flex items-center bg-white rounded border border-slate-300 print:border-none">
                        <button onClick={() => updateDailyFreq(service.id, -1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-r print:hidden"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold text-slate-800">{service.dailyFreq}</span>
                        <button onClick={() => updateDailyFreq(service.id, 1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-l print:hidden"><Plus className="w-3 h-3" /></button>
                    </div>
                </div>

                <div className="text-slate-300">×</div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1"/>每月天數
                    </span>
                    <div className="flex items-center bg-white rounded border border-slate-300 print:border-none">
                        <button onClick={() => updateMonthlyDays(service.id, -1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-r print:hidden"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold text-slate-800">{service.monthlyDays}</span>
                        <button onClick={() => updateMonthlyDays(service.id, 1)} className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-l print:hidden"><Plus className="w-3 h-3" /></button>
                    </div>
                </div>

                <div className="text-slate-300">=</div>

                <div className="text-right min-w-[80px]">
                    <span className="text-[10px] text-slate-400 block">月預估</span>
                    <span className="font-mono text-sm font-bold text-teal-700 print:text-slate-900">
                        ${Math.round((service.unit === '月' ? service.price/30 : service.price) * service.dailyFreq * service.monthlyDays).toLocaleString()}
                    </span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section - Ensure visibility in print */}
      <div className="bg-white rounded-lg p-4 border border-teal-200 shadow-sm print:border-slate-300 print:break-inside-avoid">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500">
                * 費用試算僅供參考，實際收費請依簽約報價單為準。<br/>
                * 若選擇月費型項目，系統將依 (單價/30) × 天數 進行比例計算。
            </div>
            <div className="flex space-x-6">
                <div className="text-right border-l pl-6 border-slate-200 print:border-slate-300">
                    <div className="text-xs text-red-600 font-bold uppercase tracking-wider">加值服務月費總計</div>
                    <div className="text-3xl font-black text-red-600 font-mono">${totals.monthly.toLocaleString()}</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};