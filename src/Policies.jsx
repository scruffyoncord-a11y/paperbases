import React from 'react';
import { X, Shield, FileText, CheckCircle2, ChevronRight, Scale, AlertCircle } from 'lucide-react';

export const TERMS_AND_CONDITIONS = {
  lastUpdated: 'April 11, 2026',
  sections: [
    {
      title: '1. Use of the Platform',
      content: 'PaperBase.in provides users access to educational resources including question papers, DPPs, and study materials. By using this platform, you agree: You are at least 13 years old; You will not use the platform for illegal purposes; You will not upload harmful, misleading, or copyrighted content without permission.'
    },
    {
      title: '2. User-Generated Content',
      content: 'Users may upload and share educational materials. By uploading content, you: Confirm that you own the rights or have permission to share it; Grant PaperBase a non-exclusive, royalty-free license to display and distribute the content; Agree not to upload content that violates copyright laws, contains offensive material, or is misleading. We reserve the right to remove any content at our discretion.'
    },
    {
      title: '3. Copyright & DMCA Policy',
      content: 'PaperBase.in respects intellectual property rights. If you believe any content infringes your copyright, you may submit a DMCA Takedown Request. Send requests to legal@paperbase.in with your contact info, description of work, and URL of infringing content.'
    },
    {
      title: '4. Intellectual Property',
      content: 'All platform features, branding, and design elements belong to PaperBase.in. Users may not copy or redistribute platform content or use our branding without authorization.'
    },
    {
      title: '5. Limitation of Liability',
      content: 'PaperBase.in is provided "as is". We are not responsible for the accuracy of user-uploaded content, any losses resulting from use of the platform, or external links.'
    },
    {
      title: '6. Account Termination',
      content: 'We reserve the right to suspend or terminate accounts that violate these terms or remove content without prior notice.'
    },
    {
      title: '7. Governing Law',
      content: 'These Terms shall be governed by the laws of India.'
    }
  ]
};

export const PRIVACY_POLICY = {
  lastUpdated: 'April 11, 2026',
  sections: [
    {
      title: '1. Information We Collect',
      content: 'We collect Personal Information (Name, Email), User Content (Uploaded files, comments), Automatically Collected Data (IP, Browser info), and Cookies to improve user experience.'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use data to provide services, enable sharing, personalize experience, communicate updates, and prevent misuse.'
    },
    {
      title: '3. Data Sharing & Security',
      content: 'We do not sell your personal data. We may share data with service providers or for legal obligations. We implement reasonable measures to protect your data.'
    },
    {
      title: '4. Your Rights',
      content: 'You may have the right to access, correct, or delete your personal data. Contact us at privacy@paperbase.in to exercise these rights.'
    }
  ]
};

export const PolicyAcceptanceModal = ({ isOpen, onAccept, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#161923] border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Legal Update</h2>
              <p className="text-sm text-slate-500 font-medium">Please review our updated terms before continuing.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <section>
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-500">
              <Scale size={18} />
              <h3 className="font-black uppercase tracking-widest text-[11px]">Terms and Conditions</h3>
            </div>
            <div className="space-y-4">
              {TERMS_AND_CONDITIONS.sections.map((s, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.content}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />

          <section>
            <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-500">
              <FileText size={18} />
              <h3 className="font-black uppercase tracking-widest text-[11px]">Privacy Policy</h3>
            </div>
            <div className="space-y-4">
              {PRIVACY_POLICY.sections.map((s, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <AlertCircle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Acceptance is required to access resources</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onCancel}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Later
            </button>
            <button 
              onClick={onAccept}
              className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Accept & Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
