import { Upload, PenTool, Mail, Smartphone, ShieldCheck, FileCheck2, Menu } from 'lucide-react';

interface HeaderNavigationProps {
  activeView: 'upload' | 'sign' | 'tracking';
  onNavigate: (view: 'upload' | 'sign' | 'tracking') => void;
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
  totalFiles: number;
  isSigned: boolean;
}

export function HeaderNavigation({
  activeView,
  onNavigate,
  isMobileSimulator,
  onToggleMobileSimulator,
  totalFiles,
  isSigned,
}: HeaderNavigationProps) {
  const steps = [
    { id: 'upload' as const, label: 'Criar & Enviar', icon: Upload },
    { id: 'sign' as const, label: 'Assinar', icon: PenTool },
    { id: 'tracking' as const, label: 'Envelopes', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 text-slate-950" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">Assinatura Fácil</div>
              <div className="text-[10px] text-emerald-400 font-semibold leading-tight">Logmam • Plataforma de Assinaturas</div>
            </div>
          </div>

          {/* Step Navigation */}
          <nav className="flex items-center gap-1 bg-slate-900 rounded-2xl p-1 border border-slate-800">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeView === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{idx + 1}</span>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {totalFiles > 0 && (
              <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold ${
                isSigned ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isSigned ? 'Assinado' : `${totalFiles} arquivos`}
              </div>
            )}
            <button
              onClick={onToggleMobileSimulator}
              className={`p-2 rounded-xl border transition ${
                isMobileSimulator
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Simular visualização mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
