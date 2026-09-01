import { DocumentFile, Signer, SignatureStamp, SigningMode } from '../types';
import { ChevronLeft, ChevronRight, PenTool, FileText, Stamp, Trash2 } from 'lucide-react';

interface DocumentViewerProps {
  currentFile: DocumentFile;
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  activeSigner: Signer;
  onAddStamp: (pageNumber: number, stamp: SignatureStamp) => void;
  onRemoveStamp: (pageNumber: number, stampId: string) => void;
  signatureDataUrl?: string;
  rubricDataUrl?: string;
  onOpenSignatureModal: () => void;
  signingMode: SigningMode;
  onChangeSigningMode: (mode: SigningMode) => void;
}

export function DocumentViewer({
  currentFile,
  currentPageIndex,
  onSelectPage,
  activeSigner,
  onAddStamp,
  onRemoveStamp,
  signatureDataUrl,
  rubricDataUrl,
  onOpenSignatureModal,
  signingMode,
  onChangeSigningMode,
}: DocumentViewerProps) {
  const currentPage = currentFile.pages[currentPageIndex] || currentFile.pages[0];

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (signingMode !== 'individual') return;
    if (!signatureDataUrl) {
      onOpenSignatureModal();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const stamp: SignatureStamp = {
      id: `stamp-${Date.now()}-${Math.random()}`,
      type: 'signature',
      pageNumber: currentPage.pageNumber,
      x,
      y,
      width: 30,
      height: 12,
      dataUrl: signatureDataUrl,
      signerName: activeSigner.name,
      signerCpf: activeSigner.cpf,
      timestamp: new Date().toLocaleString('pt-BR'),
    };

    onAddStamp(currentPage.pageNumber, stamp);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white truncate max-w-[200px]">{currentFile.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {currentFile.status === 'signed' ? '✓ Assinado' : 'Pendente'}
          </span>
        </div>

        {/* Signing Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => onChangeSigningMode('batch')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
              signingMode === 'batch' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lote
          </button>
          <button
            onClick={() => onChangeSigningMode('individual')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
              signingMode === 'individual' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Individual
          </button>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-3 py-2 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-300">
          Página {currentPage?.pageNumber || 1} de {currentFile.pageCount}
        </span>
        <button
          onClick={() => onSelectPage(Math.min(currentFile.pageCount - 1, currentPageIndex + 1))}
          disabled={currentPageIndex >= currentFile.pageCount - 1}
          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <div
          onClick={handleCanvasClick}
          className={`relative w-full max-w-[500px] aspect-[1/1.414] bg-white rounded-lg shadow-2xl ${
            signingMode === 'individual' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* Simulated document content */}
          <div className="absolute inset-0 p-8 overflow-hidden">
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-5/6"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-4/5"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-3/4"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-5/6"></div>
              <div className="h-2 bg-slate-100 rounded w-2/3"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-4/5"></div>
              <div className="h-2 bg-slate-100 rounded w-3/4"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
            </div>
            <div className="mt-6 space-y-1.5">
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-5/6"></div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-3/4"></div>
            </div>
            {/* Signature line */}
            <div className="absolute bottom-16 left-8 right-8">
              <div className="border-t-2 border-dashed border-slate-300 pt-1">
                <div className="text-[8px] text-slate-400 font-mono">Assinatura</div>
              </div>
            </div>
          </div>

          {/* Render Stamps */}
          {currentPage?.stamps.map((stamp) => (
            <div
              key={stamp.id}
              className="absolute group"
              style={{
                left: `${stamp.x}%`,
                top: `${stamp.y}%`,
                width: `${stamp.width}%`,
                height: `${stamp.height}%`,
              }}
            >
              <img
                src={stamp.dataUrl}
                alt={stamp.signerName}
                className="w-full h-full object-contain opacity-90"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStamp(currentPage.pageNumber, stamp.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {stamp.type === 'rubric' && (
                <div className="absolute -bottom-3 left-0 text-[7px] text-slate-500 font-mono whitespace-nowrap">
                  {stamp.signerName}
                </div>
              )}
            </div>
          ))}

          {/* Individual mode hint */}
          {signingMode === 'individual' && !signatureDataUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSignatureModal();
                }}
                className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <PenTool className="w-4 h-4" />
                Criar Assinatura
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Thumbnails */}
      {currentFile.pageCount > 1 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-t border-slate-800 overflow-x-auto">
          {currentFile.pages.map((page, idx) => (
            <button
              key={page.pageNumber}
              onClick={() => onSelectPage(idx)}
              className={`shrink-0 w-12 h-16 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition ${
                currentPageIndex === idx
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600'
              }`}
            >
              {page.stamps.length > 0 ? (
                <Stamp className="w-4 h-4" />
              ) : (
                page.pageNumber
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
