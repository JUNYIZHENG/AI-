
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Cpu, QrCode as QrIcon, Printer, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { Attendee } from '../types';

interface Props {
  attendee: Attendee;
  onBack: () => void;
}

const agendaData = {
  day1: {
    date: '2026-03-26',
    items: [
      { time: '09:00 - 09:30', title: '开幕式：轻彩破界主题发布', location: '主宴会厅 (1F)' },
      { time: '12:00 - 13:30', title: '合作伙伴交流午宴', location: '四季餐厅 (1F)' },
      { time: '18:30 - 20:30', title: '爱普生之夜：颁奖盛典', location: '景观露台' },
    ]
  },
  day2: {
    date: '2026-03-27',
    items: [
      { time: '09:30 - 11:30', title: '轻形畅印：新品实机品鉴', location: '多功能厅 (3F)' },
      { time: '12:00 - 13:30', title: '闭门研讨会', location: '贵宾室 (5F)' },
    ]
  }
};

const BadgeView: React.FC<Props> = ({ attendee, onBack }) => {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');

  return (
    <div className="p-10 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* 左侧：证件渲染预览 */}
        <div className="lg:w-1/3 flex flex-col items-center">
          <div className="relative w-[320px] aspect-[2/3] bg-[#001c71] rounded-[1.5rem] shadow-2xl overflow-hidden border-8 border-white group">
            <div className="absolute top-6 right-8 text-white font-black text-xl italic opacity-50">EPSON</div>
            <div className="absolute top-12 left-0 right-0 px-8 text-center">
              <h2 className="text-white text-3xl font-black italic">轻彩破界</h2>
              <h2 className="text-white text-3xl font-black italic">智胜未来</h2>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 flex flex-col items-center w-full">
               <div className="w-28 h-28 bg-white p-1 rounded-2xl shadow-xl mb-4 overflow-hidden border-2 border-white">
                  <img src={attendee.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+attendee.name} className="w-full h-full object-cover" />
               </div>
               <h3 className="text-white text-xl font-black">{attendee.name}</h3>
               <p className="text-blue-200 text-[10px] font-bold px-6 truncate w-full text-center uppercase tracking-wider">{attendee.company}</p>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
               <div className="bg-white p-2 rounded-lg shadow-lg"><QrIcon size={40} className="text-slate-900" /></div>
            </div>
          </div>
          <button onClick={() => window.print()} className="mt-8 flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
             <Printer size={18} /> 打印当前证件
          </button>
        </div>

        {/* 右侧：详细信息与 AI 赋能 */}
        <div className="flex-1 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareQuote size={60} /></div>
             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu size={14} /> AI 智能欢迎辞渲染
             </h4>
             <p className="text-xl font-black text-slate-800 leading-relaxed italic">
               “{attendee.personalizedWelcome || '欢迎参加爱普生年度盛会，期待与您共创未来。'}”
             </p>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900">参会专属议程</h3>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button onClick={() => setActiveDay('day1')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeDay === 'day1' ? 'bg-[#001c71] text-white shadow-md' : 'text-slate-400'}`}>3.26</button>
                  <button onClick={() => setActiveDay('day2')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeDay === 'day2' ? 'bg-[#001c71] text-white shadow-md' : 'text-slate-400'}`}>3.27</button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agendaData[activeDay].items.map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                    <div className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center gap-1.5"><Clock size={12}/>{item.time}</div>
                    <h4 className="text-base font-bold text-slate-800 mb-3">{item.title}</h4>
                    <div className="text-[10px] text-slate-400 font-bold uppercase"><MapPin size={10} className="inline mr-1" />{item.location}</div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BadgeView;
