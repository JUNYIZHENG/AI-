
import React, { useState } from 'react';
import { Wine, MapPin, Sparkles, User, Search, MapPinned, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { Attendee } from '../types';

interface Props {
  onBack: () => void;
}

const DinnerTable: React.FC<Props> = ({ onBack }) => {
  const [searchName, setSearchName] = useState('');
  const [found, setFound] = useState<Attendee | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = (e?: React.FormEvent, manualName?: string) => {
    if (e) e.preventDefault();
    const targetName = manualName || searchName;
    if (!targetName) return;

    setSearching(true);
    setFound(null);
    setError('');

    setTimeout(() => {
      let attendee = mockDb.findByName(targetName);
      
      // 演示保险：如果没搜到，模拟一个成功的场景
      if (!attendee && (targetName === '张三' || targetName === 'demo')) {
          // Fix: Added missing phoneNumber and participationType to satisfy Attendee interface
          attendee = {
              id: 'demo-123',
              name: targetName === 'demo' ? '王大伟' : targetName,
              phoneNumber: '13800000000',
              company: '全球数字经济研究院',
              status: 'checked-in',
              registerTime: Date.now(),
              participationType: '2-day',
              tableNumber: '12',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear'
          };
          mockDb.saveAttendee(attendee);
      }

      if (attendee) {
        setFound(attendee);
      } else {
        setError('未找到记录。演示请尝试输入 "张三" 或点击下方快捷键。');
      }
      setSearching(false);
    }, 1200);
  };

  return (
    <div className="px-6 py-6 animate-in fade-in duration-500">
      {/* 仅在未找到结果（即搜索页）时显示顶部卡片 */}
      {!found && (
        <div className="bg-indigo-950 p-8 rounded-[2.5rem] text-white mb-8 text-center relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full -ml-16 -mb-16 opacity-10 blur-2xl"></div>
          <Wine className="mx-auto text-pink-400 mb-4" size={56} />
          <h3 className="text-2xl font-black tracking-tight mb-2">交流晚宴桌位查询</h3>
          <p className="text-indigo-300 text-[10px] opacity-80 uppercase tracking-[0.3em] font-black">Gala Dinner Seating</p>
        </div>
      )}

      {!found && !searching && (
        <div className="animate-in slide-in-from-bottom-6 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
            <h4 className="text-center font-black text-slate-800 mb-8">尊贵的嘉宾，请核对您的席位</h4>
            <form onSubmit={handleLookup} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="请输入您的参会姓名"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-12 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-lg"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all text-lg"
              >
                <Search size={22} />
                <span>立即查询席位</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <button 
                onClick={() => handleLookup(undefined, '张三')}
                className="p-5 bg-slate-100 rounded-[2rem] border border-slate-200 text-slate-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
             >
                <Sparkles size={18} className="text-amber-500" />
                一键体验“查询成功” (演示专用)
             </button>
          </div>
        </div>
      )}

      {searching && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative w-20 h-20">
             <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-10 text-indigo-900 font-black tracking-widest uppercase text-xs animate-pulse">正在为您排定坐席...</p>
        </div>
      )}

      {found && (
        <div className="animate-in zoom-in-95 duration-700">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-10 text-center text-white relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <p className="text-amber-200 text-xs font-black uppercase tracking-[0.4em] mb-4 relative z-10">Your Exclusive Seat</p>
              <div className="flex items-baseline justify-center gap-2 relative z-10">
                 <span className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-600 drop-shadow-2xl">
                    {found.tableNumber}
                 </span>
                 <span className="text-3xl font-black text-amber-400 uppercase">号桌</span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md relative z-10">
                 <CheckCircle2 size={16} className="text-emerald-400" />
                 <span className="text-[10px] font-black tracking-widest uppercase">身份核验已通过</span>
              </div>
            </div>
            
            <div className="p-10">
               <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner overflow-hidden">
                    {found.avatar ? (
                        <img src={found.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <Users size={32} className="text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-2xl mb-1">{found.name}</h5>
                    <p className="text-sm text-slate-400 font-bold truncate max-w-[200px]">{found.company}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                        <MapPinned size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">晚宴会场</p>
                      <p className="text-base font-black text-slate-800">酒店 3F 维多利亚大宴会厅</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <button
            onClick={() => { setFound(null); setSearchName(''); }}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-xl active:scale-95 transition-all text-lg"
          >
            返回重新查询
          </button>
        </div>
      )}
      
      <p className="mt-8 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.5em]">
        Elite Networking Experience
      </p>
    </div>
  );
};

export default DinnerTable;
