export type SigningMode = 'batch' | 'individual';

export type SignatureType = 'drawn' | 'typed' | 'image';

export type StampType = 'signature' | 'rubric';

export type FileStatus = 'pending' | 'signed';

export type SignerStatus = 'pending' | 'signed';

export type EnvelopeStatus = 'draft' | 'sent' | 'signed' | 'rejected';

export interface SignatureStamp {
  id: string;
  type: StampType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  signerName: string;
  signerCpf?: string;
  timestamp: string;
}

export interface DocumentPage {
  pageNumber: number;
  stamps: SignatureStamp[];
}

export interface DocumentFile {
  id: string;
  name: string;
  pageCount: number;
  pages: DocumentPage[];
  status: FileStatus;
  thumbnailUrl?: string;
  fileDataUrl?: string;
  fileType?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  cpf: string;
  role: string;
  status: SignerStatus;
  signatureDataUrl?: string;
  rubricDataUrl?: string;
  signatureType?: SignatureType;
  signedAt?: string;
  ipAddress?: string;
  geolocation?: string;
  biometricSelfieUrl?: string;
}

export interface SignatureSettings {
  autoRubricAllPages: boolean;
  autoSignLastPage: boolean;
  includeTimestamp: boolean;
  includeCpf: boolean;
  includeAuditCertificate: boolean;
  requireSelfieBiometrics: boolean;
  requireGeolocation: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  hash: string;
}

export interface Envelope {
  id: string;
  title: string;
  description?: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  createdAt: string;
  updatedAt: string;
  status: EnvelopeStatus;
  files: DocumentFile[];
  signers: Signer[];
  auditLogs: AuditLog[];
  sha256Hash: string;
  shareCode: string;
}
