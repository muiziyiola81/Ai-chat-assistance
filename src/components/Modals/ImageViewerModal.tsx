import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Attachment } from '../../types';

interface ImageViewerModalProps {
  image: Attachment | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  image,
  onClose,
}) => {
  const [zoom, setZoom] = React.useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.previewUrl || image.base64;
    link.download = image.name || 'gpt-hub-image.png';
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 max-w-4xl max-h-[90vh] flex flex-col items-center bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0E0E0E] border-b border-[#1A1A1A] text-xs">
            <span className="text-[#FFFFFF] font-medium truncate max-w-xs sm:max-w-md">
              {image.name}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-[#737373] font-mono w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors ml-0.5"
                title="Download"
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] hover:text-[#FFFFFF] transition-colors ml-0.5"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="overflow-auto p-4 flex items-center justify-center min-h-[250px] max-h-[calc(88vh-55px)] bg-[#050505]">
            <motion.img
              src={image.previewUrl || image.base64}
              alt={image.name}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              transition={{ duration: 0.15 }}
              className="max-w-full max-h-[72vh] object-contain rounded-lg border border-[#1A1A1A]"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
