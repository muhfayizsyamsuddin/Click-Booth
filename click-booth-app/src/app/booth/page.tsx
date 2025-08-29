"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Filter,
  Play,
  RotateCcw,
  Edit3,
  Zap,
  Sparkles,
  BookOpen,
  ChevronDown,
  Loader2,
  AlertCircle
} from "lucide-react";

const AVAILABLE_FILTERS: { id: string; label: string; css: string }[] = [
  { id: "none", label: "None", css: "none" },
  { id: "grayscale", label: "Grayscale", css: "grayscale(100%)" },
  { id: "sepia", label: "Sepia", css: "sepia(80%)" },
  { id: "bright", label: "Bright", css: "brightness(1.12)" }
];

const LAYOUTS = [
  { id: "single", label: "Single Photo", cols: 1, poses: 1 },
  { id: "double-vertical", label: "Double Vertical", cols: 1, poses: 2 },
  { id: "double-horizontal", label: "Double Horizontal", cols: 2, poses: 2 },
  { id: "triple-vertical", label: "Creative Collage", cols: 1, poses: 3 },
  { id: "quad-vertical", label: "Quad Vertical", cols: 1, poses: 4 },
  { id: "quad-horizontal", label: "Quad Horizontal", cols: 2, poses: 4 }
];

export default function BoothPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [runningCountdown, setRunningCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [shotsCount, setShotsCount] = useState<number>(LAYOUTS[0].poses);
  const [selectedLayout, setSelectedLayout] = useState<string>(LAYOUTS[0].id);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  const [capturedDataUrls, setCapturedDataUrls] = useState<string[]>([]);
  const [previewCaptured, setPreviewCaptured] = useState<string | null>(null);
  const [finalComposed, setFinalComposed] = useState(false);
  const [savedPhotoId, setSavedPhotoId] = useState<string | null>(null);

  // This useEffect is no longer needed since we get shots directly from sessionStorage
  // useEffect(() => {
  //   const l = LAYOUTS.find((x) => x.id === selectedLayout);
  //   setShotsCount(l?.poses ?? 1);
  // }, [selectedLayout]);

  useEffect(() => {
    if (!previewCaptured) return;
    const c = canvasRef.current;
    if (!c) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewCaptured;
    img.onload = () => {
      c.width = img.naturalWidth || (videoRef.current?.videoWidth ?? 480);
      c.height = img.naturalHeight || (videoRef.current?.videoHeight ?? 360);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
    };
    img.onerror = () => setPreviewCaptured(null);
  }, [previewCaptured]);

  useEffect(() => {
    let mounted = true;

    // Check if layout is selected from layout-selection page
    const savedLayout = sessionStorage.getItem("selectedLayout");
    if (!savedLayout) {
      // No layout selected, redirect to layout selection
      router.push("/layout-selection");
      return;
    }

    try {
      const layoutData = JSON.parse(savedLayout);
      setSelectedLayout(layoutData.id || "single");

      // Use shots directly from saved layout data
      const correctShotsCount = layoutData.shots || 1;
      setShotsCount(correctShotsCount);

      console.log("Layout loaded:", {
        layoutId: layoutData.id,
        savedShots: layoutData.shots,
        finalShotsCount: correctShotsCount
      });
    } catch (e) {
      console.warn("Failed to load saved layout:", e);
      router.push("/layout-selection");
      return;
    }

    async function checkSession() {
      // Optional: still check session for other purposes if needed
      try {
        await fetch("/api/me", {
          method: "GET",
          credentials: "include"
        });
        if (!mounted) return;
        // Just continue without setting state
      } catch {
        /* ignore */
      }
    }
    checkSession(); // Start camera after layout is confirmed
    startCamera();

    return () => {
      mounted = false;
      stopCamera();
      clearTimer();
    };
  }, [router]);

  async function startCamera() {
    setIsLoading(true);
    setCameraError(null);
    try {
      if (streamRef.current) {
        if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        try {
          await videoRef.current?.play();
        } catch {}
        setIsLoading(false);
        return;
      }

      // Enhanced camera constraints for better performance
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
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
            setIsLoading(false);
          } catch {}
        };
        try {
          await videoRef.current.play();
        } catch {}
      }
    } catch (e) {
      console.error("camera error", e);
      setCameraError("Failed to access camera. Please check permissions.");
      setIsLoading(false);
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

  // Keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Space bar to capture
      if (
        e.code === "Space" &&
        !runningCountdown &&
        !finalComposed &&
        !previewCaptured &&
        !isCapturing
      ) {
        e.preventDefault();
        startCountdown();
      }
      // Escape to cancel/retake
      if (e.code === "Escape") {
        e.preventDefault();
        if (runningCountdown) {
          clearTimer();
        } else if (previewCaptured && !finalComposed) {
          retakeCurrentShot();
        } else if (finalComposed) {
          retakeAllPhotos();
        }
      }
      // Enter to proceed
      if (e.code === "Enter") {
        e.preventDefault();
        if (previewCaptured && !finalComposed && capturedDataUrls.length >= shotsCount) {
          composeFinal().catch((e) => console.warn(e));
        } else if (finalComposed) {
          goToEditPhotos();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningCountdown, finalComposed, previewCaptured, capturedDataUrls.length, shotsCount]);

  function startCountdown() {
    if (runningCountdown || isCapturing || finalComposed) return;
    setCountdown(3);
    setRunningCountdown(true);
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          takePhotoOnce();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function ensureFreshFrame(): Promise<void> {
    await new Promise<void>((res) => {
      let done = false;
      const safeTimeout = window.setTimeout(() => {
        if (!done) {
          done = true;
          res();
        }
      }, 800); // Increased timeout for better frame refresh
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Additional frame wait
            if (!done) {
              done = true;
              clearTimeout(safeTimeout);
              res();
            }
          });
        });
      });
    });
  }

  async function captureOnceFromVideo(): Promise<string | null> {
    const vid = videoRef.current;
    if (!vid) return null;
    const w = vid.videoWidth || 480;
    const h = vid.videoHeight || 360;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    const filterCss = AVAILABLE_FILTERS.find((f) => f.id === selectedFilter)?.css ?? "none";
    (ctx as CanvasRenderingContext2D).filter = filterCss;
    ctx.drawImage(vid, 0, 0, w, h);
    return off.toDataURL("image/jpeg", 0.92);
  }

  async function takePhotoOnce() {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      await ensureFreshFrame();

      let dataUrl = await captureOnceFromVideo();
      if (!dataUrl) return;

      // retry a few times if identical to last saved (avoid duplicated identical captures)
      let tries = 0;
      while (tries < 4) {
        const last = capturedDataUrls[capturedDataUrls.length - 1] ?? null;
        if (!last || dataUrl !== last) {
          console.log("Photo accepted after", tries, "tries");
          break;
        }
        console.warn("Duplicate photo detected, retrying...", tries + 1);
        await new Promise((r) => setTimeout(r, 300));
        await ensureFreshFrame();
        dataUrl = await captureOnceFromVideo();
        if (!dataUrl) return;
        tries++;
      }

      if (tries >= 4) {
        console.warn("Could not get unique photo after 4 tries, using current capture");
      }

      // Check again for duplicate to prevent race conditions
      const currentCaptured = capturedDataUrls;
      const lastPhoto = currentCaptured[currentCaptured.length - 1] ?? null;
      if (lastPhoto === dataUrl) {
        console.warn("Skipping duplicate photo capture - race condition detected");
        return;
      }

      // Update captured photos state
      const newCapturedPhotos = [...currentCaptured, dataUrl];
      setCapturedDataUrls(newCapturedPhotos);

      console.log("Photo captured:", {
        photoNumber: newCapturedPhotos.length,
        totalExpected: shotsCount,
        photoPreview: dataUrl.substring(0, 50) + "...",
        isUnique: !currentCaptured.includes(dataUrl),
        willTriggerCompose: newCapturedPhotos.length >= shotsCount
      });

      setPreviewCaptured(dataUrl);
      setFinalComposed(false);

      // Handle next action based on photo count
      if (newCapturedPhotos.length >= shotsCount) {
        // All photos taken, compose final image
        setTimeout(() => {
          composeFinal(newCapturedPhotos).catch((e) => console.warn(e));
        }, 1000);
      } else {
        // More photos needed, restart camera after delay
        setTimeout(() => {
          startCamera();
        }, 1000);
      }
    } finally {
      setIsCapturing(false);
    }
  }

  async function composeFinal(imgsOverride?: string[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent multiple calls to composeFinal
    if (finalComposed) {
      console.log("composeFinal already called, skipping");
      return;
    }

    const imgs = (imgsOverride ?? capturedDataUrls).slice(0, shotsCount);
    console.log("composeFinal called with:", {
      imageCount: imgs.length,
      expectedShots: shotsCount,
      selectedLayout: selectedLayout,
      imageSources: imgs.map((img, i) => `${i}: ${img.substring(0, 50)}...`)
    });

    if (imgs.length === 0) return;

    const loadImgs = imgs.map((d) => {
      const img = new Image();
      img.src = d;
      return new Promise<HTMLImageElement>((res) => {
        img.onload = () => res(img);
        img.onerror = () => res(img);
      });
    });
    const loaded = await Promise.all(loadImgs);
    const layout = LAYOUTS.find((l) => l.id === selectedLayout) ?? LAYOUTS[0];
    const cols = layout.cols || 1;
    const rows = Math.ceil(loaded.length / cols);
    const w = loaded[0].naturalWidth;
    const h = loaded[0].naturalHeight;
    canvas.width = w * cols;
    canvas.height = h * rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < loaded.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.drawImage(loaded[i], col * w, row * h, w, h);
    }
    setFinalComposed(true);
    setPreviewCaptured(null);
    stopCamera();

    // Auto-save photo to database for compose functionality
    // await autoSavePhoto(canvas, imgs);

    // Save data to sessionStorage but don't auto-redirect
    try {
      const finalImage = canvas.toDataURL();
      const imagesToSave = (imgsOverride ?? capturedDataUrls).slice(0, shotsCount);
      const payload = {
        images: imagesToSave, // Use original data URLs
        layout: selectedLayout,
        filter: selectedFilter,
        shots: shotsCount,
        finalImage: finalImage
      };

      console.log("Saving to sessionStorage:", {
        imageCount: imagesToSave.length,
        expectedShots: shotsCount,
        layout: selectedLayout,
        imagePreviews: imagesToSave.map((img, i) => `${i}: ${img.substring(0, 50)}...`)
      });

      sessionStorage.setItem("composePayload", JSON.stringify(payload));
    } catch (e) {
      console.warn("failed to save compose payload", e);
    }
  }

  // Auto-save photo to database for compose functionality
  async function autoSavePhoto(canvas: HTMLCanvasElement, imagesArray?: string[]) {
    // Prevent double uploads
    if (savedPhotoId) {
      console.log("Photo already saved, skipping duplicate upload");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      // Use provided images array or fallback to capturedDataUrls
      const imagesToSave = imagesArray || capturedDataUrls.slice(0, shotsCount);

      console.log("Auto-saving photo with data:", {
        totalCaptured: capturedDataUrls.length,
        expectedShots: shotsCount,
        imagesToSave: imagesToSave.length,
        layout: selectedLayout,
        usingProvidedArray: !!imagesArray
      });

      const body = {
        imageData: dataUrl,
        sendToWhatsapp: false,
        filter: selectedFilter,
        shots: shotsCount,
        layout: selectedLayout,
        // Include individual images for better compose support
        images: imagesToSave,
        // Flag to skip Cloudinary upload for booth photos
        skipCloudinaryUpload: true
      };

      const res = await fetch("/api/photos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.photo?._id) {
          setSavedPhotoId(data.photo._id);
          console.log("Photo auto-saved with ID:", data.photo._id);
        }
      }
    } catch (e) {
      console.warn("Auto-save failed:", e);
    }
  }

  function retakeCurrentShot() {
    const currentCaptured = [...capturedDataUrls];
    currentCaptured.pop(); // Remove last photo
    setCapturedDataUrls(currentCaptured);
    setPreviewCaptured(null);
    setFinalComposed(false);
    startCamera();
  }

  function retakeAllPhotos() {
    setCapturedDataUrls([]);
    setPreviewCaptured(null);
    setFinalComposed(false);
    startCamera();
  }

  function goToEditPhotos() {
    if (savedPhotoId) {
      // Navigate with photo ID for DB-based compose
      router.push(`/compose?photoId=${savedPhotoId}`);
    } else {
      // Fallback to sessionStorage-based compose
      router.push("/compose");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden"
    >
      {/* Main Camera Section */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 h-full">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-4 md:mb-6 mt-6 md:mt-12 flex-shrink-0"
          >
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-[1.1]"
            >
              Photo Booth Session
            </motion.h1>

            {/* Layout Info */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="inline-flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-3 bg-white rounded-2xl shadow-lg border border-slate-200/50"
            >
              <Camera className="w-4 md:w-5 h-4 md:h-5 text-slate-600" />
              <div className="text-sm text-slate-600">Layout:</div>
              <div className="font-bold text-slate-900">
                {LAYOUTS.find((l) => l.id === selectedLayout)?.label}
              </div>
              <div className="w-1 h-1 bg-slate-400 rounded-full hidden md:block"></div>
              <div className="text-sm text-slate-600">
                {shotsCount} {shotsCount === 1 ? "Photo" : "Photos"}
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content - Grid Layout dengan Sidebar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 flex-1 min-h-0"
          >
            {/* Camera Section - Takes 3 columns */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="lg:col-span-3 flex flex-col order-2 lg:order-1"
            >
              {/* Camera Container */}
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden flex-1 flex flex-col">
                {/* Camera Status Bar */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 md:px-6 py-3 flex-shrink-0">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                        <span className="font-bold text-sm tracking-wide">CAMERA READY</span>
                      </div>
                      {capturedDataUrls.length > 0 && (
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                          <span className="text-xs font-bold">
                            {capturedDataUrls.length}/{shotsCount} CAPTURED
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>{!finalComposed ? "PHOTO BOOTH" : "COMPLETE"}</span>
                    </div>
                  </div>
                </div>

                {/* Camera Display */}
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-4 flex-1 flex items-center justify-center">
                  <div
                    className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-300 w-full max-h-full"
                    style={{ aspectRatio: "16/10" }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      aria-label="Camera feed for photo booth"
                      style={{
                        display:
                          finalComposed || previewCaptured || isLoading || cameraError
                            ? "none"
                            : "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter:
                          AVAILABLE_FILTERS.find((f) => f.id === selectedFilter)?.css ?? "none"
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      aria-hidden={!finalComposed && !previewCaptured}
                      style={{
                        display: finalComposed || previewCaptured ? "block" : "none",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        backgroundColor: "#000"
                      }}
                    />

                    {/* Loading State */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/80"
                      >
                        <div className="text-center text-white">
                          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                          <p className="text-lg font-medium">Initializing Camera...</p>
                          <p className="text-sm text-white/80 mt-2">Please allow camera access</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Error State */}
                    {cameraError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/80"
                      >
                        <div className="text-center text-white max-w-md mx-auto p-6">
                          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                          <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
                          <p className="text-white/80 mb-6">{cameraError}</p>
                          <button
                            onClick={startCamera}
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Try Again
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Countdown Overlay */}
                    {!previewCaptured &&
                      !finalComposed &&
                      !isLoading &&
                      !cameraError &&
                      runningCountdown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="bg-gradient-to-br from-red-600 to-red-500 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-pulse">
                            <span className="text-white text-3xl font-black">{countdown}</span>
                          </div>
                        </div>
                      )}

                    {/* Camera Controls */}
                    {!previewCaptured &&
                      !finalComposed &&
                      !isLoading &&
                      !cameraError &&
                      !runningCountdown && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startCamera}
                                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-500 flex items-center gap-2"
                                aria-label="Start camera"
                              >
                                <Play className="w-4 h-4" />
                                Start Camera
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startCountdown}
                                disabled={runningCountdown || isCapturing || finalComposed}
                                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-red-400 flex items-center gap-2"
                                aria-label="Take photo (Space key)"
                              >
                                <Camera className="w-4 h-4" />
                                CAPTURE
                              </motion.button>
                            </div>
                            {/* Keyboard Hints */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.5, duration: 0.5 }}
                              className="text-center"
                            >
                              <p className="text-xs text-white/80 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                Press <kbd className="bg-white/20 px-1 rounded">Space</kbd> to
                                capture • <kbd className="bg-white/20 px-1 rounded">Esc</kbd> to
                                cancel
                              </p>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar - Takes 1 column */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="lg:col-span-1 space-y-4 flex flex-col order-1 lg:order-2"
            >
              {/* Camera Filter Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 flex-shrink-0">
                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Camera Filter</span>
                  </h3>
                  <div className="relative">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm font-medium bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      {AVAILABLE_FILTERS.map((f) => (
                        <option key={f.id} value={f.id} className="bg-white text-slate-900 py-2">
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Guide Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 flex-1">
                <h3 className="text-base font-bold mb-4 text-center text-slate-900 flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Quick Guide</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-gradient-to-br from-red-600 to-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-sm">Setup</h4>
                      <p className="text-xs text-slate-600">
                        Choose your filter and start the camera
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-gradient-to-br from-amber-600 to-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-sm">Capture</h4>
                      <p className="text-xs text-slate-600">Take photos with 3-second countdown</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-gradient-to-br from-green-600 to-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-sm">Edit</h4>
                      <p className="text-xs text-slate-600">Go to editor for advanced options</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              {(previewCaptured || finalComposed) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 flex-shrink-0"
                >
                  <h3 className="text-base font-bold mb-4 text-center text-slate-900 flex items-center justify-center gap-2">
                    {previewCaptured && !finalComposed ? (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Photo Actions</span>
                      </>
                    ) : finalComposed ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Session Complete</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Session Actions</span>
                      </>
                    )}
                  </h3>

                  <div className="space-y-3">
                    {previewCaptured && !finalComposed && (
                      <>
                        <motion.button
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={retakeCurrentShot}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-amber-400 flex items-center gap-2 justify-center"
                          aria-label="Retake current photo"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retake This Photo
                        </motion.button>

                        {capturedDataUrls.length < shotsCount ? (
                          <motion.button
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (isCapturing || runningCountdown) return;
                              setPreviewCaptured(null);
                              setFinalComposed(false);
                              startCamera();
                            }}
                            disabled={isCapturing || runningCountdown}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-red-400 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Continue to next photo"
                          >
                            <Zap className="w-4 h-4" />
                            Continue ({capturedDataUrls.length}/{shotsCount})
                          </motion.button>
                        ) : (
                          <motion.button
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => composeFinal().catch((e) => console.warn(e))}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-green-400 flex items-center gap-2 justify-center"
                            aria-label="Complete photo session"
                          >
                            <Sparkles className="w-4 h-4" />
                            Complete Session
                          </motion.button>
                        )}
                      </>
                    )}

                    {finalComposed && (
                      <>
                        <motion.button
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={retakeAllPhotos}
                          className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-500 flex items-center gap-2 justify-center"
                          aria-label="Retake all photos"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retake All Photos
                        </motion.button>

                        <motion.button
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 1.0, duration: 0.5 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={goToEditPhotos}
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-red-400 flex items-center gap-2 justify-center"
                          aria-label="Edit photos"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Photos
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
