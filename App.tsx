
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Cpu, LogOut, Bell, Settings, QrCode } from 'lucide-react';
import { View, Attendee } from './types';
import AdminDashboard from './components/AdminDashboard';
import UniversalScan from './components/UniversalScan';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('admin-list');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'universal-scan') {
      setCurrentView('universal-scan');
    } else {
      window.location.hash = 'admin';
    }
  }, []);

  if (currentView === 'universal-scan') {
    return <UniversalScan />;
  }

  const Sidebar = () => (
    <div className="w-72 bg-[#001c71] h-screen fixed left-0 top-0 text-white flex flex-col p-8 shadow-2xl z-50">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
          <Cpu className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="font-black text-lg leading-tight tracking-tighter">爱萝卜</h1>
          <p className="text-[10px] text-blue-300 font-bold opacity-70 tracking-widest uppercase">会议管理系统</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all ${
              currentView.startsWith('admin') 
              ? 'bg-white/10 text-white' 
              : 'text-blue-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutDashboard size={20} /> 会务管理中心
            </div>
            <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </button>
          
          {isMenuOpen && (
            <div className="mt-2 ml-4 space-y-1 border-l border-white/10 pl-4 animate-in slide-in-from-top-2 duration-300">
              <button 
                onClick={() => setCurrentView('admin-list')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'admin-list' 
                  ? 'bg-white text-[#001c71] shadow-lg shadow-blue-900/50' 
                  : 'text-blue-200 hover:bg-white/5'
                }`}
              >
                <Users size={16} /> 嘉宾名单管理
              </button>
              <button 
                onClick={() => setCurrentView('admin-qr')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'admin-qr' 
                  ? 'bg-white text-[#001c71] shadow-lg shadow-blue-900/50' 
                  : 'text-blue-200 hover:bg-white/5'
                }`}
              >
                <QrCode size={16} /> 万能二维码
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="mt-auto pt-8 border-t border-white/10 text-center">
        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-4 italic opacity-50">Epson Enterprise Solution</p>
        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black text-blue-100/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={20} /> 退出管理系统
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 ml-72">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1 bg-[#001c71] rounded-full mr-2"></div>
        <h2 className="font-black text-slate-800 text-lg tracking-tight uppercase">
          {currentView === 'admin-list' ? '嘉宾名单管理' : '万能二维码管理'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2.5 text-slate-400 hover:text-[#001c71] hover:bg-slate-100 rounded-xl transition-all"><Bell size={20} /></button>
        <button className="p-2.5 text-slate-400 hover:text-[#001c71] hover:bg-slate-100 rounded-xl transition-all"><Settings size={20} /></button>
        <div className="w-px h-8 bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
           <div className="text-right">
             <p className="text-xs font-black">Admin Staff</p>
             <p className="text-[10px] text-slate-400 font-bold">Epson China</p>
           </div>
           <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
             <Users size={20} />
           </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar />
      <Header />
      <main className="ml-72 bg-white min-h-screen">
        <AdminDashboard 
          onBack={() => {}} 
          activeTab={currentView === 'admin-list' ? 'list' : 'universal-qr'} 
        />
      </main>
    </div>
  );
};

export default App;
