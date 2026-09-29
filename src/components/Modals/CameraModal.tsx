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
        setCameraError('Camera access was denied. Please allow camera permissions in your browser settings.');
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
    setTimeout(() => setIsShutterActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        // Mirror front camera
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
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-[#09110c] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-900/40 bg-[#0c1610]">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-100">
                GPT Hub Camera
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/60 transition-colors"
              aria-label="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder Area */}
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-emerald-500/80 mx-auto" />
                <p className="text-sm text-emerald-200">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30"
                >
                  Retry Camera
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
                {/* Viewfinder crosshairs */}
                <div className="absolute inset-8 border border-dashed border-emerald-400/30 rounded-2xl pointer-events-none" />
                {isShutterActive && (
                  <div className="absolute inset-0 bg-white opacity-80 pointer-events-none" />
                )}
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Bottom Controls */}
          <div className="p-5 flex items-center justify-around bg-[#0c1610] border-t border-emerald-900/40">
            {capturedPhoto ? (
              <>
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-sm font-medium border border-emerald-800/40 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Use Photo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={switchCamera}
                  disabled={Boolean(cameraError)}
                  className="p-3 rounded-full bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 transition-colors disabled:opacity-40"
                  title="Switch camera"
                  aria-label="Switch camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={takeSnapshot}
                  disabled={Boolean(cameraError)}
                  className="w-16 h-16 rounded-full border-4 border-emerald-500/80 bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-90 disabled:opacity-40"
                  title="Take photo"
                  aria-label="Take photo"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-black/30" />
                </button>
                <div className="w-11" /> {/* Spacer */}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
