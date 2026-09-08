import { Envelope } from '../types';
import { encodeEnvelopeForLink } from '../utils/pdfHelper';
import { FileText, Plus, Send, Award, Trash2, Mail, CheckCircle2, Clock, ChevronRight, Link2, Copy } from 'lucide-react';
import { useState } from 'react';

interface EnvelopeTrackingViewProps {
  envelopes: Envelope[];
  onSelectEnvelope: (envelope: Envelope) => void;
  onCreateNewEnvelope: () => void;
  onOpenShareModal: (envelope: Envelope) => void;
  onOpenAuditModal: (envelope: Envelope) => void;
  onDeleteEnvelope: (envelopeId: string) => void;
  onSendForSigning: (envelope: Envelope) => void;
}

export function EnvelopeTrackingView({
  envelopes,
  onSelectEnvelope,
  onCreateNewEnvelope,
  onOpenShareModal,
  onOpenAuditModal,
  onDeleteEnvelope,
  onSendForSigning,
}: EnvelopeTrackingViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (env: Envelope) => {
    const encoded = encodeEnvelopeForLink(env);
    const link = `${window.location.origin}/sign/${env.shareCode}#data=${encoded}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedId(env.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Envelopes</h2>
          <p className="text-xs text-slate-400">{envelopes.length} envelope(s) registrado(s)</p>
        </div>
        <button
          onClick={onCreateNewEnvelope}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Novo Envelope
        </button>
      </div>

      {/* Envelope Cards */}
      {envelopes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <Mail className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum envelope criado</h3>
          <p className="text-xs text-slate-400">Crie um novo envelope para começar.</p>
          <button
            onClick={onCreateNewEnvelope}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Criar Envelope
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 cq-stack-grid">
          {envelopes.map((env) => {
            const totalPages = env.files.reduce((acc, f) => acc + f.pageCount, 0);
            const signedPages = env.files.reduce(
              (acc, f) => acc + f.pages.filter((p) => p.stamps.length > 0).length,
              0
            );
            const isSigned = env.status === 'signed';
            return (
              <div
                key={env.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-600 transition"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{env.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                        isSigned ? 'bg-emerald-500/15 text-emerald-400'
                          : env.status === 'sent' ? 'bg-sky-500/15 text-sky-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {isSigned ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isSigned ? 'Assinado' : env.status === 'sent' ? 'Enviado' : 'Rascunho'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{env.shareCode}</span>
                    </div>

                    {/* Mobile signing link for sent envelopes — click to open for signing */}
                    {env.status === 'sent' && !isSigned && (
                      <div className="mt-2 flex items-center gap-2 bg-slate-950 border border-sky-500/20 rounded-lg p-2">
                        <Link2 className="w-3 h-3 text-sky-400 shrink-0" />
                        <button
                          onClick={() => onSelectEnvelope(env)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-mono truncate flex-1 text-left transition underline-offset-2 hover:underline"
                          title="Abrir envelope para assinatura"
                        >
                          {window.location.host}/sign/{env.shareCode}#data
                        </button>
                        <button
                          onClick={() => handleCopyLink(env)}
                          className="p-1 text-slate-400 hover:text-sky-400 rounded transition shrink-0"
                          title="Copiar link de assinatura"
                        >
                          {copiedId === env.id ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteEnvelope(env.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white">{env.files.length}</div>
                    <div className="text-[9px] text-slate-500">Documentos</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white">{signedPages}/{totalPages}</div>
                    <div className="text-[9px] text-slate-500">Páginas</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white">{env.signers.length}</div>
                    <div className="text-[9px] text-slate-500">Signatários</div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-[10px] text-slate-500">
                  Criado: {env.createdAt} • Atualizado: {env.updatedAt}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectEnvelope(env)}
                    className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <FileText className="w-3 h-3" />
                    Abrir
                  </button>
                  <button
                    onClick={() => onOpenAuditModal(env)}
                    className="px-2 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Award className="w-3 h-3" />
                    Auditoria
                  </button>
                  <button
                    onClick={() => onSendForSigning(env)}
                    className="px-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Send className="w-3 h-3" />
                    Enviar p/ Assinatura
                  </button>
                  <button
                    onClick={() => onOpenShareModal(env)}
                    className="px-2 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Link2 className="w-3 h-3" />
                    Compartilhar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
