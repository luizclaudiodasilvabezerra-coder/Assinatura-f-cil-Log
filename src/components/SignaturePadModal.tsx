import { useState, useRef, useEffect } from 'react';
import { X, PenTool, Type, Eraser, Check } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    signatureDataUrl: string;
    rubricDataUrl: string;
    signerName: string;
    signerCpf: string;
    signatureType: 'drawn' | 'typed' | 'image';
  }) => void;
  initialName: string;
  initialCpf: string;
}

export function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
  initialName,
  initialCpf,
}: SignaturePadModalProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [signerName, setSignerName] = useState(initialName);
  const [signerCpf, setSignerCpf] = useState(initialCpf);
  const [typedSignature, setTypedSignature] = useState(initialName);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rubricCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    setSignerName(initialName);
    setSignerCpf(initialCpf);
    setTypedSignature(initialName);
  }, [initialName, initialCpf, isOpen]);

  useEffect(() => {
    if (isOpen && mode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      const rCanvas = rubricCanvasRef.current;
      if (rCanvas) {
        const ctx = rCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, rCanvas.width, rCanvas.height);
        }
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      const pos = getPos(e, canvas);
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const pos = getPos(e, canvas);
      ctx.strokeStyle = '#0f3796';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    [canvasRef, rubricCanvasRef].forEach((ref) => {
      const canvas = ref.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  };

  const generateTypedSignature = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f3796';
      ctx.font = 'italic 42px "Caveat", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature || signerName, 225, 70);
    }
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    let sigUrl = '';
    if (mode === 'draw') {
      sigUrl = canvasRef.current?.toDataURL('image/png') || '';
    } else {
      sigUrl = generateTypedSignature();
    }
    const rubUrl = rubricCanvasRef.current?.toDataURL('image/png') || sigUrl;

    onSave({
      signatureDataUrl: sigUrl,
      rubricDataUrl: rubUrl,
      signerName,
      signerCpf,
      signatureType: mode === 'draw' ? 'drawn' : 'typed',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-400" />
            Criar Assinatura & Rubrica
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('draw')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mode === 'draw' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Desenhar
            </button>
            <button
              onClick={() => setMode('type')}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mode === 'type' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Digitar
            </button>
          </div>

          {/* Signer Info */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nome do signatário"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              value={signerCpf}
              onChange={(e) => setSignerCpf(e.target.value)}
              placeholder="CPF"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Signature Area */}
          {mode === 'draw' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">ASSINATURA</label>
              <canvas
                ref={canvasRef}
                width={450}
                height={140}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                className="w-full bg-white rounded-xl border-2 border-slate-700 touch-none cursor-crosshair"
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">ASSINATURA DIGITADA</label>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Digite seu nome..."
                className="w-full bg-white text-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-2xl text-center font-caveat focus:border-emerald-500 focus:outline-none"
                style={{ fontFamily: 'Caveat, cursive' }}
              />
            </div>
          )}

          {/* Rubric Area */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">RUBRICA</label>
            <canvas
              ref={rubricCanvasRef}
              width={450}
              height={70}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="w-full bg-white rounded-xl border-2 border-slate-700 touch-none cursor-crosshair"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Eraser className="w-3.5 h-3.5" />
              Limpar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              Salvar Assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
