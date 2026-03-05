
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, UserCheck, User, ShieldAlert, ScanLine, ArrowRight, Phone, ShieldCheck, UserSearch, Building2, Cpu, Printer, Waves } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { Attendee } from '../types';
import { generateWelcomeMessage } from '../services/geminiService';

interface Props {
  onComplete: (attendee: Attendee) => void;
  onBack: () => void;
}

const CheckIn: React.FC<Props> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'scan' | 'identity' | 'upload' | 'printing'>('scan');
  const [searchPhone, setSearchPhone] = useState('');
  const [error, setError] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printStatus, setPrintStatus] = useState('正在初始化...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模拟打印流程
  useEffect(() => {
    if (step === 'printing') {
      const statuses = [
        { p: 10, s: '正在连接爱普生专业打印机...' },
        { p: 25, s: '正在校准 PrecisionCore 打印头...' },
        { p: 45, s: '正在传输高精度证件位图...' },
        { p: 70, s: '正在喷印彩色证件 (300dpi)...' },
        { p: 90, s: '打印即将完成，请在出口领取...' },
        { p: 100, s: '打印成功！' }
      ];

      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < statuses.length) {
          setPrintProgress(statuses[currentIndex].p);
          setPrintStatus(statuses[currentIndex].s);
          currentIndex++;
        } else {
          clearInterval(interval);
          if (selectedAttendee) {
            onComplete(selectedAttendee);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, selectedAttendee, onComplete]);

  const handleStartProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('identity');
    }, 800);
  };

  const handlePhoneLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!searchPhone.trim()) {
      setError('请输入手机号进行检索');
      return;
    }

    const found = mockDb.findByPhone(searchPhone.trim());
    if (found) {
      if (found.status === 'checked-in') {
        setIsProcessing(true);
        setTimeout(() => onComplete(found), 600);
      } else {
        setSelectedAttendee(found);
        if (found.avatar) setAvatar(found.avatar);
        setStep('upload');
      }
    } else {
      setError('未匹配到导入名单，请核对手机号');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedAttendee || !avatar) return;
    setIsProcessing(true);

    try {
      const welcome = await generateWelcomeMessage(selectedAttendee.name, selectedAttendee.company);
      const updated: Attendee = {
        ...selectedAttendee,
        avatar,
        status: 'checked-in',
        checkInTime: Date.now(),
        personalizedWelcome: welcome
      };
      mockDb.saveAttendee(updated);
      setSelectedAttendee(updated);
      setStep('printing');
    } catch (err) {
      setError('签到保存失败');
      setIsProcessing(false);
    }
  };

  if (step === 'scan') {
    return (
      <div className="px-6 py-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center text-center">
          <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
             <div className="absolute inset-0 bg-blue-600/10 rounded-[2.5rem] animate-ping opacity-20"></div>
             <ScanLine size={56} className="relative z-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">轻彩破界 智胜未来</h3>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium">请扫描现场二维码开始身份确认</p>
          <button onClick={handleStartProcess} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-lg">
            立即扫码启动
          </button>
        </div>
      </div>
    );
  }

  if (step === 'identity') {
    return (
      <div className="px-6 py-6 animate-in slide-in-from-right-4">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><UserSearch size={24} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-800">参会身份核验</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Epson Partner Summit 2026</p>
            </div>
          </div>
          <form onSubmit={handlePhoneLookup} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400"><Phone size={20} /></div>
              <input type="tel" placeholder="请输入参会手机号" required value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="w-full pl-12 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none"/>
            </div>
            {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">{error}</div>}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
              验证手机号 <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="px-6 py-6 animate-in slide-in-from-bottom-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <h3 className="text-2xl font-black mb-1">{selectedAttendee?.name}</h3>
          <p className="text-slate-400 text-xs font-bold"><Building2 size={12} className="inline mr-1" />{selectedAttendee?.company}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center">
          <div onClick={() => fileInputRef.current?.click()} className="w-48 h-48 rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden relative group">
            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-300" />}
            <input type="file" ref={fileInputRef} hidden accept="image/*" capture="user" onChange={handleFileChange} />
          </div>
          <button onClick={handleCheckIn} disabled={!avatar || isProcessing} className="w-full mt-10 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-50">
            {isProcessing ? '正在处理...' : '提交签到并打印证件'}
          </button>
        </div>
      </div>
    );
  }

  // 核心变更：打印机交互展示
  if (step === 'printing') {
    return (
      <div className="px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-10">
            {/* 打印机图标与波动动画 */}
            <div className="absolute inset-0 bg-blue-50 rounded-[2.5rem] flex items-center justify-center">
               <Printer size={56} className="text-blue-600 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-75"></span>
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">正在打印纸质证件</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">{printStatus}</p>

          {/* 进度条 */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-50">
             <div 
               className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
               style={{ width: `${printProgress}%` }}
             ></div>
          </div>
          
          <div className="flex justify-between w-full px-1">
             <span className="text-[10px] font-black text-blue-600">{printProgress}%</span>
             <span className="text-[10px] font-black text-slate-300 uppercase">EPSON L-Series High-Res</span>
          </div>

          {/* 打印头动态模拟效果 */}
          <div className="mt-10 w-full overflow-hidden h-1 relative">
             <div className="absolute top-0 bottom-0 w-8 bg-blue-400/50 blur-sm animate-[scan_1.5s_infinite]"></div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full">
           <Waves size={16} className="text-blue-500 animate-pulse" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PrecisionCore Technology Powered</span>
        </div>

        <style>{`
          @keyframes scan {
            0% { left: -20%; }
            100% { left: 120%; }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default CheckIn;
