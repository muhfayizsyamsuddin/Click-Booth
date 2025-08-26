"use client";
import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [photoTaken, setPhotoTaken] = useState(false);
  const [runningCountdown, setRunningCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const [loggedIn, setLoggedIn] = useState(false);
  const [uploading, setUploading] = useState(false);

  // result state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setLoggedIn(Boolean(j?.authenticated));
          return;
        }
      } catch {
        /* ignore */
      }
      if (mounted) setLoggedIn(false);
    }
    checkSession();

    return () => {
      mounted = false;
      stopCamera();
      clearTimer();
    };
  }, []);

  async function startCamera() {
    try {
      if (streamRef.current) return;
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => {
          try {
            const vid = videoRef.current!;
            const canvas = canvasRef.current!;
            if (canvas && vid) {
              canvas.width = vid.videoWidth || 480;
              canvas.height = vid.videoHeight || 360;
            }
          } catch {
            /* ignore */
          }
        };
        try {
          await videoRef.current.play();
        } catch {
          /* ignore autoplay issues */
        }
      }
    } catch (e) {
      console.error("camera error", e);
      setMessage("Gagal akses kamera.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunningCountdown(false);
    setCountdown(3);
  }

  function startCountdown() {
    if (runningCountdown) return;
    setCountdown(3);
    setRunningCountdown(true);
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          takePhoto();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!canvas.width || !canvas.height) {
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoTaken(true);
    stopCamera();
  }

  function retakePhoto() {
    setPhotoTaken(false);
    setUploadedPhotoUrl(null);
    setMessage(null);
    setCountdown(3);
    startCamera();
  }

  function downloadPhoto() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/jpeg", 0.9);
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo.jpg";
    a.click();
  }

  async function ensureSession(): Promise<boolean> {
    if (loggedIn) return true;
    try {
      const r = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });
      if (!r.ok) return false;
      const j = await r.json();
      const ok = Boolean(j?.authenticated);
      setLoggedIn(ok);
      return ok;
    } catch {
      return false;
    }
  }

  // uploadPhoto: sendToWhatsapp=false => save only; true => save and ask server to send WA
  async function uploadPhoto(sendToWhatsapp = false) {
    const canvas = canvasRef.current;
    if (!canvas) {
      setMessage("No photo to upload");
      return null;
    }

    const ok = await ensureSession();
    if (!ok) {
      setMessage("Harus login untuk upload & share.");
      setLoggedIn(false);
      return null;
    }

    setUploading(true);
    setMessage(null);
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const res = await fetch("/api/photos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: dataUrl,
          sendToWhatsapp: Boolean(sendToWhatsapp),
        }),
      });

      if (res.status === 401) {
        setMessage("Harus login untuk upload & share.");
        setLoggedIn(false);
        setUploading(false);
        return null;
      }

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message ?? "Upload gagal");
        setUploading(false);
        return null;
      }

      setUploadedPhotoUrl(data.photo?.url ?? null);

      if (sendToWhatsapp) {
        setMessage(
          data?.waResult?.error
            ? `Upload sukses — WA gagal: ${data.waResult.error}`
            : "Upload berhasil — WA dikirim ke nomor kamu"
        );
      }

      return data;
    } catch (e) {
      console.error(e);
      setMessage("Upload error.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  // handle send WA: will call uploadPhoto(true) which uploads + triggers WA send on server
  async function handleSendWhatsApp() {
    const canvas = canvasRef.current;
    if (!canvas && !uploadedPhotoUrl) {
      setMessage("Tidak ada foto untuk dikirim.");
      return;
    }

    setMessage(null);
    setUploading(true);
    try {
      await uploadPhoto(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 shadow-sm">
        <div className="container py-4">
          <h1 className="text-heading-2 text-center text-slate-800">
            📸 ClickBooth Studio
          </h1>
          <p className="text-center text-body mt-1 text-slate-600">
            Professional Photo Booth Experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Camera/Photo Container */}
        <div className="card mb-8 overflow-hidden">
          {/* Status Bar */}
          <div className="bg-red-500 px-6 py-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    loggedIn ? "bg-green-400" : "bg-red-400"
                  } animate-pulse`}
                ></div>
                <span className="text-caption font-medium">
                  {loggedIn ? "Connected" : "Guest Mode"}
                </span>
              </div>
              <div className="text-caption font-medium">
                {!photoTaken ? "Camera Ready" : "Photo Captured"}
              </div>
            </div>
          </div>

          {/* Video/Canvas Area */}
          <div className="relative bg-slate-900 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${
                photoTaken ? "hidden" : "block"
              }`}
            />
            <canvas
              ref={canvasRef}
              aria-hidden={!photoTaken}
              className={`w-full h-full object-cover ${
                photoTaken ? "block" : "hidden"
              }`}
            />

            {/* Countdown Overlay */}
            {!photoTaken && runningCountdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-red-500 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <span className="text-white text-6xl font-bold drop-shadow-lg">
                    {countdown}
                  </span>
                </div>
              </div>
            )}

            {/* Camera Controls Overlay */}
            {!photoTaken && !runningCountdown && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={startCamera}
                    className="bg-amber-100 text-slate-800 px-6 py-3 rounded-lg font-medium hover:bg-amber-200 transition-colors shadow-lg border border-amber-200"
                  >
                    🎥 Start Camera
                  </button>
                  <button
                    onClick={startCountdown}
                    disabled={runningCountdown}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    📸 Capture Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {photoTaken && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={downloadPhoto}
              className="bg-amber-100 text-slate-800 px-6 py-3 rounded-lg font-medium hover:bg-amber-200 transition-colors shadow-lg border border-amber-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                💾
              </span>
              <span>Download</span>
            </button>

            <button
              onClick={() => uploadPhoto(false)}
              disabled={uploading}
              className={`${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center space-x-2 group`}
              title={
                !loggedIn
                  ? "Login required for upload"
                  : "Save photo to gallery"
              }
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                ☁️
              </span>
              <span>{uploading ? "Uploading..." : "Save to Cloud"}</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              disabled={uploading}
              className={`${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center space-x-2 group`}
              title="Send to WhatsApp number in profile"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📱
              </span>
              <span>{uploading ? "Sending..." : "Send WhatsApp"}</span>
            </button>

            <button
              onClick={retakePhoto}
              className="bg-amber-100 text-slate-800 px-6 py-3 rounded-lg font-medium hover:bg-amber-200 transition-colors shadow-lg border border-amber-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                🔄
              </span>
              <span>Retake</span>
            </button>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-body font-medium text-blue-800">{message}</p>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {uploadedPhotoUrl && (
          <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-8 text-center mb-8">
            <h3 className="text-heading-3 mb-4 text-slate-800">
              📱 Quick Access
            </h3>
            <p className="text-body mb-6 text-slate-600">
              Scan QR code to view your photo on any device
            </p>

            <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border border-amber-200 mb-6">
              <QRCodeCanvas value={uploadedPhotoUrl} size={200} level="M" />
            </div>

            <div>
              <a
                href={uploadedPhotoUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg inline-flex items-center space-x-2"
              >
                <span>🔗</span>
                <span>Open Photo</span>
              </a>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        {!photoTaken && !runningCountdown && (
          <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-8">
            <h3 className="text-heading-3 mb-6 text-center text-slate-800">
              🎯 How to Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  1
                </div>
                <h4 className="text-heading-5 mb-2 text-slate-800">
                  Start Camera
                </h4>
                <p className="text-body-small text-slate-600">
                  Click &ldquo;Start Camera&rdquo; to begin your photo session
                </p>
              </div>
              <div className="text-center">
                <div className="bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  2
                </div>
                <h4 className="text-heading-5 mb-2 text-slate-800">
                  Capture Photo
                </h4>
                <p className="text-body-small text-slate-600">
                  Click &ldquo;Capture Photo&rdquo; and get ready for the
                  countdown
                </p>
              </div>
              <div className="text-center">
                <div className="bg-slate-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  3
                </div>
                <h4 className="text-heading-5 mb-2 text-slate-800">
                  Save & Share
                </h4>
                <p className="text-body-small text-slate-600">
                  Download, upload to cloud, or send via WhatsApp
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
