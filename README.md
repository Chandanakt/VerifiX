# VerifiX
VerifiX – AI-Powered Document Verification &amp; Certificate Automation
🛡️ VerifiX is a secure, AI-driven academic document platform that enables students, colleges, and third parties to verify, request, issue, and publicly validate academic certificates using Google AI, Firebase, and QR-based verification.

It eliminates fake certificates, manual delays, and opaque approvals by combining AI forensic analysis, human-in-the-loop approval, and tamper-proof digital certificates.

Problem Statement

Academic institutions face:

Fake and tampered certificates

Manual, time-consuming verification processes

No public verification mechanism

Lack of transparency in approval decisions

VerifiX solves this by creating a digital trust layer for academic documents.

Key Features
AI Document Forensics

Upload existing documents for authenticity checks

Gemini AI analyzes:

Logical inconsistencies

Formatting anomalies

Date conflicts

Suspicious patterns

Generates Explainable Trust Score with reasons
🏛️ Certificate Request & Issuance

Students request official documents (Bonafide, NOC, Transcript, etc.)

Admin reviews AI results and approves/rejects

System generates certificates using:

Prescribed college templates

Student details

Authority digital signature

Unique QR code

📄 Tamper-Proof Certificates

Auto-generated PDF certificates

Embedded QR code for verification

Secure download links

Stored and accessible from Student Dashboard
🔍 Public Verification via QR Scan

Anyone can scan QR using a phone camera

Opens a public verification page

Displays:

Certificate validity

Student details

Issuing authority

Verification engine (TrustAnchor AI)

👨‍⚖️ Human-in-the-Loop Admin Workflow

AI performs first-level analysis

Admin takes final decision

Trust score + AI reasons shown to admin

Students can delete requests before admin action
👩‍🎓 Student Dashboard

Two clear flows:

Verify existing documents

Request new certificates

View request status

Download approved certificates

Verify issued certificates anytime

🧠 AI Workflow

Student uploads document or requests certificate

Firebase Cloud Function triggers:

OCR (Google Vision API)

AI forensic analysis (Gemini)

AI generates:

Verdict

Confidence score

Reasoning

Admin reviews & approves

System generates QR-enabled certificate

Certificate becomes publicly verifiable

🧩 Tech Stack
🔹 Google Technologies Used

Google Gemini API – AI forensic analysis

Firebase Authentication – Secure user login

Cloud Firestore – Real-time database

Firebase Cloud Functions – Serverless backend

Google Cloud Vision API – OCR

Google Cloud Storage – Certificate storage

Google QR Code verification flow

🔹 Frontend

React.js

Tailwind CSS

React Router

🔹 Backend

Firebase Cloud Functions (Node.js)

pdf-lib (certificate generation)

QRCode library

📁 Project Structure
VerifiX/
├── frontend/
│   ├── pages/
│   │   ├── StudentDashboard.jsx
│   │   ├── MyRequests.jsx
│   │   ├── MyCertificates.jsx
│   │   ├── VerifyCertificate.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminRequestDetails.jsx
│   ├── firebase.js
│   └── App.jsx
│
├── functions/
│   ├── index.js        # AI pipeline + certificate generation
│   └── package.json
│
└── README.md

🚀 Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/VerifiX.git
cd VerifiX

2️⃣ Frontend Setup
cd frontend
npm install
npm run dev

3️⃣ Firebase Setup

Create Firebase project

Enable:

Authentication (Email/Google)

Firestore

Cloud Functions

Cloud Storage

4️⃣ Configure Gemini API Key
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"

5️⃣ Deploy Backend
cd functions
npm install
firebase deploy --only functions

🔐 Security & Privacy

No hardcoded API keys

Role-based access (Student/Admin)

Public verification is read-only

Students can delete pending requests

Certificates cannot be modified after issuance

📊 Use Cases

Internship & placement verification

Scholarship applications

University admissions

Embassy & visa checks

Employer background verification

🌱 Future Enhancements

Google Wallet integration

Blockchain hash anchoring

Multi-college onboarding

API access for recruiters & embassies

Advanced forgery detection (deepfake, metadata)

🏆 Why VerifiX Wins Hackathons

Solves a real, painful problem

Uses Google AI meaningfully

Demonstrates end-to-end engineering

Clear social & institutional impact

Scalable, secure, and practical
