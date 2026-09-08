import { useState } from 'react';
import { X, Camera, MapPin, Check, ShieldCheck, ScanFace } from 'lucide-react';

interface BiometricVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { selfieUrl: string; locationStr: string; timestamp: string }) => void;
}

export function BiometricVerificationModal({
  isOpen,
  onClose,
  onConfirm,
}: BiometricVerificationModalProps) {
  const [step, setStep] = useState<'camera' | 'location' | 'done'>('camera');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [locationStr, setLocationStr] = useState('');

  if (!isOpen) return null;

  const handleCaptureSelfie = () => {
    // Simulate capturing a selfie
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(100, 80, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(60, 120, 80, 60);
    }
    setSelfieUrl(canvas.toDataURL('image/png'));
    setStep('location');
  };

  const handleCaptureLocation = () => {
    const now = new Date().toLocaleString('pt-BR');
    setLocationStr('São Paulo, SP • Brasil');
    setStep('done');
    onConfirm({
      selfieUrl: selfieUrl,
      locationStr: 'São Paulo, SP • Brasil',
      timestamp: now,
    });
  };

  const handleClose = () => {
    setStep('camera');
    setSelfieUrl('');
    setLocationStr('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verificação Biométrica
          </h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'camera' && (
            <>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center">
                <ScanFace className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-white mb-1">Captura Facial</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Posicione seu rosto dentro da moldura para verificação biométrica.
                </p>
                <button
                  onClick={handleCaptureSelfie}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto transition shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="w-4 h-4" />
                  Capturar Selfie
                </button>
              </div>
            </>
          )}

          {step === 'location' && (
            <>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center">
                <MapPin className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-white mb-1">Captura de Localização</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Sua localização GPS será registrada como evidência de segurança.
                </p>
                <button
                  onClick={handleCaptureLocation}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mx-auto transition shadow-lg shadow-emerald-500/20"
                >
                  <MapPin className="w-4 h-4" />
                  Registrar Localização
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-slate-950" />
              </div>
              <h3 className="text-sm font-bold text-white">Verificação Concluída!</h3>
              <p className="text-xs text-slate-400">
                Selfie e localização GPS registradas com sucesso.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">{locationStr}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2">
            {['camera', 'location', 'done'].map((s, idx) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  ['camera', 'location', 'done'].indexOf(step) >= idx ? 'bg-emerald-500 w-8' : 'bg-slate-700 w-6'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
