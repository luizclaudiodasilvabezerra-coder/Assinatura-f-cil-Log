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
          {/* Document content — original file or fallback text */}
          {currentFile.fileDataUrl ? (
            currentFile.fileType?.startsWith('image/') ? (
              <img
                src={currentFile.fileDataUrl}
                alt={currentFile.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : currentFile.fileType === 'application/pdf' ? (
              <embed
                src={currentFile.fileDataUrl}
                type="application/pdf"
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <FileText className="w-10 h-10 text-slate-400 mb-3" />
                <div className="text-[10px] font-bold text-slate-700">{currentFile.name}</div>
                <div className="text-[8px] text-slate-500 mt-1">Formato: {currentFile.fileType || 'desconhecido'}</div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 p-6 overflow-hidden">
              <div className="text-center mb-3">
                <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{currentFile.name.replace(/\.(pdf|docx?|jpe?g|png)$/i, '')}</div>
                <div className="w-16 h-0.5 bg-slate-300 mx-auto mt-1"></div>
              </div>
              <div className="space-y-1.5 text-[8px] text-slate-700 leading-relaxed">
                {currentPage?.pageNumber === 1 ? (
                  <>
                    <p className="font-bold text-center text-[9px] mb-2">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
                    <p>Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir:</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 1ª — DO OBJETO</p>
                    <p>O CONTRATADO compromete-se a prestar os serviços descritos neste contrato, conforme as especificações técnicas e prazos estabelecidos, garantindo a qualidade e conformidade exigida.</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 2ª — DAS OBRIGAÇÕES</p>
                    <p>2.1. O CONTRATADO obriga-se a executar os serviços com zelo, dedicação e técnica profissional.</p>
                    <p>2.2. O CONTRATANTE obriga-se a efetuar o pagamento conforme condições estabelecidas.</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 3ª — DO VALOR E PAGAMENTO</p>
                    <p>3.1. Os serviços serão remunerados conforme tabela de valores anexa a este contrato.</p>
                    <p>3.2. O pagamento será efetuado mediante boleto bancário ou transferência.</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 4ª — DO PRAZO</p>
                    <p>4.1. O prazo para execução dos serviços será de conforme cronograma estabelecido.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold mt-1.5">CLÁUSULA 5ª — DA RESCISÃO</p>
                    <p>5.1. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 dias.</p>
                    <p>5.2. O descumprimento de qualquer cláusula contratual autoriza a rescisão imediata.</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 6ª — DA CONFIDENCIALIDADE</p>
                    <p>6.1. As partes comprometem-se a manter sigilo sobre todas as informações.</p>
                    <p className="font-bold mt-1.5">CLÁUSULA 7ª — DO FORO</p>
                    <p>7.1. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
                    <p className="mt-2">E, por estarem de acordo, assinam o presente instrumento em 02 (duas) vias de igual teor e forma.</p>
                  </>
                )}
              </div>
              {/* Signature line */}
              <div className="absolute bottom-12 left-6 right-6">
                <div className="border-t border-slate-400 pt-0.5">
                  <div className="text-[7px] text-slate-500 font-mono">Assinatura do Responsável</div>
                </div>
              </div>
            </div>
          )}

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
