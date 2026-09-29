import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onUpgradeSuccess: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onUpgradeSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      setSuccess(true);
      onUpgradeSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 900);
  };

  const proFeatures = [
    { title: 'Unlimited Deep Reasoning Think Mode', desc: 'Extended multi-step logic and analytical problem solving without limits' },
    { title: 'Verified Web Search Grounding', desc: 'Real-time web search integration with verified citation URLs' },
    { title: 'High-Res Multimodal Files & Camera', desc: 'Direct camera photos, datasets, CSVs, and spreadsheets' },
    { title: 'Priority High-Speed Streaming', desc: 'Sub-second progressive streaming on priority infrastructure' },
    { title: 'Custom AI Assistants & Workspaces', desc: 'Create specialized GPTs with custom knowledge and system directives' },
    { title: 'Spoken AI Voice Audio Generation', desc: 'Studio-grade text-to-speech audio with customizable voices' },
  ];

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
          className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-7"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
            aria-label="Close upgrade modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5 mb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#171717] border border-[#2A2A2A] text-[#FFFFFF] text-[11px] font-semibold">
              <Crown className="w-3 h-3 fill-[#FFFFFF]" />
              <span>GPT HUB PRO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
              Upgrade Your Intelligence
            </h2>
            <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto">
              Access deep reasoning Think Mode, live web grounding, high-speed streaming, and workspaces.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-[#111111] border border-[#222222] rounded-xl w-fit mx-auto mb-5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#FFFFFF] text-[#000000]'
                  : 'text-[#A3A3A3] hover:text-[#FFFFFF]'
              }`}
            >
              $20 / month
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-[#FFFFFF] text-[#000000]'
                  : 'text-[#A3A3A3] hover:text-[#FFFFFF]'
              }`}
            >
              <span>$16 / month</span>
              <span className="text-[10px] px-1 rounded bg-[#262626] text-[#FFFFFF]">
                -20%
              </span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="space-y-2 mb-6">
            {proFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#111111] border border-[#222222]"
              >
                <div className="p-0.5 rounded bg-[#171717] border border-[#2A2A2A] text-[#FFFFFF] flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#FFFFFF]">
                    {feat.title}
                  </div>
                  <div className="text-[11px] text-[#737373] leading-tight">
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {isPro ? (
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-[#FFFFFF] text-center text-xs font-medium">
              You are currently on the Pro plan.
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading || success}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] disabled:opacity-50 text-[#000000] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Upgraded to Pro</span>
                </>
              ) : upgrading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 fill-[#000000]" />
                  <span>Upgrade to Pro</span>
                </>
              )}
            </button>
          )}

          <div className="text-center text-[10px] text-[#666666] mt-2.5">
            Instant activation • Cancel anytime
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
