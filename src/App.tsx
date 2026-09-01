import { useState, useEffect } from 'react';
import { DocumentFile, Envelope, SignatureSettings, Signer, SignatureStamp, AuditLog, SigningMode } from './types';
import { calculateSha256, createSampleDocumentBundle } from './utils/pdfHelper';
import { HeaderNavigation } from './components/HeaderNavigation';
import { BatchUploadSection } from './components/BatchUploadSection';
import { DocumentViewer } from './components/DocumentViewer';
import { BatchSigningToolbar } from './components/BatchSigningToolbar';
import { SignaturePadModal } from './components/SignaturePadModal';
import { BiometricVerificationModal } from './components/BiometricVerificationModal';
import { ShareExportModal } from './components/ShareExportModal';
import { SendToRecipientModal } from './components/SendToRecipientModal';
import { SaveEnvelopeModal } from './components/SaveEnvelopeModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { EnvelopeTrackingView } from './components/EnvelopeTrackingView';
import { FileText, Send, Check, Layers, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // App views: 'upload' (Step 1) | 'sign' (Step 2) | 'tracking' (Step 3)
  const [activeView, setActiveView] = useState<'upload' | 'sign' | 'tracking'>('sign');
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);
  const [signingMode, setSigningMode] = useState<SigningMode>('batch');

  // Envelope state
  const [envelopeTitle, setEnvelopeTitle] = useState<string>('Contrato de Prestação de Serviços & Termos');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isEnvelopeSaved, setIsEnvelopeSaved] = useState<boolean>(true);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);

  // Signers state
  const [signers, setSigners] = useState<Signer[]>([
    {
      id: 'sig-1',
      name: 'Luiz Cláudio da Silva',
      email: 'luizclaudiodasilvabezerra@gmail.com',
      whatsapp: '+55 (11) 98765-4321',
      cpf: '342.891.045-88',
      role: 'Signatário Principal',
      status: 'pending',
    },
    {
      id: 'sig-2',
      name: 'Dra. Beatriz Santos Albuquerque',
      email: 'beatriz.adv@logmam.com.br',
      whatsapp: '+55 (11) 99123-4567',
      cpf: '210.984.765-12',
      role: 'Testemunha',
      status: 'pending',
    },
  ]);
  const [activeSignerIndex, setActiveSignerIndex] = useState<number>(0);

  // Signature Settings
  const [settings, setSettings] = useState<SignatureSettings>({
    autoRubricAllPages: true,
    autoSignLastPage: true,
    includeTimestamp: true,
    includeCpf: true,
    includeAuditCertificate: true,
    requireSelfieBiometrics: false,
    requireGeolocation: true,
  });

  // Modals state
  const [isSaveEnvelopeModalOpen, setIsSaveEnvelopeModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [isShareExportModalOpen, setIsShareExportModalOpen] = useState(false);
  const [isSendRecipientModalOpen, setIsSendRecipientModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditModalEnvelope, setAuditModalEnvelope] = useState<Envelope | null>(null);

  // Envelopes History
  const [envelopesHistory, setEnvelopesHistory] = useState<Envelope[]>([]);
  const [currentEnvelopeId, setCurrentEnvelopeId] = useState<string>(`env-${Date.now()}`);
  const [shareCode, setShareCode] = useState<string>(Math.random().toString(36).substring(2, 8).toUpperCase());
  const [sha256Hash, setSha256Hash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleString('pt-BR'),
      action: 'Envelope Criado',
      actor: 'Sistema',
      details: 'Envelope iniciado com lote de múltiplos arquivos para assinatura eletrônica.',
      hash: 'sha256:init',
    },
  ]);

  // Load saved envelopes from localStorage or create sample data on startup
  useEffect(() => {
    async function init() {
      const saved = localStorage.getItem('afl_envelopes');
      if (saved) {
        try {
          const parsed: Envelope[] = JSON.parse(saved);
          if (parsed.length > 0) {
            setEnvelopesHistory(parsed);
            const first = parsed[0];
            setCurrentEnvelopeId(first.id);
            setEnvelopeTitle(first.title);
            setFiles(first.files);
            setShareCode(first.shareCode);
            setSha256Hash(first.sha256Hash);
            if (first.signers && first.signers.length > 0) {
              setSigners(first.signers);
            }
            return;
          }
        } catch {
          // fall through to sample data
        }
      }

      const sampleFiles = await createSampleDocumentBundle();
      setFiles(sampleFiles);

      const hash = await calculateSha256(`envelope-${Date.now()}-${sampleFiles.length}`);
      setSha256Hash(hash);
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setShareCode(code);

      const initialEnvelope: Envelope = {
        id: `env-${Date.now()}`,
        title: 'Pacote de Contratos & Termos de Serviço',
        senderName: 'Luiz Cláudio da Silva',
        senderEmail: 'luizclaudiodasilvabezerra@gmail.com',
        senderPhone: '+55 (11) 98765-4321',
        createdAt: new Date().toLocaleDateString('pt-BR'),
        updatedAt: new Date().toLocaleDateString('pt-BR'),
        status: 'draft',
        files: sampleFiles,
        signers: signers,
        auditLogs: [
          {
            id: 'log-init',
            timestamp: new Date().toLocaleString('pt-BR'),
            action: 'Envio em Lote Registrado',
            actor: 'Luiz Cláudio da Silva',
            details: 'Pacote com 2 documentos (3 páginas) preparado para assinatura.',
            hash: hash.substring(0, 16),
          },
        ],
        sha256Hash: hash,
        shareCode: code,
      };

      setEnvelopesHistory([initialEnvelope]);
      setCurrentEnvelopeId(initialEnvelope.id);
    }
    init();
  }, []);

  // Persist envelopes history to localStorage whenever it changes
  useEffect(() => {
    if (envelopesHistory.length > 0) {
      localStorage.setItem('afl_envelopes', JSON.stringify(envelopesHistory));
    } else {
      localStorage.removeItem('afl_envelopes');
    }
  }, [envelopesHistory]);

  const activeSigner = signers[activeSignerIndex] || signers[0];
  const currentFile = files[activeFileIndex] || files[0];

  // Calculate totals
  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSignedPages = files.reduce(
    (acc, f) => acc + f.pages.filter((p) => p.stamps.length > 0).length,
    0
  );
  const isFullySigned = totalSignedPages >= totalPages && totalPages > 0;

  // Remove a signer from the list
  const handleRemoveSigner = (signerId: string) => {
    const updated = signers.filter((s) => s.id !== signerId);
    setSigners(updated);
    if (activeSignerIndex >= updated.length) {
      setActiveSignerIndex(Math.max(0, updated.length - 1));
    }
    // Sync with current envelope in history
    setEnvelopesHistory((prev) =>
      prev.map((env) =>
        env.id === currentEnvelopeId
          ? { ...env, signers: updated, updatedAt: new Date().toLocaleString('pt-BR') }
          : env
      )
    );
  };

  // Add uploaded files & optionally trigger Save Envelope modal
  const handleAddFiles = async (newFiles: DocumentFile[], shouldOpenSaveModal = false) => {
    const updated = [...files, ...newFiles];
    setFiles(updated);
    setIsEnvelopeSaved(false);

    const newHash = await calculateSha256(`env-${Date.now()}-${updated.length}`);
    setSha256Hash(newHash);

    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      action: 'Arquivos Anexados em Massa',
      actor: activeSigner.name,
      details: `${newFiles.length} novo(s) documento(s) adicionado(s) ao envelope.`,
      hash: newHash.substring(0, 16),
    };
    setAuditLogs((prev) => [...prev, newLog]);

    // Update current envelope in history or create new if not present
    setEnvelopesHistory((prev) => {
      const exists = prev.some((e) => e.id === currentEnvelopeId);
      if (exists) {
        return prev.map((env) =>
          env.id === currentEnvelopeId
            ? {
                ...env,
                files: updated,
                updatedAt: new Date().toLocaleString('pt-BR'),
              }
            : env
        );
      } else {
        const newEnv: Envelope = {
          id: currentEnvelopeId,
          title: envelopeTitle || 'Envelope de Documentos',
          senderName: activeSigner.name,
          senderEmail: activeSigner.email,
          senderPhone: activeSigner.whatsapp,
          createdAt: new Date().toLocaleDateString('pt-BR'),
          updatedAt: new Date().toLocaleString('pt-BR'),
          status: 'draft',
          files: updated,
          signers: signers,
          auditLogs: [...auditLogs, newLog],
          sha256Hash: newHash,
          shareCode: shareCode,
        };
        return [newEnv, ...prev];
      }
    });

    if (shouldOpenSaveModal) {
      setIsSaveEnvelopeModalOpen(true);
    }
  };

  // Handle Save Envelope from modal
  const handleSaveEnvelope = (title: string, description: string) => {
    setEnvelopeTitle(title);
    setIsEnvelopeSaved(true);
    setIsSaveEnvelopeModalOpen(false);

    const now = new Date().toLocaleString('pt-BR');
    const newLog: AuditLog = {
      id: `log-saved-${Date.now()}`,
      timestamp: now,
      action: 'Envelope Salvo e Disponibilizado',
      actor: activeSigner.name,
      details: `Envelope "${title}" com ${files.length} documento(s) foi salvo e disponibilizado para envio.`,
      hash: sha256Hash.substring(0, 16),
    };
    setAuditLogs((prev) => [...prev, newLog]);

    const updatedEnv: Envelope = {
      id: currentEnvelopeId,
      title: title,
      description: description,
      senderName: activeSigner.name,
      senderEmail: activeSigner.email,
      senderPhone: activeSigner.whatsapp,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: now,
      status: isFullySigned ? 'signed' : 'draft',
      files: files,
      signers: signers,
      auditLogs: [...auditLogs, newLog],
      sha256Hash: sha256Hash,
      shareCode: shareCode,
    };

    setEnvelopesHistory((prev) => {
      const filtered = prev.filter((e) => e.id !== currentEnvelopeId);
      return [updatedEnv, ...filtered];
    });

    // Show toast notification
    setSaveToastMessage(`Envelope "${title}" salvo com sucesso e disponível para envio!`);
    setTimeout(() => setSaveToastMessage(null), 4000);
  };

  // Select an envelope from the modal or list
  const handleSelectEnvelope = (envelopeId: string) => {
    const selected = envelopesHistory.find((e) => e.id === envelopeId);
    if (selected) {
      setCurrentEnvelopeId(selected.id);
      setEnvelopeTitle(selected.title);
      setFiles(selected.files);
      setShareCode(selected.shareCode);
      setSha256Hash(selected.sha256Hash);
      if (selected.signers && selected.signers.length > 0) {
        setSigners(selected.signers);
      }
      setActiveFileIndex(0);
      setActivePageIndex(0);
      setIsEnvelopeSaved(true);
    }
  };

  // Remove individual file from envelope and sync
  const handleRemoveFile = (fileId: string) => {
    const updated = files.filter((f) => f.id !== fileId);
    setFiles(updated);

    if (activeFileIndex >= updated.length) {
      setActiveFileIndex(Math.max(0, updated.length - 1));
      setActivePageIndex(0);
    }

    // If no files left in this envelope, remove envelope from tracking history
    if (updated.length === 0) {
      setEnvelopesHistory((prev) => prev.filter((env) => env.id !== currentEnvelopeId));
    } else {
      setEnvelopesHistory((prev) =>
        prev.map((env) =>
          env.id === currentEnvelopeId
            ? { ...env, files: updated, updatedAt: new Date().toLocaleString('pt-BR') }
            : env
        )
      );
    }
  };

  // Delete entire envelope from Stage 3 Tracking
  const handleDeleteEnvelope = (envelopeId: string) => {
    setEnvelopesHistory((prev) => prev.filter((env) => env.id !== envelopeId));

    if (envelopeId === currentEnvelopeId) {
      setFiles([]);
      setCurrentEnvelopeId(`env-${Date.now()}`);
      setShareCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  };

  // Save drawn or typed signature
  const handleSaveSignature = (data: {
    signatureDataUrl: string;
    rubricDataUrl: string;
    signerName: string;
    signerCpf: string;
    signatureType: 'drawn' | 'typed' | 'image';
  }) => {
    const updatedSigners = signers.map((s, idx) =>
      idx === activeSignerIndex
        ? {
            ...s,
            name: data.signerName,
            cpf: data.signerCpf,
            signatureDataUrl: data.signatureDataUrl,
            rubricDataUrl: data.rubricDataUrl,
            signatureType: data.signatureType,
          }
        : s
    );
    setSigners(updatedSigners);

    // Add audit entry
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      action: 'Assinatura & Rubrica Cadastradas',
      actor: data.signerName,
      details: `Padrão de assinatura (${data.signatureType}) gerado com sucesso.`,
      hash: sha256Hash.substring(0, 16),
    };
    setAuditLogs((prev) => [...prev, newLog]);
  };

  // Add individual stamp on specific page
  const handleAddStamp = (pageNumber: number, stamp: SignatureStamp) => {
    const updatedFiles = files.map((file, fIdx) => {
      if (fIdx !== activeFileIndex) return file;

      const updatedPages = file.pages.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        return {
          ...p,
          stamps: [...p.stamps, stamp],
        };
      });

      return { ...file, pages: updatedPages };
    });

    setFiles(updatedFiles);

    // Sync with envelope history
    setEnvelopesHistory((prev) =>
      prev.map((env) =>
        env.id === currentEnvelopeId
          ? {
              ...env,
              files: updatedFiles,
              updatedAt: new Date().toLocaleString('pt-BR'),
            }
          : env
      )
    );
  };

  // Remove individual stamp
  const handleRemoveStamp = (pageNumber: number, stampId: string) => {
    const updatedFiles = files.map((file, fIdx) => {
      if (fIdx !== activeFileIndex) return file;

      const updatedPages = file.pages.map((p) => {
        if (p.pageNumber !== pageNumber) return p;
        return {
          ...p,
          stamps: p.stamps.filter((s) => s.id !== stampId),
        };
      });

      return { ...file, pages: updatedPages };
    });

    setFiles(updatedFiles);
  };

  // 1-CLICK BATCH SIGN ALL PAGES ACROSS ALL FILES
  const handleBatchSignAllPages = async () => {
    const now = new Date().toLocaleString('pt-BR');

    let sigUrl = activeSigner.signatureDataUrl;
    let rubUrl = activeSigner.rubricDataUrl;

    if (!sigUrl) {
      const c = document.createElement('canvas');
      c.width = 450;
      c.height = 140;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f3796';
        ctx.font = 'italic 32px "Caveat", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeSigner.name || 'Luiz Cláudio da Silva', 225, 60);
        ctx.strokeStyle = '#0f3796';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 95);
        ctx.bezierCurveTo(180, 115, 290, 85, 390, 100);
        ctx.stroke();
        sigUrl = c.toDataURL('image/png');
      }
    }

    if (!rubUrl) {
      rubUrl = sigUrl;
    }

    const updatedFiles = files.map((file) => {
      const totalDocPages = file.pages.length;

      const updatedPages = file.pages.map((page) => {
        const stamps = [...page.stamps];

        // If auto-rubric is enabled and rubric not yet placed on this page
        if (settings.autoRubricAllPages && !stamps.some((s) => s.type === 'rubric')) {
          stamps.push({
            id: `rubric-${page.pageNumber}-${Date.now()}-${Math.random()}`,
            type: 'rubric',
            pageNumber: page.pageNumber,
            x: 80,
            y: 89,
            width: 15,
            height: 8,
            dataUrl: rubUrl,
            signerName: activeSigner.name,
            timestamp: now,
          });
        }

        // If last page of the document and autoSignLastPage is enabled
        if (page.pageNumber === totalDocPages && settings.autoSignLastPage) {
          if (!stamps.some((s) => s.type === 'signature')) {
            stamps.push({
              id: `sig-main-${file.id}-${Date.now()}`,
              type: 'signature',
              pageNumber: page.pageNumber,
              x: 20,
              y: 76,
              width: 38,
              height: 14,
              dataUrl: sigUrl,
              signerName: activeSigner.name,
              signerCpf: activeSigner.cpf,
              timestamp: now,
            });
          }
        }

        return { ...page, stamps };
      });

      return { ...file, pages: updatedPages, status: 'signed' as const };
    });

    setFiles(updatedFiles);

    // Update signer status
    const updatedSigners = signers.map((s, idx) =>
      idx === activeSignerIndex
        ? {
            ...s,
            signatureDataUrl: sigUrl,
            rubricDataUrl: rubUrl,
            status: 'signed' as const,
            signedAt: now,
            ipAddress: '187.54.12.89',
            geolocation: 'São Paulo, SP • Dispositivo Móvel',
          }
        : s
    );
    setSigners(updatedSigners);

    // Create batch audit log
    const batchLog: AuditLog = {
      id: `log-batch-${Date.now()}`,
      timestamp: now,
      action: 'Assinatura em Lote Concluída',
      actor: activeSigner.name,
      details: `Todas as ${totalPages} páginas dos ${files.length} documentos foram assinadas e rubricadas com sucesso com carimbo de Data e Hora (${now}).`,
      hash: sha256Hash.substring(0, 16),
    };
    setAuditLogs((prev) => [...prev, batchLog]);

    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    // Update Envelope in History
    const currentEnvelope: Envelope = {
      id: currentEnvelopeId,
      title: envelopeTitle,
      senderName: activeSigner.name,
      senderEmail: activeSigner.email,
      senderPhone: activeSigner.whatsapp,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: now,
      status: 'signed',
      files: updatedFiles,
      signers: updatedSigners,
      auditLogs: [...auditLogs, batchLog],
      sha256Hash: sha256Hash,
      shareCode: shareCode,
    };

    setEnvelopesHistory((prev) => [
      currentEnvelope,
      ...prev.filter((e) => e.id !== currentEnvelopeId),
    ]);

    // Automatically open Share / Return Modal
    setIsShareExportModalOpen(true);
  };

  const handleBiometricsConfirmed = (data: {
    selfieUrl: string;
    locationStr: string;
    timestamp: string;
  }) => {
    const updatedSigners = signers.map((s, idx) =>
      idx === activeSignerIndex
        ? {
            ...s,
            biometricSelfieUrl: data.selfieUrl,
            geolocation: data.locationStr,
          }
        : s
    );
    setSigners(updatedSigners);

    const log: AuditLog = {
      id: `log-bio-${Date.now()}`,
      timestamp: data.timestamp,
      action: 'Biometria Facial e GPS Registrados',
      actor: activeSigner.name,
      details: `Evidência de segurança: ${data.locationStr}`,
      hash: sha256Hash.substring(0, 16),
    };
    setAuditLogs((prev) => [...prev, log]);
  };

  const getCurrentEnvelope = (): Envelope => {
    return {
      id: currentEnvelopeId,
      title: envelopeTitle,
      senderName: activeSigner.name,
      senderEmail: activeSigner.email,
      senderPhone: activeSigner.whatsapp,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: new Date().toLocaleString('pt-BR'),
      status: isFullySigned ? 'signed' : 'draft',
      files: files,
      signers: signers,
      auditLogs: auditLogs,
      sha256Hash: sha256Hash,
      shareCode: shareCode,
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {saveToastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{saveToastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <HeaderNavigation
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
        totalFiles={files.length}
        isSigned={isFullySigned}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl mx-auto w-full">
        <div
          className={`w-full mx-auto transition-all ${
            isMobileSimulator
              ? 'max-w-md border-8 border-slate-800 rounded-[40px] p-2 bg-slate-900 shadow-2xl my-2'
              : ''
          }`}
        >
          {/* VIEW 1: BATCH UPLOAD & ENVELOPE CONFIGURATION (ETAPA 1: CRIAR E ENVIAR) */}
          {activeView === 'upload' && (
            <BatchUploadSection
              files={files}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              signers={signers}
              onUpdateSigners={setSigners}
              onRemoveSigner={handleRemoveSigner}
              onProceedToSign={() => {
                // Ensure current envelope is saved in history before opening recipient modal
                const env = getCurrentEnvelope();
                setEnvelopesHistory((prev) => {
                  const exists = prev.some((e) => e.id === env.id);
                  if (exists) {
                    return prev.map((e) => (e.id === env.id ? env : e));
                  }
                  return [env, ...prev];
                });
                // Opens Recipient Selection Modal for WhatsApp / Email dispatch with envelope choice
                setIsSendRecipientModalOpen(true);
              }}
              envelopeTitle={envelopeTitle}
              onUpdateTitle={setEnvelopeTitle}
              onOpenSaveEnvelopeModal={() => setIsSaveEnvelopeModalOpen(true)}
              isEnvelopeSaved={isEnvelopeSaved}
            />
          )}

          {/* VIEW 2: MULTI-PAGE & MULTI-FILE SIGNING STUDIO (ETAPA 2: ASSINAR EM LOTE / INDIVIDUAL) */}
          {activeView === 'sign' && (
            <div className="space-y-4">
              {/* Active Envelope & Document Tabs in the Batch */}
              {files.length > 0 && (
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
                    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-emerald-400 font-bold shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{envelopeTitle}</span>
                    </div>

                    {files.map((file, idx) => {
                      const isFileSigned = file.pages.every((p) => p.stamps.length > 0);
                      return (
                        <button
                          key={file.id}
                          onClick={() => {
                            setActiveFileIndex(idx);
                            setActivePageIndex(0);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition ${
                            activeFileIndex === idx
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-850 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[130px] sm:max-w-[180px]">{file.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                              activeFileIndex === idx
                                ? 'bg-slate-900 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {file.pageCount}p
                          </span>
                          {isFileSigned && <span className="text-[10px]">✓</span>}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.id);
                            }}
                            className={`ml-0.5 p-0.5 rounded-md transition ${
                              activeFileIndex === idx
                                ? 'hover:bg-red-500/20 text-slate-700 hover:text-red-600'
                                : 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                            }`}
                            title="Excluir documento"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add more files button */}
                  <button
                    onClick={() => setActiveView('upload')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold shrink-0 border border-slate-700 transition"
                  >
                    + Adicionar Arquivo
                  </button>
                </div>
              )}

              {/* Central Layout: Viewer + Actions Toolbar */}
              {files.length > 0 && currentFile ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left / Center: Interactive Multi-Page Document Canvas */}
                  <div className="lg:col-span-8 h-[68vh] min-h-[500px]">
                    <DocumentViewer
                      currentFile={currentFile}
                      currentPageIndex={activePageIndex}
                      onSelectPage={setActivePageIndex}
                      activeSigner={activeSigner}
                      onAddStamp={handleAddStamp}
                      onRemoveStamp={handleRemoveStamp}
                      signatureDataUrl={activeSigner.signatureDataUrl}
                      rubricDataUrl={activeSigner.rubricDataUrl}
                      onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                      signingMode={signingMode}
                      onChangeSigningMode={setSigningMode}
                    />
                  </div>

                  {/* Right / Bottom: 1-Click Batch Signing & Settings */}
                  <div className="lg:col-span-4 space-y-4">
                    <BatchSigningToolbar
                      totalFiles={files.length}
                      totalPages={totalPages}
                      totalSignedPages={totalSignedPages}
                      signer={activeSigner}
                      settings={settings}
                      onUpdateSettings={setSettings}
                      onBatchSignAllPages={handleBatchSignAllPages}
                      onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
                      onOpenBiometricsModal={() => setIsBiometricsModalOpen(true)}
                      onCompleteAndShare={() => setIsShareExportModalOpen(true)}
                      hasSignature={!!activeSigner.signatureDataUrl}
                      signingMode={signingMode}
                      onChangeSigningMode={setSigningMode}
                    />

                    {/* Quick Channels Shortcut Banner */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
                      <div className="text-xs font-bold text-slate-300">
                        Opções de Envio do Documento Assinado:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsShareExportModalOpen(true)}
                          className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setIsShareExportModalOpen(true)}
                          className="p-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                        >
                          <span>Outlook Mobile</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 text-center">
                        Envie os documentos assinados via WhatsApp ou Outlook Mobile (@logmam.com.br).
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold text-white">Nenhum documento carregado</h3>
                  <p className="text-xs text-slate-400">
                    Faça upload dos seus arquivos para iniciar a assinatura em massa.
                  </p>
                  <button
                    onClick={() => setActiveView('upload')}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Carregar Documentos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: ENVELOPE TRACKING DASHBOARD (ETAPA 3: ENVELOPES) */}
          {activeView === 'tracking' && (
            <EnvelopeTrackingView
              envelopes={envelopesHistory}
              onSelectEnvelope={(env) => {
                handleSelectEnvelope(env.id);
                setActiveView('sign');
              }}
              onCreateNewEnvelope={() => {
                setEnvelopeTitle('Novo Envelope de Documentos');
                setFiles([]);
                setCurrentEnvelopeId(`env-${Date.now()}`);
                setShareCode(Math.random().toString(36).substring(2, 8).toUpperCase());
                setIsEnvelopeSaved(false);
                setActiveView('upload');
              }}
              onOpenShareModal={(env) => {
                handleSelectEnvelope(env.id);
                setIsShareExportModalOpen(true);
              }}
              onOpenAuditModal={(env) => {
                setAuditModalEnvelope(env);
                setIsAuditModalOpen(true);
              }}
              onDeleteEnvelope={handleDeleteEnvelope}
            />
          )}
        </div>
      </main>

      {/* MODAL 0: Save Envelope Modal (Etapa 1 Auto-popup on file upload/import) */}
      <SaveEnvelopeModal
        isOpen={isSaveEnvelopeModalOpen}
        onClose={() => setIsSaveEnvelopeModalOpen(false)}
        onSaveEnvelope={handleSaveEnvelope}
        files={files}
        initialTitle={envelopeTitle}
        signers={signers}
      />

      {/* MODAL 1: Signature & Rubric Creation Pad */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        initialName={activeSigner.name}
        initialCpf={activeSigner.cpf}
      />

      {/* MODAL 2: Biometric Selfie & GPS */}
      <BiometricVerificationModal
        isOpen={isBiometricsModalOpen}
        onClose={() => setIsBiometricsModalOpen(false)}
        onConfirm={handleBiometricsConfirmed}
      />

      {/* MODAL 3: Send to Recipient (Com Seleção do Envelope Desejado) */}
      <SendToRecipientModal
        isOpen={isSendRecipientModalOpen}
        onClose={() => setIsSendRecipientModalOpen(false)}
        onProceedToSigning={() => {
          setIsSendRecipientModalOpen(false);
          setActiveView('sign');
        }}
        envelopes={envelopesHistory}
        activeEnvelopeId={currentEnvelopeId}
        onSelectEnvelope={handleSelectEnvelope}
        currentEnvelope={getCurrentEnvelope()}
        signers={signers}
      />

      {/* MODAL 4: Share & Export / Devolver Envelope Assinado */}
      <ShareExportModal
        isOpen={isShareExportModalOpen}
        onClose={() => setIsShareExportModalOpen(false)}
        envelope={getCurrentEnvelope()}
        activeSigner={activeSigner}
        settings={settings}
      />

      {/* MODAL 5: Legal Audit Trail & Authenticity Certificate */}
      <AuditCertificateModal
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          setAuditModalEnvelope(null);
        }}
        envelope={auditModalEnvelope || getCurrentEnvelope()}
      />
    </div>
  );
}
