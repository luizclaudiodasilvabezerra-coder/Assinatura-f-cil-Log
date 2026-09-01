import { Envelope, Signer, SignatureSettings } from '../types';
import { X, Send, Download, Copy, Check, MessageCircle, Mail, Link2, FileText } from 'lucide-react';
import { useState } from 'react';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelope: Envelope;
  activeSigner: Signer;
  settings: SignatureSettings;
}

export function ShareExportModal({
  isOpen,
  onClose,
  envelope,
  activeSigner,
  settings,
}: ShareExportModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareUrl = `https://assinatura.logmam.com.br/e/${envelope.shareCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Documento assinado eletronicamente: ${envelope.title}\nCódigo: ${envelope.shareCode}\nHash SHA-256: ${envelope.sha256Hash.substring(0, 32)}...\nAcesse: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Documento Assinado: ${envelope.title}`);
    const body = encodeURIComponent(
      `Prezado(a),\n\nO documento "${envelope.title}" foi assinado eletronicamente.\n\nCódigo de verificação: ${envelope.shareCode}\nHash SHA-256: ${envelope.sha256Hash}\n\nAcesse: ${shareUrl}\n\nAtenciosamente,\n${activeSigner.name}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            Compartilhar & Exportar
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Envelope Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">{envelope.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500">Status:</span>{' '}
                <span className={`font-bold ${envelope.status === 'signed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {envelope.status === 'signed' ? '✓ Assinado' : 'Rascunho'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Documentos:</span>{' '}
                <span className="text-slate-300 font-bold">{envelope.files.length}</span>
              </div>
              <div>
                <span className="text-slate-500">Código:</span>{' '}
                <span className="text-emerald-400 font-mono font-bold">{envelope.shareCode}</span>
              </div>
              <div>
                <span className="text-slate-500">Atualizado:</span>{' '}
                <span className="text-slate-300">{envelope.updatedAt}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[9px] text-slate-500 font-mono break-all">
                SHA-256: {envelope.sha256Hash}
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">LINK DE COMPARTILHAMENTO</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 font-mono truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  copied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Send Channels */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">ENVIAR POR</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsApp}
                className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={handleEmail}
                className="px-4 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Mail className="w-4 h-4" />
                Outlook Mobile
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">EXPORTAR</label>
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700">
                <Download className="w-3.5 h-3.5" />
                Baixar PDF Assinado (com certificado)
              </button>
              <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700">
                <Download className="w-3.5 h-3.5" />
                Baixar Certificado de Auditoria
              </button>
              <button className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700">
                <Link2 className="w-3.5 h-3.5" />
                Gerar QR Code de Verificação
              </button>
            </div>
          </div>

          {/* Signer Info */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 mb-1">Assinado por</div>
            <div className="text-xs font-bold text-white">{activeSigner.name}</div>
            <div className="text-[10px] text-slate-500">{activeSigner.email} • {activeSigner.cpf}</div>
            {activeSigner.signedAt && (
              <div className="text-[10px] text-slate-500 mt-1">Data: {activeSigner.signedAt}</div>
            )}
            {activeSigner.geolocation && (
              <div className="text-[10px] text-slate-500">Local: {activeSigner.geolocation}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
