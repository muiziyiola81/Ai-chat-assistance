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
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleCopyMarkdown = () => {
    let md = `# ${conversation.title}\n\n`;
    conversation.messages.forEach((msg) => {
      md += `### ${msg.role === 'user' ? 'User' : 'GPT Hub'}\n\n${msg.content}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#FFFFFF]" />
              <h2 className="text-sm font-semibold text-[#FFFFFF]">
                Share Conversation
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
              aria-label="Close share modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="py-3.5 space-y-1">
            <h3 className="text-xs font-semibold text-[#FFFFFF] truncate">
              {conversation.title}
            </h3>
            <p className="text-[11px] text-[#737373]">
              Messages are formatted cleanly without internal keys or settings.
            </p>
          </div>

          {/* Share Link Box */}
          <div className="space-y-1.5 mb-4">
            <label className="text-[11px] font-medium text-[#A3A3A3]">
              Public Link
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#111111] border border-[#262626]">
              <Link className="w-3.5 h-3.5 text-[#737373] ml-1.5 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-[#FFFFFF] outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs transition-colors flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 stroke-[2]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Markdown Copy */}
          <div className="pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[11px] text-[#737373]">
              Export as text document?
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#FFFFFF] text-xs font-medium transition-colors"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3 h-3 text-[#FFFFFF]" />
                  <span>Markdown Copied</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 text-[#A3A3A3]" />
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
