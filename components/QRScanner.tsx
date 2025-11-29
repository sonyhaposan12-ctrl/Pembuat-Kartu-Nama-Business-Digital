import React, { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

// Declare jsQR as it's loaded from the CDN script in index.html
declare const jsQR: any;

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const requestRef = useRef<number>(0);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be ready before starting detection
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // jsQR detection
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScan(code.data);
            return; // Stop scanning once found
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="w-full h-full relative flex flex-col items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6 bg-red-500/20 rounded-xl mx-4">
            <p className="font-bold mb-2">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
             {/* Scanner Overlay UI */}
             <div className="absolute inset-0 border-[40px] border-black/50 z-10 pointer-events-none">
                 <div className="w-full h-full border-2 border-blue-400 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    
                    {/* Scanning Line Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                 </div>
             </div>
             
             <style>{`
               @keyframes scan {
                 0% { top: 0; opacity: 0; }
                 50% { opacity: 1; }
                 100% { top: 100%; opacity: 0; }
               }
             `}</style>

             <video ref={videoRef} className="w-full h-full object-cover" />
             <canvas ref={canvasRef} className="hidden" />
             
             <div className="absolute bottom-10 z-20 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
                <p className="text-white font-medium flex items-center gap-2">
                   <Camera size={20} />
                   Arahkan kamera ke kode QR
                </p>
             </div>
          </>
        )}
      </div>
    </div>
  );
};