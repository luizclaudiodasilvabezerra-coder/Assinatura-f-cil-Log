import { Envelope } from '../types';
import { X, ShieldCheck, FileText, Hash, Calendar, User, MapPin, Globe, Award, Fingerprint } from 'lucide-react';

interface AuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelope: Envelope;
}

export function AuditCertificateModal({
  isOpen,
  onClose,
  envelope,
}: AuditCertificateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Certificado de Auditoria & Autenticidade
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Certificate Banner */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">{envelope.title}</h3>
            <p className="text-xs text-slate-400 mt-1">Certificado de Assinatura Eletrônica</p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-950 rounded-full border border-slate-700">
              <span className="text-[10px] font-mono text-emerald-400">Código: {envelope.shareCode}</span>
            </div>
          </div>

          {/* Hash & Integrity */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              INTEGRIDADE DO DOCUMENTO
            </div>
            <div className="text-[10px] text-slate-500 font-mono break-all bg-slate-900 rounded-lg p-2 border border-slate-800">
              SHA-256: {envelope.sha256Hash}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Documento íntegro e verificado
            </div>
          </div>

          {/* Signers */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              SIGNATÁRIOS
            </div>
            {envelope.signers.map((signer) => (
              <div key={signer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{signer.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    signer.status === 'signed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {signer.status === 'signed' ? '✓ Assinado' : 'Pendente'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">{signer.role}</div>
                <div className="text-[10px] text-slate-500">{signer.email}</div>
                {signer.signedAt && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {signer.signedAt}
                  </div>
                )}
                {signer.ipAddress && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Globe className="w-3 h-3" />
                    IP: {signer.ipAddress}
                  </div>
                )}
                {signer.geolocation && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {signer.geolocation}
                  </div>
                )}
                {signer.biometricSelfieUrl && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Fingerprint className="w-3 h-3" />
                    Biometria facial verificada
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Audit Trail */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              TRILHA DE AUDITORIA
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {envelope.auditLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-[10px]">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-300">{log.action}</div>
                    <div className="text-slate-500">{log.details}</div>
                    <div className="text-slate-600 font-mono">{log.timestamp} • {log.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              DOCUMENTOS ({envelope.files.length})
            </div>
            <div className="space-y-1.5">
              {envelope.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 truncate">{file.name}</span>
                  <span className="text-slate-500 font-mono shrink-0 ml-2">
                    {file.pageCount}p • {file.status === 'signed' ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Fechar Certificado
          </button>
        </div>
      </div>
    </div>
  );
}
