'use client'

import React, { useState } from 'react';
import { X, Check, Landmark, ShieldCheck, Heart } from 'lucide-react';
import { Contribution } from '@/lib/pray-types';

interface CongDucModalProps {
  onClose: () => void;
  onAddContribution: (newDonation: Omit<Contribution, 'id' | 'timestamp'>) => void;
  isSoundOn: boolean;
}

export default function CongDucModal({
  onClose,
  onAddContribution,
  isSoundOn
}: CongDucModalProps) {
  const [donor, setDonor] = useState('');
  const [amount, setAmount] = useState<number>(20000);
  const [customAmountText, setCustomAmountText] = useState('');
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(false);

  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmountText('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmountText(e.target.value);
    const parsed = Number(e.target.value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleProceedToQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Số tiền công đức phải lớn hơn 0đ");
      return;
    }
    setShowQR(true);
  };

  const handleCompleteDonation = () => {
    onAddContribution({
      sender: donor.trim() || 'Phật tử ẩn danh',
      amount: amount,
      message: message.trim() || 'Thành kính cúng dường gieo duyên lành.'
    });

    if (isSoundOn) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 2);
      } catch (e) {}
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[200] select-none">

      <div className="fixed inset-0 cursor-default" onClick={onClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-lg border border-orange-100 shadow-2xl flex flex-col overflow-hidden max-h-[92vh] z-10 transition-all">

        <div className="flex justify-between items-center bg-gradient-to-r from-orange-400 to-orange-500 p-6 text-white border-b border-orange-200/15">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-orange-100 animate-pulse fill-orange-100" />
            <div>
              <h3 className="font-extrabold text-lg">Hòm Công Đức Duyên Lành</h3>
              <p className="text-[10px] text-orange-100 font-mono tracking-wider">SECURE DIGITAL SYSTEM PRAY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col gap-6">

          {!showQR ? (
            <form onSubmit={handleProceedToQR} className="flex flex-col gap-5">

              <div className="text-sm text-zinc-600 leading-relaxed font-sans">
                Chúc tụng phác duyên lành cúng dường tịnh tài giúp tôn tạo cảnh quan, bồi đắp đức lành thanh yên.
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pháp danh / Tên nhà hảo tâm</label>
                <input
                  type="text"
                  placeholder="Để trống nếu muốn khởi sự ẩn danh..."
                  value={donor}
                  onChange={(e) => setDonor(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-zinc-200 rounded-xl focus:ring-1 focus:ring-orange-500 bg-zinc-50 text-zinc-800 placeholder-zinc-400 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Chọn định mức công đức (VNĐ)</label>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-2 text-xs font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                        amount === val && !customAmountText
                          ? 'bg-orange-50 border-orange-400 text-orange-700'
                          : 'bg-zinc-50 border-zinc-200/50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {val.toLocaleString()}đ
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hoặc gieo duyên số tùy ý</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    placeholder="Nhập số tiền khác..."
                    value={customAmountText}
                    onChange={handleCustomAmountChange}
                    className="w-full text-sm pl-4 pr-12 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:ring-1 focus:ring-orange-500 text-zinc-800 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">VNĐ</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Lời chúc hoặc ước nguyện kèm theo</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cầu nguyện gia đình bình an, tai qua nạn khỏi..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm px-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:ring-1 focus:ring-orange-500 text-zinc-800 text-ellipsis outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-sm tracking-widest transition-all mt-4 uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Tiến Hành Nhận Mã QR Công Đức
              </button>

            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-5">

              <div className="p-3.5 bg-emerald-50 rounded-full text-emerald-800 flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h4 className="font-extrabold text-zinc-800 text-base">Cổng Gieo Duyên An Toàn Liên Kết</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Sử dụng ứng dụng ngân hàng quét mã bên dưới để chuyển khoản</p>
              </div>

              <div className="relative p-4 border-2 border-dashed border-amber-900/30 rounded-2xl bg-orange-50/15 flex flex-col items-center gap-3">

                <div className="flex justify-between items-center w-full max-w-[200px] border-b border-zinc-100 pb-1.5 text-[10px] font-bold">
                  <span className="text-blue-700 font-mono">VietQR</span>
                  <span className="text-orange-500">NAPAS 247</span>
                </div>

                <div className="w-48 h-48 bg-white border border-zinc-200/80 rounded-xl p-1.5 shadow-sm relative flex items-center justify-center">
                  <img
                    alt="Mock VietQR Code cúng dường"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=banking://vietqr/vcb/leanthai/congduc/sdspray/amount/${amount}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute w-10 h-10 bg-white border border-orange-100 rounded-lg flex items-center justify-center text-[8px] font-bold text-amber-900 shadow-xs">
                    PRAY
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-zinc-700 mt-1">
                  Số tiền quét: <span className="text-orange-600 text-sm">{amount.toLocaleString()}đ</span>
                </div>

                <div className="p-2 border border-zinc-100 bg-white rounded-lg text-[10px] text-zinc-400 font-sans tracking-tight">
                  Nội dung chuyển khoản tự do: <strong className="text-amber-800">CONG DUC SDS PRAY {donor || 'AN DANH'}</strong>
                </div>

              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={handleCompleteDonation}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm outline-none"
                >
                  <Check size={14} />
                  Tôi đã chuyển khoản hoàn tất thành công
                </button>

                <button
                  type="button"
                  onClick={() => setShowQR(false)}
                  className="w-full py-2.5 hover:bg-zinc-100 rounded-full text-xs font-bold text-zinc-500 transition-all outline-none"
                >
                  Quay lại chỉnh sửa số tiền
                </button>
              </div>

            </div>
          )}

        </div>

        <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
          <Landmark size={12} className="text-zinc-400" />
          <span>Hệ thống ghi nhận hoàn toàn tự động lưu chuyển vào bảng vàng lưu danh vô lượng công đức.</span>
        </div>

      </div>

    </div>
  );
}
