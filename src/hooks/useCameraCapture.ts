import { useRef, useState } from 'react';

export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photoData, setPhotoData] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Erreur d'accès à la caméra. Veuillez autoriser la caméra dans votre navigateur.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, 150, 150);

    const compressed = canvas.toDataURL('image/jpeg', 0.6);
    setPhotoData(compressed);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  const retakePhoto = () => {
    setPhotoData('');
    startCamera();
  };

  return { videoRef, canvasRef, photoData, cameraActive, startCamera, capturePhoto, retakePhoto };
}
