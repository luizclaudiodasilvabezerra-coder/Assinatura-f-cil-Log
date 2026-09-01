import { Envelope, Signer } from '../types';
import { X, Send, Mail, MessageCircle, ChevronRight, FileText, Check } from 'lucide-react';
import { useState } from 'react';

interface SendToRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSigning: () => void;
  envelopes: Envelope[];
  activeEnvelopeId: string;
  onSelectEnvelope: (envelopeId: string) => void;
  currentEnvelope: Envelope;
  signers: Signer[];
}

export function SendToRecipientModal({
  isOpen,
  onClose,
  onProceedToSigning,
  envelopes,
  activeEnvelopeId,
  onSelectEnvelope,
  currentEnvelope,
  signers,
}: SendToRecipientModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            Enviar para Signatários
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Envelope Selection */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">SELECIONE O ENVELOPE</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {envelopes.map((env) => (
                <button
                  key={env.id}
                  onClick={() => onSelectEnvelope(env.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition text-left ${
                    env.id === activeEnvelopeId
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <FileText className={`w-4 h-4 shrink-0 ${env.id === activeEnvelopeId ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate ${env.id === activeEnvelopeId ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {env.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {env.files.length} doc(s) • {env.shareCode}
                    </div>
                  </div>
                  {env.id === activeEnvelopeId && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">CANAL DE ENVIO</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={() => setSelectedChannel('email')}
                className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
                  selectedChannel === 'email'
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                E-mail
              </button>
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">DESTINATÁRIOS</label>
            <div className="space-y-2">
              {signers.map((signer) => (
                <div key={signer.id} className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-400">{signer.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{signer.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {selectedChannel === 'whatsapp' ? signer.whatsapp : signer.email}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    signer.status === 'signed'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {signer.status === 'signed' ? 'Assinou' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 space-y-1">
            <div>Envelope: <span className="text-slate-300 font-bold">{currentEnvelope.title}</span></div>
            <div>Documentos: <span className="text-slate-300">{currentEnvelope.files.length}</span></div>
            <div>Código: <span className="text-emerald-400 font-mono">{currentEnvelope.shareCode}</span></div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              onClick={onProceedToSigning}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              Ir para Assinatura
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
