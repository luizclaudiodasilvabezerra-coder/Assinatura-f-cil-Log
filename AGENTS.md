# Assinatura Fácil Log — Base44 Dev Environment

## Overview
React + TypeScript + Vite + Tailwind CSS app for electronic document signing (batch upload, multi-page signing, envelope tracking, audit certificates).

## Setup
- The app runs via `docker-compose.base44.yml` using a `node:22-slim` base image with the source bind-mounted at `/app`.
- Dependencies install automatically on container startup (`npm install`).
- Vite dev server runs on port 5173 (mapped to host port 3000) with `--host 0.0.0.0` and `allowedHosts: true`.

## Key Files
- `src/App.tsx` — main application component (3 views: upload, sign, tracking)
- `src/types.ts` — all TypeScript interfaces
- `src/utils/pdfHelper.ts` — SHA-256 hashing and sample document generation
- `src/components/` — 11 component files (HeaderNavigation, BatchUploadSection, DocumentViewer, BatchSigningToolbar, SignaturePadModal, BiometricVerificationModal, ShareExportModal, SendToRecipientModal, SaveEnvelopeModal, AuditCertificateModal, EnvelopeTrackingView)

## Verification
- `docker compose -f docker-compose.base44.yml up -d --build`
- Check: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`
- The app loads on the "sign" view by default with sample documents pre-loaded.

## No external secrets required.
