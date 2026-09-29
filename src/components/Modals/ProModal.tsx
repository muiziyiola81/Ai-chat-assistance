import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown, Sparkles, Zap, Shield, Globe } from 'lucide-react';

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
      }, 1500);
    }, 1200);
  };

  const proFeatures = [
    { title: 'Unlimited Think Mode Reasoning', desc: 'Deep logic and multi-step complex problem solving without throttling' },
    { title: 'Live Web Grounding with Citations', desc: 'Real-time web search integration with verified source links' },
    { title: '30MB High-Res File & Image Analysis', desc: 'Direct camera photos, datasets, CSVs, and spreadsheets' },
    { title: 'Ultra-Fast Response Bandwidth', desc: 'Sub-second progressive streaming on priority infrastructure' },
    { title: 'Custom AI Assistants & Projects', desc: 'Unlimited custom GPTs with specialized knowledge & system instructions' },
    { title: 'Full Voice Speech Audio Generation', desc: 'High-fidelity spoken response generation with customizable voice profiles' },
  ];

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-xl bg-gradient-to-b from-[#0c1812] to-[#070d0a] border border-emerald-600/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
            aria-label="Close upgrade modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Crown className="w-3.5 h-3.5 fill-emerald-400" />
              <span>GPT HUB PRO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Unlock the Full Power of Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/70 max-w-md mx-auto">
              Get access to deep reasoning Think Mode, live web grounding, high-speed streaming, and custom assistant workspaces.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-emerald-950/60 border border-emerald-900/50 rounded-xl w-fit mx-auto mb-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-500 text-black font-semibold shadow-md'
                  : 'text-emerald-400/80 hover:text-emerald-200'
              }`}
            >
              $20 / Month
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-500 text-black font-semibold shadow-md'
                  : 'text-emerald-400/80 hover:text-emerald-200'
              }`}
            >
              <span>$16 / Month</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-100">
                Save 20%
              </span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="space-y-3 mb-6">
            {proFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30"
              >
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-100">
                    {feat.title}
                  </div>
                  <div className="text-[11px] text-emerald-400/60 leading-tight">
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {isPro ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-center text-xs font-medium">
              You are currently on the GPT Hub Pro Plan. Thank you for your support!
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading || success}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-75 text-black font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Welcome to GPT Hub Pro!</span>
                </>
              ) : upgrading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Upgrading Account...</span>
                </div>
              ) : (
                <>
                  <Crown className="w-4 h-4 fill-black" />
                  <span>Upgrade to Pro Now</span>
                </>
              )}
            </button>
          )}

          <div className="text-center text-[10px] text-emerald-500/50 mt-3">
            Secure checkout • Instant activation • Cancel anytime with one click
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
