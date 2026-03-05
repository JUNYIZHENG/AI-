
import React, { useState, useEffect } from 'react';
import { ScanLine, CheckCircle, AlertCircle, Coffee, Utensils, XCircle, Clock, CalendarDays, RefreshCw } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { Attendee } from '../types';

interface Props {
  onBack: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner';
type DayType = 'day1' | 'day2';

const MEAL_NAMES: Record<MealType, string> = {
  breakfast: '自助早餐',
  lunch: '自助午餐',
  dinner: '自助晚餐'
};

const DAY_NAMES: Record<DayType, string> = {
  day1: '3月26日',
  day2: '3月27日'
};

const HotelScan: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState<'scanning' | 'result'>('scanning');
  const [currentSession, setCurrentSession] = useState<{ day: DayType, meal: MealType } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ status: 'success' | 'error' | 'already' } | null>(null);

  // 自动根据时间匹配餐次
  const updateSession = () => {
    const now = new Date();
    const day = now.getDate() <= 26 ? 'day1' : 'day2';
    const hour = now.getHours();
    
    let meal: MealType = 'lunch'; // 默认午餐
    if (hour < 10) meal = 'breakfast';
    else if (hour >= 16) meal = 'dinner';
    
    setCurrentSession({ day, meal });
  };

  useEffect(() => {
    updateSession();
  }, []);

  const mealId = currentSession ? `${currentSession.day}_${currentSession.meal}` : 'unknown';

  const simulateProcess = (type: 'success' | 'error' | 'already') => {
    setIsProcessing(true);
    setResult(null);

    setTimeout(() => {
      if (type === 'success' && currentSession) {
        // 模拟成功保存
        // Fix: Added missing required property 'participationType'
        const dummy: Attendee = {
          id: 'temp-id',
          name: '测试嘉宾',
          company: '测试单位',
          phoneNumber: '13800000000',
          status: 'checked-in',
          registerTime: Date.now(),
          participationType: '2-day',
          mealsTaken: [mealId],
          mealTimestamps: { [mealId]: Date.now() }
        };
        mockDb.saveAttendee(dummy);
      }
      setResult({ status: type });
      setIsProcessing(false);
      setStep('result');
    }, 1200);
  };

  // 1. 扫描/核验中页面
  if (step === 'scanning') {
    return (
      <div className="px-6 py-6 animate-in slide-in-from-right-4 duration-500">
        <div className="mb-8 p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex items-center justify-between shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 shadow-sm border border-white/5">
                 {currentSession?.meal === 'breakfast' ? <Coffee size={28} /> : <Utensils size={28} />}
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                   <Clock size={10} /> 自动识别当前餐次
                </p>
                <h4 className="text-base font-black text-white">
                  {currentSession ? `${DAY_NAMES[currentSession.day]} · ${MEAL_NAMES[currentSession.meal]}` : '正在检测时间...'}
                </h4>
              </div>
           </div>
           <button onClick={updateSession} className="p-2 bg-white/5 text-slate-400 rounded-xl active:scale-95 transition-all">
             <RefreshCw size={18} />
           </button>
        </div>

        <div className="space-y-4">
          <div className="w-full py-16 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 mb-6 bg-white relative overflow-hidden">
            {isProcessing ? (
               <div className="flex flex-col items-center animate-in fade-in">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600 animate-pulse">验证参会证通行权限...</span>
               </div>
            ) : (
              <>
                <ScanLine size={80} className="mb-4 text-slate-100 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center px-10">
                  请持萝卜电子证件嘉宾<br/>
                  对准摄像头或点击下方模拟
                </span>
              </>
            )}
          </div>
          
          {!isProcessing && (
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => simulateProcess('success')}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <CheckCircle size={20} />
                <span>模拟：核验成功</span>
              </button>

              <button
                onClick={() => simulateProcess('already')}
                className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <AlertCircle size={20} />
                <span>模拟：重复领取</span>
              </button>

              <button
                onClick={() => simulateProcess('error')}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <XCircle size={20} />
                <span>模拟：无效凭证</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. 结果展示页面 - 已移除个人信息展示
  return (
    <div className="px-6 py-6 animate-in zoom-in-95 duration-500">
      {result && (
        <div className="animate-in slide-in-from-bottom-6">
          <div className={`p-8 py-12 rounded-[2.5rem] shadow-2xl border-t-8 mb-6 bg-white flex flex-col items-center text-center ${
            result.status === 'success' ? 'border-emerald-500' : 
            result.status === 'already' ? 'border-amber-500' : 'border-red-500'
          }`}>
            <div className={`p-8 rounded-[2.5rem] mb-10 ${
              result.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
              result.status === 'already' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
            }`}>
              {result.status === 'success' ? <CheckCircle size={80} /> : 
               result.status === 'already' ? <AlertCircle size={80} /> : <XCircle size={80} />}
            </div>
            
            <h4 className={`text-3xl font-black mb-4 leading-tight ${
              result.status === 'success' ? 'text-emerald-900' : 
              result.status === 'already' ? 'text-amber-900' : 'text-red-900'
            }`}>
              {result.status === 'success' ? '核验通过，请用餐' : 
               result.status === 'already' ? '该餐次已核验' : '凭证无效'}
            </h4>

            <p className="text-slate-400 text-sm font-medium mb-12">
              {result.status === 'success' ? '权限已激活，祝您用餐愉快' : 
               result.status === 'already' ? '当前证件在此餐次已有通行记录' : '系统未检索到有效的报到激活记录'}
            </p>

            <div className="w-full p-4 bg-slate-50 rounded-2xl mb-10 border border-slate-100 flex items-center justify-center gap-4">
                <CalendarDays size={18} className="text-slate-300" />
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
                  {currentSession ? `${DAY_NAMES[currentSession.day].split(' ')[0]} ${MEAL_NAMES[currentSession.meal]}` : '---'}
                </p>
            </div>

            <div className="w-full">
              <button
                onClick={() => setStep('scanning')}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all text-lg"
              >
                继续下一位核验
              </button>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">
            Hospitality Auto-Detection Mode
          </p>
        </div>
      )}
    </div>
  );
};

export default HotelScan;
