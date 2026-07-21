import { useRef, useState, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ExtractedReceipt } from '../lib/types';

interface ScanProps {
  onClose: () => void;
  onExtracted: (receipt: ExtractedReceipt, imageBase64: string) => void;
}

type Phase = 'camera' | 'processing';

export function Scan({ onClose, onExtracted }: ScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('camera');
  const [processingStep, setProcessingStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const steps = [
    'Reading receipt...',
    'Detecting store',
    'Extracting products',
    'Organizing purchase',
    'Saving to your vault',
  ];

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied. You can upload a photo instead.');
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    processReceipt(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
      processReceipt(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processReceipt = async (imageBase64: string) => {
    setPhase('processing');

    // Animate steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length - 1) setProcessingStep(step);
    }, 800);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-receipt`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      clearInterval(interval);
      setProcessingStep(steps.length - 1);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (!data.receipt) throw new Error('No receipt data returned');

      // Small delay so the last checkmark animates
      setTimeout(() => {
        onExtracted(data.receipt as ExtractedReceipt, imageBase64);
      }, 600);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to process receipt. Please try again.');
      setPhase('camera');
      setCapturedImage(null);
    }
  };

  if (phase === 'processing') {
    return <ProcessingView capturedImage={capturedImage} steps={steps} currentStep={processingStep} />;
  }

  return (
    <div className="fixed inset-0 bg-ink-900 z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4 safe-top">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-white font-semibold text-sm">Scan Receipt</p>
        <div className="w-10" />
      </div>

      {/* Camera view */}
      <div className="flex-1 relative flex items-center justify-center px-6">
        {error ? (
          <div className="text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-9 h-9 text-white/60" />
            </div>
            <p className="text-white/80 text-sm mb-6 max-w-xs mx-auto">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              Upload Photo
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Scan frame overlay */}
            <div className="relative w-full max-w-sm aspect-[3/4] z-10">
              <div className="absolute inset-0 rounded-3xl border-2 border-white/30" />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary-400 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary-400 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary-400 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary-400 rounded-br-3xl" />
              {/* Scanning line */}
              <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-primary-400 shadow-glow animate-pulse-soft" />
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm font-medium z-10">
              Position your receipt inside the frame
            </p>
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 pt-4 safe-bottom">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={capture}
            disabled={!stream}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center
              active:scale-90 transition-transform shadow-xl
              disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center">
              <Camera className="w-7 h-7 text-primary-600" />
            </div>
          </button>

          <div className="w-12 h-12" />
        </div>
        <p className="text-center text-white/50 text-xs mt-3">Tap to capture</p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

function ProcessingView({
  capturedImage,
  steps,
  currentStep,
}: {
  capturedImage: string | null;
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="fixed inset-0 bg-ink-900 z-50 flex flex-col items-center justify-center px-8">
      {/* Captured image preview */}
      {capturedImage && (
        <div className="w-40 h-52 rounded-2xl overflow-hidden mb-8 border-2 border-white/20 shadow-2xl">
          <img src={capturedImage} alt="Receipt" className="w-full h-full object-cover" />
        </div>
      )}

      {/* AI Badge */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg">Vaulted AI</span>
      </div>

      {/* Steps */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-300 ${
              i <= currentStep ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                i < currentStep
                  ? 'bg-primary-500'
                  : i === currentStep
                  ? 'bg-primary-500/30 border-2 border-primary-400'
                  : 'bg-white/10'
              }`}
            >
              {i < currentStep ? (
                <Check className="w-3.5 h-3.5 text-white animate-check" />
              ) : i === currentStep ? (
                <Loader2 className="w-3.5 h-3.5 text-primary-300 animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/30" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                i <= currentStep ? 'text-white' : 'text-white/40'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
