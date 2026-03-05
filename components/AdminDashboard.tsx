
import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, RefreshCcw, Printer, UserCheck, Loader2, Filter, Download, MoreVertical, UtensilsCrossed, CheckCircle, QrCode, LayoutDashboard } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Attendee } from '../types';
import { mockDb } from '../services/mockDb';
import { generateWelcomeMessage } from '../services/geminiService';
import UniversalQRCodeManager from './UniversalQRCodeManager';

interface Props {
  onBack: () => void;
  activeTab: 'list' | 'universal-qr';
}

const ALL_MEALS = [
  { id: 'd1_b', label: '3.26 早餐' }, { id: 'd1_l', label: '3.26 午餐' }, { id: 'd1_d', label: '3.26 晚餐' },
  { id: 'd2_b', label: '3.27 早餐' }, { id: 'd2_l', label: '3.27 午餐' }, { id: 'd2_d', label: '3.27 晚餐' }
];

const AdminDashboard: React.FC<Props> = ({ onBack, activeTab }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'checked-in'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setAttendees(mockDb.getAttendees());
  }, [activeTab]);

  const handleReset = () => {
    if (confirm('确定要重置所有签到数据吗？')) {
      const reset = mockDb.resetData();
      setAttendees(reset);
    }
  };

  const handleManualCheckIn = async (attendee: Attendee) => {
    setLoadingId(attendee.id);
    try {
      const welcome = await generateWelcomeMessage(attendee.name, attendee.company);
      const updated: Attendee = {
        ...attendee,
        status: 'checked-in',
        checkInTime: Date.now(),
        personalizedWelcome: welcome
      };
      mockDb.saveAttendee(updated);
      setAttendees(mockDb.getAttendees());
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePrintBadge = (attendee: Attendee) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      alert('请允许弹出窗口以进行打印');
      return;
    }
    const badgeHtml = `
      <html>
        <head><title>EPSON Badge - ${attendee.name}</title><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-white p-10 flex flex-col items-center">
          <div class="w-[100mm] h-[150mm] border-[4px] border-[#001c71] p-8 flex flex-col items-center text-center">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Epson_logo.svg/2560px-Epson_logo.svg.png" class="h-6 mb-10" />
             <h1 class="text-2xl font-black text-[#001c71]">轻彩破界 智胜未来</h1>
             <div class="w-40 h-40 bg-slate-100 rounded-3xl my-10 overflow-hidden"><img src="${attendee.avatar || ''}" class="w-full h-full object-cover"/></div>
             <h2 class="text-4xl font-black">${attendee.name}</h2>
             <p class="text-lg text-slate-500 mt-2">${attendee.company}</p>
          </div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(badgeHtml);
    printWindow.document.close();
  };

  const exportToCSV = (data: any[], fileName: string) => {
    setIsExporting(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
      const csvContent = "data:text/csv;charset=utf-8,\ufeff" + headers + "\n" + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  const registeredAttendees = attendees.filter(a => a.name !== '无胸卡人员');

  const handleExportAttendees = () => {
    const data = registeredAttendees.map(a => ({
      姓名: a.name,
      公司: a.company,
      手机号: a.phoneNumber,
      二维码编码: a.qrCode || '-',
      状态: a.status === 'checked-in' ? '已签到' : '待报到'
    }));
    exportToCSV(data, '爱普生会议嘉宾名单');
  };

  const handleExportMeals = () => {
    setIsExporting(true);
    
    // Calculate statistics
    let totalMeals = 0;
    let d1Meals = 0;
    let d2Meals = 0;
    
    const detailedData: { index: number, time: string }[] = [];
    let currentIndex = 1;

    attendees.forEach(a => {
      if (a.mealsTaken) {
        a.mealsTaken.forEach(mealId => {
          totalMeals++;
          if (mealId.startsWith('d1')) d1Meals++;
          if (mealId.startsWith('d2')) d2Meals++;
          
          const timestamp = a.mealTimestamps?.[mealId] || Date.now();
          const date = new Date(timestamp);
          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
          
          detailedData.push({
            index: currentIndex++,
            time: `${dateStr} ${timeStr}`
          });
        });
      }
    });

    // Create the HTML content for PDF
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'sans-serif';
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">餐饮报表</h1>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 10px;">
            餐饮总计数量：<span style="color: #2563eb; font-size: 24px;">${totalMeals}</span> 份
          </div>
          <div style="display: flex; justify-content: center; gap: 40px; font-size: 16px; color: #475569;">
            <div>3.26 用餐数量：<span style="font-weight: bold; color: #0f172a;">${d1Meals}</span> 份</div>
            <div>3.27 用餐数量：<span style="font-weight: bold; color: #0f172a;">${d2Meals}</span> 份</div>
          </div>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px;">序号</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px;">用餐时间</th>
          </tr>
        </thead>
        <tbody>
          ${detailedData.map(row => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 10px; font-size: 13px;">${row.index}</td>
              <td style="border: 1px solid #e2e8f0; padding: 10px; font-size: 13px;">${row.time}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: right;">
        导出时间：${new Date().toLocaleString()}
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `餐饮报表_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      setIsExporting(false);
    });
  };

  const filtered = registeredAttendees.filter(a => {
    const matchesSearch = 
      a.name.includes(searchTerm) || 
      a.phoneNumber.includes(searchTerm) || 
      a.company.includes(searchTerm) ||
      (a.qrCode && a.qrCode.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalCount = registeredAttendees.length;
  const checkedInCount = registeredAttendees.filter(a => a.status === 'checked-in').length;
  const totalMealsCount = attendees.reduce((acc, curr) => acc + (curr.mealsTaken?.length || 0), 0);
  
  const d1MealsCount = attendees.reduce((acc, curr) => 
    acc + (curr.mealsTaken?.filter(m => m.startsWith('d1')).length || 0), 0);
  const d2MealsCount = attendees.reduce((acc, curr) => 
    acc + (curr.mealsTaken?.filter(m => m.startsWith('d2')).length || 0), 0);

  const getParticipationLabel = (type: Attendee['participationType']) => {
    switch(type) {
      case '1-day-d1': return { text: '3.26', classes: 'bg-blue-50 text-blue-600' };
      case '1-day-d2': return { text: '3.27', classes: 'bg-indigo-50 text-indigo-600' };
      case '2-day': return { text: '2天', classes: 'bg-emerald-50 text-emerald-600' };
      default: return { text: '未知', classes: 'bg-slate-50 text-slate-400' };
    }
  };

  return (
    <div className="p-10 animate-in fade-in duration-500">
      {activeTab === 'list' ? (
        <>
          {/* 顶部核心数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#001c71] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-4">实时签到进度 / Attendance</p>
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-7xl font-black italic">{checkedInCount}</h3>
                      <span className="text-2xl font-black text-blue-400">/ {totalCount}</span>
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3 border border-white/5">
                       <div className="h-full bg-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.5)]" style={{ width: `${(checkedInCount / Math.max(totalCount, 1)) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black text-blue-300 uppercase">当前到场率: {totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0}%</p>
                  </div>
               </div>
               <CheckCircle className="absolute -right-12 -bottom-12 text-white/5 w-64 h-64 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">餐饮核验总计 / Meals Taken</p>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-4">
                        <h3 className="text-7xl font-black italic text-slate-900">{totalMealsCount}</h3>
                        <span className="text-2xl font-black text-slate-300">份</span>
                      </div>
                      <button 
                        onClick={handleExportMeals}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black hover:bg-slate-100 hover:text-[#001c71] transition-all shadow-sm active:scale-95"
                      >
                        <Download size={14}/> 导出餐饮报表
                      </button>
                    </div>
                    <div className="flex gap-12 mt-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-blue-600 uppercase tracking-wider">3.26</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black italic text-slate-900">{d1MealsCount}</span>
                          <span className="text-sm font-black text-slate-400">份</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-wider">3.27</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black italic text-slate-900">{d2MealsCount}</span>
                          <span className="text-sm font-black text-slate-400">份</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                     数据实时更新
                  </div>
               </div>
               <UtensilsCrossed className="absolute -right-12 -bottom-12 text-slate-50 w-64 h-64 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>

          {/* 搜索与工具栏 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="relative w-full md:w-[500px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="搜索嘉宾姓名、手机号、公司名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-slate-100 border-none rounded-[1.5rem] text-sm font-black focus:ring-4 focus:ring-[#001c71]/5 outline-none shadow-inner"
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as any)}
                   className="pl-10 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black text-slate-600 outline-none focus:ring-4 focus:ring-[#001c71]/5 appearance-none min-w-[140px]"
                 >
                   <option value="all">全部状态</option>
                   <option value="pending">待报到</option>
                   <option value="checked-in">已签到</option>
                 </select>
               </div>
               <button onClick={handleReset} title="重置系统" className="px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-xs font-black text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"><RefreshCcw size={16}/></button>
               <button 
                onClick={handleExportAttendees}
                className="flex items-center gap-2 px-8 py-5 bg-[#001c71] text-white rounded-[1.5rem] text-xs font-black hover:bg-blue-800 shadow-xl shadow-blue-100 active:scale-95 transition-all"
               >
                <Download size={16}/> 导出嘉宾名单
               </button>
            </div>
          </div>

          {/* 名单表格 */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-10 py-6">嘉宾详情</th>
                  <th className="px-10 py-6">手机号</th>
                  <th className="px-10 py-6">二维码编码</th>
                  <th className="px-10 py-6 text-center">参会行程</th>
                  <th className="px-10 py-6 text-center">用餐进度 (点阵)</th>
                  <th className="px-10 py-6 text-center">报到状态</th>
                  <th className="px-16 py-6 text-right">现场操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(attendee => {
                  const label = getParticipationLabel(attendee.participationType);
                  return (
                    <tr key={attendee.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                            {attendee.avatar ? <img src={attendee.avatar} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300 m-auto mt-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-base leading-tight">{attendee.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[180px]">{attendee.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="text-slate-300" />
                          <span className="font-bold text-sm tracking-tight">{attendee.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-2 text-slate-600">
                          <QrCode size={14} className="text-slate-300" />
                          <span className="font-bold text-sm tracking-tight">{attendee.qrCode || '-'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight ${label.classes}`}>
                          {label.text}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                           {ALL_MEALS.map(meal => (
                             <div 
                               key={meal.id} 
                               title={meal.label}
                               className={`w-2.5 h-2.5 rounded-full transition-all ${
                                 attendee.mealsTaken?.includes(meal.id) 
                                 ? 'bg-[#001c71] shadow-[0_0_8px_rgba(0,28,113,0.3)]' 
                                 : 'border-2 border-slate-200 bg-transparent'
                               }`}
                             ></div>
                           ))}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        {attendee.status === 'checked-in' ? (
                          <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest">已签到</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-slate-300 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                             <span className="text-[10px] font-black uppercase tracking-widest italic">待报到</span>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          {attendee.status === 'pending' ? (
                            <button 
                              onClick={() => handleManualCheckIn(attendee)}
                              className="flex items-center gap-2 px-6 py-4 bg-[#001c71] text-white rounded-2xl text-[10px] font-black hover:bg-blue-800 shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all"
                              disabled={loadingId === attendee.id}
                            >
                              {loadingId === attendee.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                              签到
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePrintBadge(attendee)}
                              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                            >
                              <Printer size={16} /> 打印
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-32 text-center text-slate-300">
                <Search size={64} className="mx-auto mb-6 opacity-5" />
                <p className="text-sm font-black uppercase tracking-[0.5em]">未发现匹配的参会名单</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <UniversalQRCodeManager />
      )}
      
      {isExporting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-sm font-black text-slate-700">正在生成 CSV 报表并导出...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
