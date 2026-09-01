import { DocumentFile } from '../types';

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
