import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const playingRef = useRef(false);
  const [status, setStatus] = useState('starting');
  const [lastScanned, setLastScanned] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeCam, setActiveCam] = useState(null);

  const stopCamera = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    playingRef.current = false;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (deviceId) => {
    stopCamera();
    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      video.oncanplay = async () => {
        if (playingRef.current) return;
        try {
          await video.play();
          playingRef.current = true;
          setStatus('scanning');
        } catch (e) {
          if (e.name !== 'AbortError') {
            setStatus('error');
            setErrorMsg('Could not start video playback.');
          }
        }
      };
    } catch (err) {
      setStatus('error');
      setErrorMsg('Camera access denied. Please allow camera permission or use manual entry below.');
    }
  }, [stopCamera]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cams = devices.filter(d => d.kind === 'videoinput');
        setCameras(cams);
      }).catch(() => {});

    startCamera(null);
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code && code.data && code.data !== lastScanned) {
        handleFound(code.data);
        return;
      }
    } catch (e) {}
    animRef.current = requestAnimationFrame(scanFrame);
  }, [lastScanned, stopCamera]);

  useEffect(() => {
    if (status === 'scanning') {
      animRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [status, scanFrame]);

  const handleFound = (data) => {
    setLastScanned(data);
    setStatus('found');
    stopCamera();
    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onScan(data), 700);
  };

  const handleManual = () => {
    if (manualInput.trim()) handleFound(manualInput.trim());
  };

  const handleCamSwitch = (deviceId) => {
    setActiveCam(deviceId);
    setStatus('starting');
    setLastScanned('');
    startCamera(deviceId);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl animate-slide-up"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(21,101,192,0.2)' }}>
              <Zap size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>QR / Barcode Scanner</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Point camera at barcode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative bg-black" style={{ aspectRatio: '1' }}>
          <video ref={videoRef} className="object-cover w-full h-full" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {status === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {[
                  ['top-0 left-0',    'border-t-2 border-l-2 rounded-tl-lg'],
                  ['top-0 right-0',   'border-t-2 border-r-2 rounded-tr-lg'],
                  ['bottom-0 left-0', 'border-b-2 border-l-2 rounded-bl-lg'],
                  ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-lg'],
                ].map(([pos, cls], i) => (
                  <div key={i} className={`absolute w-8 h-8 ${pos} ${cls}`} style={{ borderColor: '#42A5F5' }} />
                ))}
                <div className="absolute left-1 right-1 h-0.5 rounded-full animate-bounce"
                  style={{ top: '50%', background: 'linear-gradient(90deg, transparent, #42A5F5, transparent)' }} />
              </div>
              <div className="absolute left-0 right-0 flex justify-center bottom-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#42A5F5' }}>
                  <Camera size={11} /> Scanning...
                </div>
              </div>
            </div>
          )}

          {status === 'found' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.75)' }}>
              <CheckCircle2 size={52} className="mb-2 text-emerald-400" />
              <p className="text-sm font-medium text-white">Scanned!</p>
              <p className="px-4 mt-1 font-mono text-xs text-center text-gray-300 break-all">{lastScanned}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6"
              style={{ background: 'rgba(0,0,0,0.85)' }}>
              <AlertCircle size={40} className="mb-3 text-red-400" />
              <p className="mb-1 text-sm font-medium text-center text-white">Camera Unavailable</p>
              <p className="text-xs text-center text-gray-400">{errorMsg}</p>
            </div>
          )}

          {status === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)' }}>
              <div className="text-center">
                <Camera size={36} className="mx-auto mb-2 text-blue-400 animate-pulse" />
                <p className="text-xs text-gray-300">Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera selector */}
        {cameras.length > 1 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b" style={{ borderColor: 'var(--border-color)' }}>
            {cameras.map((cam, i) => (
              <button key={cam.deviceId} onClick={() => handleCamSwitch(cam.deviceId)}
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={activeCam === cam.deviceId || (!activeCam && i === 0)
                  ? { background: '#1565C0', color: '#fff' }
                  : { background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                {cam.label || `Camera ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Manual input */}
        <div className="p-4">
          <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Or enter barcode / SKU manually:</p>
          <div className="flex gap-2">
            <input
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManual()}
              placeholder="Type barcode or SKU..."
              className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            <button onClick={handleManual}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
