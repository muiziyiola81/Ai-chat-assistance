import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, Link, FileText } from 'lucide-react';
import { Conversation } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareUrl = `${window.location.origin}/#share=${conversation.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMarkdown = () => {
    let md = `# ${conversation.title}\n\n`;
    conversation.messages.forEach((msg) => {
      md += `### ${msg.role === 'user' ? 'User' : 'GPT Hub'}\n\n${msg.content}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg bg-[#09110d] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-emerald-100">
                Share Conversation
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors"
              aria-label="Close share modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="py-4 space-y-2">
            <h3 className="text-sm font-semibold text-emerald-100 truncate">
              {conversation.title}
            </h3>
            <p className="text-xs text-emerald-400/70">
              Messages will be shared cleanly without personal data, custom system prompts, or API keys.
            </p>
          </div>

          {/* Share Link Box */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-emerald-300">
              Public Link
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0c1611] border border-emerald-900/50">
              <Link className="w-4 h-4 text-emerald-400/70 ml-1 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-emerald-200 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alternative Markdown Copy */}
          <div className="pt-3 border-t border-emerald-900/30 flex items-center justify-between">
            <span className="text-xs text-emerald-400/70">
              Need plain text or documentation?
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 text-xs font-medium transition-colors"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Markdown Copied</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
