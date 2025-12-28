# 🛡️ VerifiX – AI-Powered Document Verification &amp; Certificate Automation

**VerifiX** is a secure, AI-driven academic document platform that enables students, colleges, and third parties to verify, request, issue, and publicly validate academic certificates using Google AI, Firebase, and QR-based verification.

It eliminates fake certificates, manual delays, and opaque approvals by combining AI forensic analysis, human-in-the-loop approval, and tamper-proof digital certificates.

## ✨ Key Features

### 🔍 Document Originality Verification
- Upload existing academic documents (Bonafide, Transcript, NOC, etc.)
- AI-based forensic analysis using Gemini:
- Logical inconsistencies
- Date conflicts
- Formatting anomalies
- Suspicious textual patterns
- Generates Explainable Trust Score with reasons
- Admin review for high-risk documents

### 🏛️ Official Certificate Request
- Students can request new certificates from the college
- Supported certificate types:
- Bonafide
- NOC
- Transcript
- Fee Receipt
- Requests follow a AI → Admin approval workflow
- Students can delete requests before admin action

### 📄 Automated Certificate Generation
- Approved requests generate official certificates using:
- Prescribed college templates
- Student details
- Authority digital signature
- Unique QR code
- Certificates generated as tamper-proof PDFs

### 🔍 Public Verification via QR Code
- Each certificate contains a QR code
- QR scan opens a public verification page
- Displays:
-- Certificate validity
-- Student email
-- Certificate type
- Purpose:Issuing authority & Verification engine

### 👨‍⚖️ Human-in-the-Loop Admin Workflow
- AI performs initial forensic analysis
- Admin reviews trust score and AI reasons
- Final approval or rejection by admin
- Full transparency in decision-making
  
### 👩‍🎓 Student Dashboard
- Two clear flows:
-- Verify existing documents
-- Request new certificates
-- Track request status in real time
-- Download approved certificates
-- Verify issued certificates anytime

### 🧠 AI Processing Flow
- Student uploads document or submits certificate request
- Firestore trigger activates Cloud Function
- OCR extraction using Google Cloud Vision
- Gemini AI performs forensic analysis
- Trust score and reasons generated
- Admin approves or rejects
- Approved → certificate PDF generated with QR code
- Certificate becomes publicly verifiable

### 🧩 Technology Stack
## 🔹 Google Technologies
- Google Gemini API – AI forensic reasoning & trust score
- Firebase Authentication – Secure login
- Cloud Firestore – Real-time database
- Firebase Cloud Functions – Serverless backend
- Google Cloud Vision API – OCR extraction
- Firebase Cloud Storage – Certificate storage
- Google QR ecosystem – Public verification

## 🔹 Frontend
- React.js
- Tailwind CSS
- React Router

## 🔹 Backend
- Firebase Cloud Functions (Node.js)
- pdf-lib (PDF generation)
- QRCode library

## Project Structure

```
VerifiX/
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── serviceAccountKey.json
│   └── index.js
│
├── frontend/
│   ├── dist/
│   ├── node_modules/
│   ├── src/
│   │   ├── auth/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useUserRole.js
│   │   ├── pages/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MyRequests.jsx
│   │   │   ├── MyCertificates.jsx
│   │   │   ├── VerifyCertificate.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminRequestDetails.jsx
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── package-lock.json
│
├── .firebase/
├── .firebaserc
├── firebase.json
├── firestore.rules
├── storage.rules
├── CNAME
├── README.md
└── .gitignore


```
### 🔐 Security & Privacy
- No hardcoded API keys
- Role-based access control
- Public verification is read-only
- Requests deletable only before admin action
- Certificates immutable after issuance

### 📊 Usage Guide
#### 1. Verify Existing Document
- Upload document
- Select type and purpose
- AI generates trust score
- Admin review if required
  
#### 2. Request New Certificate
- Submit certificate request
- Admin reviews AI analysis
- Certificate generated on approval
- Available for download and verification

#### 3. Public Verification
- Scan QR code on certificate
- Opens verification page
- Displays certificate authenticity

### 🌱 Future Enhancements
- Google Wallet integration
- Blockchain hash anchoring
- Multi-institution onboarding
- API access for recruiters and embassies
- Advanced forgery detection
