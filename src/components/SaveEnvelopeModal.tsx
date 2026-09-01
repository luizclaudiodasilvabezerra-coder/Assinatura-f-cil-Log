import { useState, useEffect } from 'react';
import { Envelope, DocumentFile, Signer } from '../types';
import { X, Save, FileText, Tag } from 'lucide-react';

interface SaveEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEnvelope: (title: string, description: string) => void;
  files: DocumentFile[];
  initialTitle: string;
  signers: Signer[];
}

export function SaveEnvelopeModal({
  isOpen,
  onClose,
  onSaveEnvelope,
  files,
  initialTitle,
  signers,
}: SaveEnvelopeModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-400" />
            Salvar Envelope
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">{files.length} documento(s)</div>
              <div className="text-[10px] text-slate-500">{totalPages} páginas • {signers.length} signatário(s)</div>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block flex items-center gap-1">
              <Tag className="w-3 h-3" />
              TÍTULO DO ENVELOPE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do envelope..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">DESCRIÇÃO (OPCIONAL)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição ou observações sobre o envelope..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none transition resize-none"
            />
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
              onClick={() => onSaveEnvelope(title, description)}
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              Salvar e Disponibilizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
