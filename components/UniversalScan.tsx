
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Utensils } from 'lucide-react';
import { mockDb } from '../services/mockDb';

const UniversalScan: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [mealLabel, setMealLabel] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let mealId = params.get('meal');
    
    // If no meal specified, determine based on current time
    if (!mealId) {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDate() === 26 ? 'd1' : 'd2'; // Assuming D1 is 26th, D2 is 27th based on current time context
      
      if (hour < 10) mealId = `${day}_b`;
      else if (hour < 15) mealId = `${day}_l`;
      else mealId = `${day}_d`;
    }
    
    const labels: Record<string, string> = {
      'd1_b': '3.26 早餐', 'd1_l': '3.26 午餐', 'd1_d': '3.26 晚餐',
      'd2_b': '3.27 早餐', 'd2_l': '3.27 午餐', 'd2_d': '3.27 晚餐'
    };
    setMealLabel(labels[mealId] || '通用就餐');

    const recordMeal = async () => {
      try {
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        mockDb.recordUniversalMeal(mealId);
        setStatus('success');
        setMessage('用餐登记成功！感谢您的配合。');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || '登记失败，请联系现场工作人员。');
      }
    };

    recordMeal();
  }, []);

  return (
    <div className="min-h-screen bg-[#001c71] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
            <Utensils className="text-[#001c71] w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">万能就餐登记</h1>
        <p className="text-slate-400 font-bold text-sm mb-10 uppercase tracking-widest">{mealLabel}</p>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="w-12 h-12 text-[#001c71] animate-spin" />
            <p className="text-slate-600 font-bold">正在为您登记，请稍候...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-emerald-600 w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-emerald-600 mb-4">登记成功</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            <button 
              onClick={() => window.close()}
              className="w-full py-5 bg-[#001c71] text-white rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all"
            >
              完成
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-600 w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-red-600 mb-4">登记失败</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black active:scale-95 transition-all"
            >
              重试
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Epson_logo.svg/2560px-Epson_logo.svg.png" 
            className="h-4 mx-auto opacity-20 grayscale" 
            alt="Epson"
          />
        </div>
      </div>
    </div>
  );
};

export default UniversalScan;
