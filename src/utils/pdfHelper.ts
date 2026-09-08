import { DocumentFile, Envelope } from '../types';

// Encode envelope data into a URL-safe base64 string (strips large fileDataUrl to keep URL manageable)
export function encodeEnvelopeForLink(env: Envelope): string {
  const stripped: Envelope = {
    ...env,
    files: env.files.map((f) => ({ ...f, fileDataUrl: undefined, thumbnailUrl: undefined })),
  };
  const json = JSON.stringify(stripped);
  // Handle Unicode: encode to UTF-8 then base64
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// Decode envelope data from a base64 string
export function decodeEnvelopeFromLink(encoded: string): Envelope | null {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as Envelope;
  } catch {
    return null;
  }
}

export async function calculateSha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSampleDocumentBundle(): Promise<DocumentFile[]> {
  return [
    {
      id: 'doc-1',
      name: 'Contrato de Prestação de Serviços.pdf',
      pageCount: 2,
      status: 'pending',
      pages: [
        { pageNumber: 1, stamps: [] },
        { pageNumber: 2, stamps: [] },
      ],
    },
    {
      id: 'doc-2',
      name: 'Termo de Confidencialidade.pdf',
      pageCount: 1,
      status: 'pending',
      pages: [
        { pageNumber: 1, stamps: [] },
      ],
    },
  ];
}
