import { useRef } from 'react';
import { DocumentFile, Signer } from '../types';
import { Upload, FileText, Trash2, User, Plus, Save, Send, CheckCircle2 } from 'lucide-react';

interface BatchUploadSectionProps {
  files: DocumentFile[];
  onAddFiles: (files: DocumentFile[], shouldOpenSaveModal?: boolean) => void;
  onRemoveFile: (fileId: string) => void;
  signers: Signer[];
  onUpdateSigners: (signers: Signer[]) => void;
  onProceedToSign: () => void;
  envelopeTitle: string;
  onUpdateTitle: (title: string) => void;
  onOpenSaveEnvelopeModal: () => void;
  isEnvelopeSaved: boolean;
}

export function BatchUploadSection({
  files,
  onAddFiles,
  onRemoveFile,
  signers,
  onUpdateSigners,
  onProceedToSign,
  envelopeTitle,
  onUpdateTitle,
  onOpenSaveEnvelopeModal,
  isEnvelopeSaved,
}: BatchUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const newFiles: DocumentFile[] = Array.from(selected).map((f, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: f.name,
      pageCount: Math.max(1, Math.ceil(f.size / 50000)),
      status: 'pending' as const,
      pages: Array.from({ length: Math.max(1, Math.ceil(f.size / 50000)) }, (_, i) => ({
        pageNumber: i + 1,
        stamps: [],
      })),
    }));

    onAddFiles(newFiles, true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateSigner = (idx: number, field: keyof Signer, value: string) => {
    const updated = signers.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    onUpdateSigners(updated);
  };

  const addSigner = () => {
    onUpdateSigners([
      ...signers,
      {
        id: `sig-${Date.now()}`,
        name: '',
        email: '',
        whatsapp: '',
        cpf: '',
        role: 'Signatário',
        status: 'pending',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Envelope Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <label className="text-xs font-bold text-slate-400 mb-1.5 block">Título do Envelope</label>
        <input
          type="text"
          value={envelopeTitle}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Nome do envelope..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none transition"
        />
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-900/50 hover:bg-slate-900"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Arraste ou clique para enviar</h3>
        <p className="text-xs text-slate-400">PDF, DOC, DOCX, JPG, PNG — múltiplos arquivos em lote</p>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Documentos no Envelope ({files.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              {files.reduce((acc, f) => acc + f.pageCount, 0)} páginas totais
            </span>
          </div>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3"
            >
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{file.name}</div>
                <div className="text-[10px] text-slate-500">{file.pageCount} página(s)</div>
              </div>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Signers Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            Signatários ({signers.length})
          </h3>
          <button
            onClick={addSigner}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
        {signers.map((signer, idx) => (
          <div key={signer.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={signer.name}
                onChange={(e) => updateSigner(idx, 'name', e.target.value)}
                placeholder="Nome completo"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={signer.role}
                onChange={(e) => updateSigner(idx, 'role', e.target.value)}
                placeholder="Função"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="email"
                value={signer.email}
                onChange={(e) => updateSigner(idx, 'email', e.target.value)}
                placeholder="E-mail"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={signer.whatsapp}
                onChange={(e) => updateSigner(idx, 'whatsapp', e.target.value)}
                placeholder="WhatsApp"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                value={signer.cpf}
                onChange={(e) => updateSigner(idx, 'cpf', e.target.value)}
                placeholder="CPF"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none col-span-2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onOpenSaveEnvelopeModal}
          disabled={files.length === 0}
          className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <Save className="w-4 h-4" />
          Salvar Envelope
        </button>
        <button
          onClick={onProceedToSign}
          disabled={files.length === 0}
          className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
        >
          {isEnvelopeSaved ? <Send className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          Enviar para Assinatura
        </button>
      </div>
    </div>
  );
}
