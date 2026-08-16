import React, { useState } from 'react';

interface FeedbackReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimText?: string;
  verdict?: string;
  requestId?: string;
}

export const FeedbackReportModal: React.FC<FeedbackReportModalProps> = ({
  isOpen,
  onClose,
  claimText = '',
  verdict = '',
  requestId = '',
}) => {
  const [reportType, setReportType] = useState<'DISPUTE_VERDICT' | 'MISSING_SOURCE' | 'AUDIO_ISSUE' | 'OTHER'>('DISPUTE_VERDICT');
  const [userNote, setUserNote] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side rate limiting: max 3 reports per 2 minutes
    try {
      const reportHistory = JSON.parse(localStorage.getItem('verivoice_report_log') || '[]');
      const now = Date.now();
      const recentReports = reportHistory.filter((t: number) => now - t < 120000);
      if (recentReports.length >= 3) {
        setErrorMessage("You've submitted several feedback notes recently. Please wait a few moments before sending another.");
        return;
      }
      recentReports.push(now);
      localStorage.setItem('verivoice_report_log', JSON.stringify(recentReports));
    } catch {
      // Fallback if local storage fails
    }

    setIsSubmitting(true);

    // Controlled, sanitized feedback payload
    const reportPayload = {
      reportId: `rep_${Date.now()}`,
      requestId: requestId || `req_${Date.now()}`,
      reportType,
      claimSnippet: claimText.substring(0, 150),
      verdict,
      userNote: userNote.trim().substring(0, 500),
      sourceLink: sourceLink.trim().substring(0, 200),
      timestamp: new Date().toISOString(),
    };

    console.info('[VeriVoice Feedback] Logged dispute report:', reportPayload);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    }, 400);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#14161F] border border-white/[0.12] shadow-2xl space-y-6 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-teal-bright">
              <span className="material-symbols-outlined text-[20px]">flag</span>
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Feedback & Evidence Correction
              </span>
            </div>
            <h3 className="font-editorial text-xl font-medium text-white">
              Report Claim or Suggest Source
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <span className="material-symbols-outlined text-brand-teal-bright text-[40px]">
              check_circle
            </span>
            <p className="text-sm text-white font-medium">Thank you for your feedback!</p>
            <p className="text-xs text-text-secondary font-light">
              Your note has been logged to improve institutional grounding accuracy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {claimText && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-muted">Target Inquiry</span>
                <p className="text-xs text-text-primary truncate">"{claimText}"</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase">Feedback Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0E0E] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-teal-bright"
              >
                <option value="DISPUTE_VERDICT">Dispute Verdict (Verdict seems inaccurate)</option>
                <option value="MISSING_SOURCE">Suggest Official Source / Citation</option>
                <option value="AUDIO_ISSUE">Audio / Pronunciation Issue</option>
                <option value="OTHER">Other Feedback</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase">Optional Explanation</label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Explain why this verdict should be reviewed..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0E0E] border border-white/[0.1] text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-brand-teal-bright"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-text-muted uppercase">Optional Authoritative Source URL</label>
              <input
                type="url"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="https://who.int/... or https://nasa.gov/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0E0E] border border-white/[0.1] text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-brand-teal-bright"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-mono text-verdict-mixed">{errorMessage}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-dim text-white font-mono text-xs uppercase tracking-wider font-semibold transition-tactile disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
