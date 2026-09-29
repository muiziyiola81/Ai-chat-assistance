import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Attachment } from '../../types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (attachment: Attachment) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterActive, setIsShutterActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device or browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions.');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
    }
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;

    onCapture({
      id: `cam-${Date.now()}`,
      name: `Photo_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
      type: 'image',
      mimeType: 'image/jpeg',
      size: Math.round(capturedPhoto.length * 0.75),
      base64: capturedPhoto,
      previewUrl: capturedPhoto,
    });

    onClose();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  if (!isOpen) return null;

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
          className="relative z-10 w-full max-w-md bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] bg-[#0E0E0E]">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#FFFFFF]" />
              <span className="text-xs font-semibold text-[#FFFFFF]">
                Camera
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
              aria-label="Close camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="p-6 text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-[#737373] mx-auto" />
                <p className="text-xs text-[#A3A3A3]">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] text-[#FFFFFF] text-xs font-medium border border-[#333333]"
                >
                  Retry
                </button>
              </div>
            ) : capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />
                <div className="absolute inset-6 border border-dashed border-white/20 rounded-xl pointer-events-none" />
                {isShutterActive && (
                  <div className="absolute inset-0 bg-white opacity-60 pointer-events-none" />
                )}
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Bottom Controls */}
          <div className="p-4 flex items-center justify-around bg-[#0E0E0E] border-t border-[#1A1A1A]">
            {capturedPhoto ? (
              <>
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#171717] hover:bg-[#222222] text-[#FFFFFF] text-xs font-medium border border-[#262626] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] text-xs font-semibold transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Use Photo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={switchCamera}
                  disabled={Boolean(cameraError)}
                  className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-[#FFFFFF] border border-[#222222] transition-colors disabled:opacity-30"
                  title="Switch camera"
                  aria-label="Switch camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={takeSnapshot}
                  disabled={Boolean(cameraError)}
                  className="w-14 h-14 rounded-full border-2 border-[#404040] bg-[#FFFFFF] hover:bg-[#E5E5E5] flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                  title="Take photo"
                  aria-label="Take photo"
                >
                  <div className="w-11 h-11 rounded-full border border-black/20" />
                </button>
                <div className="w-10" />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
