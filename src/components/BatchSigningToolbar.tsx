import { Signer, SignatureSettings, SigningMode } from '../types';
import { Zap, PenTool, Camera, Share2, Check, Settings2 } from 'lucide-react';

interface BatchSigningToolbarProps {
  totalFiles: number;
  totalPages: number;
  totalSignedPages: number;
  signer: Signer;
  settings: SignatureSettings;
  onUpdateSettings: (settings: SignatureSettings) => void;
  onBatchSignAllPages: () => void;
  onOpenSignatureModal: () => void;
  onOpenBiometricsModal: () => void;
  onCompleteAndShare: () => void;
  hasSignature: boolean;
  signingMode: SigningMode;
  onChangeSigningMode: (mode: SigningMode) => void;
}

export function BatchSigningToolbar({
  totalFiles,
  totalPages,
  totalSignedPages,
  signer,
  settings,
  onUpdateSettings,
  onBatchSignAllPages,
  onOpenSignatureModal,
  onOpenBiometricsModal,
  onCompleteAndShare,
  hasSignature,
  signingMode,
  onChangeSigningMode,
}: BatchSigningToolbarProps) {
  const progress = totalPages > 0 ? Math.round((totalSignedPages / totalPages) * 100) : 0;

  const toggleSetting = (key: keyof SignatureSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-3">
      {/* Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300">Progresso da Assinatura</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
          <span>{totalSignedPages} / {totalPages} páginas assinadas</span>
          <span>{totalFiles} documento(s)</span>
        </div>
      </div>

      {/* Active Signer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-[10px] font-bold text-slate-500 mb-2">SIGNATÁRIO ATIVO</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-400">
              {signer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{signer.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{signer.role} • {signer.cpf}</div>
          </div>
          {signer.status === 'signed' && (
            <div className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Assinou
            </div>
          )}
        </div>
      </div>

      {/* 1-Click Batch Sign Button */}
      <button
        onClick={onBatchSignAllPages}
        disabled={totalPages === 0}
        className="w-full px-4 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
      >
        <Zap className="w-5 h-5" />
        Assinar Todas as {totalPages} Páginas em Lote
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenSignatureModal}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
            hasSignature
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          {hasSignature ? 'Assinatura OK' : 'Criar Assinatura'}
        </button>
        <button
          onClick={onOpenBiometricsModal}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
            signer.biometricSelfieUrl
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {signer.biometricSelfieUrl ? 'Biometria OK' : 'Biometria'}
        </button>
      </div>

      <button
        onClick={onCompleteAndShare}
        disabled={totalSignedPages === 0}
        className="w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition"
      >
        <Share2 className="w-3.5 h-3.5" />
        Concluir e Compartilhar
      </button>

      {/* Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
          <Settings2 className="w-3 h-3" />
          CONFIGURAÇÕES DE ASSINATURA
        </div>
        {[
          { key: 'autoRubricAllPages' as const, label: 'Rubricar todas as páginas' },
          { key: 'autoSignLastPage' as const, label: 'Assinar última página' },
          { key: 'includeTimestamp' as const, label: 'Incluir carimbo de data/hora' },
          { key: 'includeCpf' as const, label: 'Incluir CPF na assinatura' },
          { key: 'includeAuditCertificate' as const, label: 'Certificado de auditoria' },
          { key: 'requireSelfieBiometrics' as const, label: 'Exigir biometria facial' },
          { key: 'requireGeolocation' as const, label: 'Exigir geolocalização' },
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between cursor-pointer group"
          >
            <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition">{item.label}</span>
            <button
              onClick={() => toggleSetting(item.key)}
              className={`w-8 h-4 rounded-full transition relative ${
                settings[item.key] ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                  settings[item.key] ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}
