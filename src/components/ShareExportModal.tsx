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
}: ShareExportModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const signingUrl = `https://assinatura.logmam.com.br/sign/${envelope.shareCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(signingUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `📄 Documento assinado eletronicamente: ${envelope.title}\n\n` +
      `✅ Status: ${envelope.status === 'signed' ? 'Assinado' : 'Pendente'}\n` +
      `🔑 Código: ${envelope.shareCode}\n` +
      `🔐 Hash SHA-256: ${envelope.sha256Hash.substring(0, 32)}...\n` +
      `📋 Documentos: ${envelope.files.length}\n\n` +
      `🔗 Acesse o documento assinado:\n${signingUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Documento Assinado: ${envelope.title}`);
    const body = encodeURIComponent(
      `Prezado(a),\n\n` +
      `O documento "${envelope.title}" foi assinado eletronicamente.\n\n` +
      `Código de verificação: ${envelope.shareCode}\n` +
      `Hash SHA-256: ${envelope.sha256Hash}\n` +
      `Documentos: ${envelope.files.length}\n\n` +
      `Acesse o documento assinado: ${signingUrl}\n\n` +
      `Atenciosamente,\n${activeSigner.name}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleDownloadSignedPDF = () => {
    // If there's a single file with original content, download it directly
    const filesWithData = envelope.files.filter((f) => f.fileDataUrl);
    if (filesWithData.length === 1 && filesWithData[0].fileType === 'application/pdf') {
      const a = document.createElement('a');
      a.href = filesWithData[0].fileDataUrl!;
      a.download = filesWithData[0].name;
      a.click();
      return;
    }
    if (filesWithData.length === 1 && filesWithData[0].fileType?.startsWith('image/')) {
      const a = document.createElement('a');
      a.href = filesWithData[0].fileDataUrl!;
      a.download = filesWithData[0].name;
      a.click();
      return;
    }

    // Generate an HTML document with signed content and trigger download
    const signedDocsHtml = envelope.files.map((file) => {
      const stamps = file.pages.flatMap((p) => p.stamps);
      const stampsHtml = stamps.map((s) =>
        `<div style="margin:10px 0;padding:8px;border-left:3px solid #0f3796;font-size:12px;">` +
        `<strong>${s.type === 'signature' ? 'Assinatura' : 'Rubrica'}</strong> — ${s.signerName}` +
        (s.signerCpf ? ` (CPF: ${s.signerCpf})` : '') +
        `<br><span style="color:#666;">${s.timestamp}</span>` +
        `</div>`
      ).join('');

      const contentHtml = file.fileDataUrl && file.fileType?.startsWith('image/')
        ? `<img src="${file.fileDataUrl}" style="max-width:100%;border-radius:4px;margin:10px 0;" />`
        : file.fileDataUrl && file.fileType === 'application/pdf'
        ? `<embed src="${file.fileDataUrl}" type="application/pdf" style="width:100%;height:400px;" />`
        : '';

      return `<div style="margin-bottom:30px;padding:20px;border:1px solid #ddd;border-radius:8px;">
        <h3 style="margin:0 0 10px;color:#0f3796;">${file.name}</h3>
        <p style="color:#666;font-size:12px;">${file.pageCount} página(s) — ${file.status === 'signed' ? '✓ Assinado' : 'Pendente'}</p>
        ${contentHtml}
        ${stampsHtml || '<p style="color:#999;font-size:12px;">Sem assinaturas registradas.</p>'}
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${envelope.title} — Documento Assinado</title></head>
      <body style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:40px;">
        <h1 style="color:#0f3796;">${envelope.title}</h1>
        <p style="color:#666;">Código: ${envelope.shareCode} | Hash: ${envelope.sha256Hash}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        ${signedDocsHtml}
        <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
        <p style="font-size:11px;color:#999;">Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}.</p>
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${envelope.title.replace(/[^a-zA-Z0-9]/g, '_')}_assinado.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudit = () => {
    const logsHtml = envelope.auditLogs.map((log) =>
      `<tr><td style="padding:6px;border:1px solid #ddd;font-size:12px;">${log.timestamp}</td>` +
      `<td style="padding:6px;border:1px solid #ddd;font-size:12px;"><strong>${log.action}</strong></td>` +
      `<td style="padding:6px;border:1px solid #ddd;font-size:12px;">${log.actor}</td>` +
      `<td style="padding:6px;border:1px solid #ddd;font-size:12px;">${log.details}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificado de Auditoria — ${envelope.title}</title></head>
      <body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;">
        <h1 style="color:#0f3796;">Certificado de Auditoria</h1>
        <h2 style="font-size:16px;">${envelope.title}</h2>
        <p style="color:#666;">Código: ${envelope.shareCode} | Hash: ${envelope.sha256Hash}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead><tr style="background:#f0f0f0;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Data/Hora</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Ação</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Autor</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Detalhes</th>
          </tr></thead>
          <tbody>${logsHtml}</tbody>
        </table>
      </body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_auditoria_${envelope.shareCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
                  {envelope.status === 'signed' ? '✓ Assinado' : envelope.status === 'sent' ? '📨 Enviado' : 'Rascunho'}
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

          {/* Signed Documents List */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">DOCUMENTOS ASSINADOS</label>
            <div className="space-y-1.5">
              {envelope.files.map((file) => {
                const stampCount = file.pages.flatMap((p) => p.stamps).length;
                return (
                  <div key={file.id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${file.status === 'signed' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-semibold text-slate-300 truncate flex-1">{file.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      file.status === 'signed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {stampCount} carimbo(s)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signing Link */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">LINK DE ASSINATURA MOBILE</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 font-mono truncate">
                {signingUrl}
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
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">ENVIAR DOCUMENTO ASSINADO POR</label>
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
              <button
                onClick={handleDownloadSignedPDF}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Documento Assinado (com assinaturas)
              </button>
              <button
                onClick={handleDownloadAudit}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700"
              >
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
