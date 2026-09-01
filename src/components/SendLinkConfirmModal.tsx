import { useState } from 'react';
import { X, MessageCircle, Mail, Send, HelpCircle } from 'lucide-react';
import { Envelope, Signer } from '../types';
import { encodeEnvelopeForLink } from '../utils/pdfHelper';

interface SendLinkConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelope: Envelope;
  signers: Signer[];
  onDecline: () => void; // Follow current flow (go to sign view)
}

export function SendLinkConfirmModal({
  isOpen,
  onClose,
  envelope,
  signers,
  onDecline,
}: SendLinkConfirmModalProps) {
  const [step, setStep] = useState<'confirm' | 'channel'>('confirm');

  if (!isOpen) return null;

  const encoded = encodeEnvelopeForLink(envelope);
  const signingUrl = `${window.location.origin}/sign/${envelope.shareCode}#data=${encoded}`;

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  const handleDecline = () => {
    setStep('confirm');
    onDecline();
  };

  const handleWhatsApp = () => {
    const firstSigner = signers[0];
    const phone = firstSigner?.whatsapp?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(
      `📄 Você recebeu um documento para assinatura eletrônica!\n\n` +
      `📋 Título: ${envelope.title}\n` +
      `🔑 Código: ${envelope.shareCode}\n` +
      `📋 Documentos: ${envelope.files.length}\n\n` +
      `🔗 Acesse o link para assinar:\n${signingUrl}`
    );
    window.open(phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
    handleClose();
  };

  const handleEmail = () => {
    const firstSigner = signers[0];
    const to = firstSigner?.email || '';
    const subject = encodeURIComponent(`Documento para Assinatura: ${envelope.title}`);
    const body = encodeURIComponent(
      `Prezado(a) ${firstSigner?.name || 'Signatário(a)'},\n\n` +
      `Você recebeu um documento para assinatura eletrônica.\n\n` +
      `📋 Título: ${envelope.title}\n` +
      `🔑 Código: ${envelope.shareCode}\n` +
      `📋 Documentos: ${envelope.files.length}\n\n` +
      `🔗 Acesse o link abaixo para assinar:\n${signingUrl}\n\n` +
      `Atenciosamente,\nPlataforma de Assinaturas Logmam`
    );
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            {step === 'confirm' ? 'Enviar Link de Assinatura' : 'Escolher Canal de Envio'}
          </h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 'confirm' ? (
            <>
              {/* Step 1: Confirm */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Deseja enviar o link para assinatura?</h3>
                <p className="text-xs text-slate-400">
                  O link de assinatura mobile será enviado para os signatários do envelope "{envelope.title}".
                </p>
              </div>

              {/* Envelope summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-[10px] text-slate-500">Envelope</div>
                <div className="text-xs font-bold text-white">{envelope.title}</div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{envelope.files.length} documento(s)</span>
                  <span>{signers.length} signatário(s)</span>
                  <span className="text-emerald-400 font-mono">{envelope.shareCode}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDecline}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Não, assinar agora
                </button>
                <button
                  onClick={() => setStep('channel')}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Sim, enviar link
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Choose channel */}
              <div className="text-center space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  Enviar o link de assinatura através de:
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleWhatsApp}
                  className="w-full px-4 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-3 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <div className="text-left">
                    <div>WhatsApp</div>
                    {signers[0]?.whatsapp && (
                      <div className="text-[10px] text-slate-400 font-normal">{signers[0].whatsapp}</div>
                    )}
                  </div>
                </button>
                <button
                  onClick={handleEmail}
                  className="w-full px-4 py-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl text-sm font-bold flex items-center gap-3 transition"
                >
                  <Mail className="w-5 h-5" />
                  <div className="text-left">
                    <div>Outlook Mobile</div>
                    {signers[0]?.email && (
                      <div className="text-[10px] text-slate-400 font-normal">{signers[0].email}</div>
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep('confirm')}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition pt-1"
              >
                ← Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
