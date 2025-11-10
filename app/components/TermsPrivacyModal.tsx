import React from 'react';

interface TermsPrivacyModalProps {
  open: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const TERMS = `🧾 TERMS OF SERVICE\nEffective Date: November 2025\nVersion: 1.0\nApplies To: Smart Attendance System (SAS)\n1. Introduction\nWelcome to the Smart Attendance System (SAS). This document (“Terms of Service” or “Agreement”) governs your access to and use of the Smart Attendance System developed as part of the SE 342 Software Validation and Testing course project (Student ID: 220706802) at Maltepe University.\nBy using the System, you agree to be bound by these Terms. If you do not agree to these Terms, please refrain from accessing or using the Smart Attendance System.\nThe System is designed to automate classroom attendance using facial recognition technology, ensuring efficiency, accuracy, and security in academic attendance management.\n2. Definitions\n“System” refers to the Smart Attendance System software, including its web interface, camera modules, database, and APIs.\n“User” refers to any individual accessing or operating the System, including administrators and instructors.\n“Student” refers to an individual whose facial data is stored in the System for attendance tracking purposes.\n“Institution” refers to the university, school, or organization deploying the System.\n“Data” refers to all personal information, attendance logs, facial embeddings, and usage records stored by the System.\n3. Description of Service\nThe Smart Attendance System is a facial recognition-based attendance management platform. It enables authorized administrators or instructors to register students, manage attendance sessions, and generate statistical reports.\nKey functionalities include:\nSecure login and user authentication for authorized personnel.\nStudent registration using facial data (photo upload or live capture).\nReal-time face detection and recognition during attendance sessions.\nAutomatic attendance marking and data storage in a secure database.\nReport generation and analytics features (PDF/CSV exports).\nOptional security configurations, logging, and backup mechanisms\nSMART+ATTENDANCE+SYSTEM%2822070…\n.\n4. Eligibility\nOnly authorized users — such as instructors, administrators, or institution-appointed staff — are permitted to use the System.\nStudents do not have login access; their participation is limited to passive recognition through authorized data capture.\nBy using the System, you represent that you are authorized by the deploying institution and that you agree to these Terms.\n5. User Responsibilities\nAs a user of the System, you agree to:\nAccess the System only for legitimate educational or institutional purposes.\nMaintain the confidentiality of login credentials and authentication tokens.\nEnsure that data entered into the System is accurate and lawful.\nAvoid sharing student data externally without institutional consent.\nRefrain from using the System to discriminate, harass, or unlawfully profile any person.\nUsers are responsible for all activities conducted under their accounts. The Institution and Developers are not responsible for any damages arising from misuse or unauthorized access caused by user negligence.\n6. Prohibited Activities\nYou may not, under any circumstances:\nAttempt to hack, reverse-engineer, or exploit vulnerabilities in the System.\nCircumvent authentication or encryption mechanisms.\nUpload malicious software, scripts, or camera exploits.\nCopy, redistribute, or modify the software code without written authorization.\nCollect student or staff data for non-educational purposes.\nViolation of these provisions may result in termination of access and possible legal action.\n7. Data Ownership and Intellectual Property\nAll software components (code, design, architecture) are the intellectual property of the System’s developer(s).\nHowever, data collected through the System (student information, attendance records, and reports) remains the property of the deploying institution.\nUsers and institutions must comply with applicable privacy regulations (such as the General Data Protection Regulation (GDPR) or Türkiye’s KVKK law) when processing student data.\n8. System Reliability and Maintenance\nThe System is provided on an “as-is” and “as-available” basis. While it is developed with robust testing and validation (Agile Scrum methodology, unit tests, and integration tests), occasional downtimes, software bugs, or hardware issues (e.g., camera or network failures) may occur.\nScheduled maintenance or feature updates may temporarily affect availability. The Institution will provide prior notice when possible.\n9. Limitation of Liability\nUnder no circumstances shall the developers, instructors, or affiliated institution be liable for:\nErrors in face recognition due to lighting, obstruction, or hardware defects.\nUnauthorized access resulting from weak or shared passwords.\nData loss due to external system failures, user error, or hardware corruption.\nIndirect or consequential damages, including data inaccuracies or attendance disputes.\nUsers acknowledge that while the System enhances efficiency, manual verification remains the ultimate responsibility of instructors.\n10. Termination and Suspension\nThe Institution reserves the right to suspend or terminate any user account if:\nThese Terms are violated.\nUnauthorized access or suspicious activity is detected.\nMisuse of student data is identified.\nUpon termination, all associated session data may be deactivated or deleted as per institutional data retention policies.\n11. Modifications and Updates\nThese Terms of Service may be updated periodically. All revisions will be posted within the System interface. Continued use after updates constitutes acceptance of the revised Terms.\n12. Governing Law\nThis Agreement shall be governed by and construed in accordance with the laws of the Republic of Türkiye, without regard to its conflict of law principles.`;

const PRIVACY = `🔒 PRIVACY POLICY\nEffective Date: November 2025\nVersion: 1.0\n1. Overview\nThis Privacy Policy describes how the Smart Attendance System (SAS) collects, processes, stores, and protects user data. The System respects data privacy and adheres to applicable data protection laws, including GDPR (EU) and KVKK (Türkiye).\nThe System uses facial recognition technology responsibly and solely for attendance management purposes within educational institutions\nSMART+ATTENDANCE+SYSTEM%2822070…\n.\n2. Data Collected\na. Personal Information\nStudent Name, Student ID, Class, and Section.\nAdministrator/Instructor login details (name, email, role).\nb. Biometric Data\nCaptured student photos and corresponding facial embeddings generated by AI algorithms (e.g., FaceNet or Dlib).\nThese embeddings are numerical values used for recognition, not raw images.\nc. System Logs and Metadata\nAttendance timestamps, session details, login activity, and report generation logs.\nDevice information (camera ID, resolution, FPS) used during session setup.\n3. Purpose of Data Collection\nThe System processes personal and biometric data for the following legitimate educational purposes:\nTo register students for attendance tracking.\nTo identify and mark attendance automatically using facial recognition.\nTo generate and export attendance reports (daily, weekly, or monthly).\nTo improve accuracy and performance of recognition models through validation testing.\nTo maintain security, prevent fraud, and ensure data integrity.\nNo data is collected for marketing, surveillance, or profiling purposes.\n4. Data Storage and Security\nAll student and attendance data is stored in an encrypted database backend.\nPasswords are protected using bcrypt hashing or equivalent algorithms.\nEnvironment variables (.env) are used to protect database credentials and API keys.\nRegular security audits and validation tests are performed during development.\nData backups and restoration mechanisms are configured to prevent loss.\nSensitive biometric data is encrypted both in transit (via HTTPS/SSL) and at rest within secure database tables\nSMART+ATTENDANCE+SYSTEM%2822070…\n.\n5. Data Sharing and Third Parties\nThe System does not share or sell personal or biometric data to third parties.\nData may be shared only with:\nThe institution’s internal administration (for reporting or verification).\nAuthorized IT personnel maintaining or securing the system.\nLegal authorities, only when required by applicable law.\nAny external data transmission (e.g., cloud backup to AWS S3 or Google Cloud) will comply with data protection standards and encryption policies.\n6. Data Retention\nThe Institution determines how long attendance and biometric data are stored. Generally:\nAttendance records are retained for the academic semester or year.\nAfter the retention period, data may be anonymized or securely deleted.\nBackups older than the retention period will be purged.\nUsers can request early deletion of personal data where permitted by institutional or national policy.\n7. Data Accuracy and Rights of Students\nAlthough students are passive users, they retain certain data rights under GDPR/KVKK, including:\nRight to Access: To know what personal data is stored.\nRight to Rectification: To correct inaccurate information.\nRight to Erasure (“Right to be Forgotten”): To request deletion when data is no longer needed.\nRight to Restrict Processing: To request limitations on how their data is used.\nRequests should be made through the institution’s data controller (e.g., IT or academic office).\n8. Cookies and Tracking Technologies\nThe Smart Attendance System does not use cookies or third-party tracking scripts.\nSession analytics are limited to performance monitoring, error detection, and user authentication status.\n9. Data Breach Policy\nIn the event of a data breach or unauthorized access:\nThe Institution will notify affected users (administrators and students) within 72 hours.\nInternal investigations will be initiated to identify vulnerabilities.\nImmediate steps will be taken to secure compromised systems and restore data from backups.\nAll incidents will be logged and reviewed as part of the validation and quality assurance process.\n10. International Data Transfers\nIf institutional deployment involves cloud synchronization (e.g., AWS, Google Cloud), all transfers will follow GDPR-compliant mechanisms, ensuring data is processed only in approved regions with adequate safeguards.\n11. Developer Disclaimer\nThis System was originally developed as part of an academic software engineering project for educational purposes. While security and privacy have been integrated into its design, it is the deploying institution’s responsibility to ensure compliance with local data protection laws and ethical guidelines upon real-world implementation.\n12. Updates to Privacy Policy\nThis Policy may be updated from time to time to reflect improvements in technology, legal requirements, or institutional policy changes.\nUsers will be notified within the System interface upon any update.\n13. Contact Information\nFor questions or concerns regarding data privacy, please contact the System Administrator or Institutional Data Controller at:\nEmail: [Insert Institutional Contact]\nAddress: Maltepe University, Faculty of Engineering and Natural Sciences, Istanbul, Türkiye\nAttn: Smart Attendance System – Data Privacy Office`;


import { useTheme } from '../context/ThemeContext';
import React, { useRef } from 'react';


export default function TermsPrivacyModal({ open, onClose, type }: TermsPrivacyModalProps) {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  if (!open) return null;
  const content = type === 'terms' ? TERMS : PRIVACY;
  // Başlık ve içerik ayrımı
  const lines = content.split('\n');
  const title = lines[0];
  const effective = lines[1];
  const version = lines[2];
  const rest = lines.slice(3).join('\n');

  // Dışarı tıklayınca kapat
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center animate-fadeIn`}
      style={{
        background: theme === 'dark'
          ? 'rgba(10,16,32,0.96)'
          : 'rgba(0,16,64,0.18)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-white via-[#f6f8ff] to-[#eaf0ff] dark:from-[#181A20] dark:via-[#23263a] dark:to-[#1a1d2b] rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-[#e0e7ff] dark:border-[#23263a]"
        style={{ boxShadow: theme === 'dark' ? '0 8px 40px 0 #000a, 0 1.5px 8px 0 #0046ff33' : undefined }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-[#0046FF] transition-colors z-10 font-bold"
          onClick={onClose}
          aria-label="Close"
          style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}
        >
          ×
        </button>
        <div className="px-8 pt-8 pb-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0046FF]/50 scrollbar-track-transparent">
          <div className="mb-2 text-center">
            <span className="block text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#0046FF] to-[#FF8040] bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '-0.01em' }}>{title}</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{effective} &nbsp;|&nbsp; {version}</span>
          </div>
          <div className="prose prose-sm max-w-none text-[1.05em] leading-relaxed" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 500, letterSpacing: '0.01em', color: theme === 'dark' ? '#e6e8ee' : '#23263a' }}>
            {rest.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block', marginBottom: '0.5em', whiteSpace: 'pre-line', color: theme === 'dark' ? '#e6e8ee' : '#23263a' }}>{line}</span>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        /* Custom scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-[#0046FF]/50::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #0046FF 0%, #FF8040 100%);
          border-radius: 8px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        .prose span {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
