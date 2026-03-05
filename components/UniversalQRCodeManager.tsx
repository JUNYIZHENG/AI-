
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Save, RefreshCw, QrCode, Settings2, Info } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { UniversalQRCodeConfig } from '../types';

const ALL_MEALS = [
  { id: 'd1_b', label: '3.26 早餐' }, { id: 'd1_l', label: '3.26 午餐' }, { id: 'd1_d', label: '3.26 晚餐' },
  { id: 'd2_b', label: '3.27 早餐' }, { id: 'd2_l', label: '3.27 午餐' }, { id: 'd2_d', label: '3.27 晚餐' }
];

const UniversalQRCodeManager: React.FC = () => {
  const [config, setConfig] = useState<UniversalQRCodeConfig>(mockDb.getUniversalConfig());
  const [limitInput, setLimitInput] = useState(config.limit.toString());
  const [isSaving, setIsSaving] = useState(false);

  const scanUrl = `${window.location.origin}${window.location.pathname}?view=universal-scan`;

  const handleSaveLimit = () => {
    const newLimit = parseInt(limitInput);
    if (isNaN(newLimit) || newLimit < 0) {
      alert('请输入有效的数字');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const updated = mockDb.updateUniversalConfig({ limit: newLimit });
      setConfig(updated);
      setIsSaving(false);
    }, 500);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('universal-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1200; // Extra space for text
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR Code
        ctx.drawImage(img, 100, 100, 800, 800);
        
        // Add Text
        ctx.fillStyle = '#001c71';
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('爱普生会议 - 万能就餐二维码', 500, 950);
        
        ctx.fillStyle = '#64748b';
        ctx.font = '30px Inter, sans-serif';
        ctx.fillText(`适用范围: 全场通用就餐登记`, 500, 1000);
        
        ctx.font = 'italic 24px Inter, sans-serif';
        ctx.fillText('请向工作人员出示此码进行核验', 500, 1060);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `万能二维码_通用.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleQuickTest = () => {
    try {
      // Determine meal based on time (same as UniversalScan)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDate() === 26 ? 'd1' : 'd2';
      let mealId = '';
      if (hour < 10) mealId = `${day}_b`;
      else if (hour < 15) mealId = `${day}_l`;
      else mealId = `${day}_d`;

      mockDb.recordUniversalMeal(mealId);
      setConfig(mockDb.getUniversalConfig());
      alert(`模拟登记成功！已增加一条“无胸卡人员”记录。`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuration Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Settings2 className="text-[#001c71] w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">参数配置</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">扫描次数上限</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="flex-1 px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#001c71]/5 outline-none"
                />
                <button 
                  onClick={handleSaveLimit}
                  disabled={isSaving}
                  className="px-6 bg-[#001c71] text-white rounded-2xl font-black text-xs hover:bg-blue-800 transition-all disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                </button>
              </div>
              <p className="mt-3 text-[10px] text-slate-400 font-bold italic flex items-center gap-1">
                <Info size={10} /> 默认上限为 50 次，支持随时修改。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-[#001c71] w-5 h-5" />
            <h4 className="font-black text-[#001c71] text-sm">使用说明</h4>
          </div>
          <ul className="text-xs text-slate-600 font-bold space-y-3 leading-relaxed">
            <li>• 该二维码专为无胸卡人员设计。</li>
            <li>• 每次扫描将自动在后台增加一条“无胸卡人员”的就餐记录。</li>
            <li>• 达到上限后二维码依然有效，无需重新生成。</li>
          </ul>
        </div>
      </div>

      {/* QR Code Preview Card */}
      <div className="lg:col-span-2">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl h-full flex flex-col items-center justify-center text-center">
          <div className="mb-10 relative">
            <div className="absolute -inset-4 bg-slate-50 rounded-[3rem] -z-10"></div>
            <div className="p-6 bg-white rounded-[2.5rem] shadow-inner">
              <QRCodeSVG 
                id="universal-qr-code"
                value={scanUrl} 
                size={280}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#001c71] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <QrCode size={24} />
            </div>
          </div>

          <div className="max-w-md mb-10">
            <h3 className="text-2xl font-black text-slate-900 mb-4">万能二维码预览</h3>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">当前已扫</p>
                <p className={`text-3xl font-black ${config.currentCount > config.limit ? 'text-red-500' : 'text-[#001c71]'}`}>
                  {config.currentCount}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">扫描上限</p>
                <p className="text-3xl font-black text-slate-300">{config.limit}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${config.currentCount > config.limit ? 'bg-red-500' : 'bg-[#001c71]'}`}
                style={{ width: `${Math.min((config.currentCount / config.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={downloadQRCode}
              className="flex items-center gap-3 px-10 py-5 bg-[#001c71] text-white rounded-[1.5rem] font-black hover:bg-blue-800 shadow-2xl shadow-blue-200 active:scale-95 transition-all"
            >
              <Download size={20} /> 下载万能二维码
            </button>
            
            <button 
              onClick={handleQuickTest}
              className="flex items-center gap-3 px-10 py-5 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-[1.5rem] font-black hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <RefreshCw size={20} /> 快速测试 (+1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalQRCodeManager;
