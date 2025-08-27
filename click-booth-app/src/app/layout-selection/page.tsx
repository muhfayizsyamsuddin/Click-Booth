"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ImageIcon,
  ImagePlay,
  ImagePlayIcon,
  ImageUpscale,
  LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const layouts = [
  {
    id: "single",
    name: "Single Photo",
    shots: 1,
    description: "Perfect for portraits and selfies",
    icon: Camera,
    preview: "/frames/single-preview.png",
  },
  {
    id: "double-vertical",
    name: "Double Vertical",
    shots: 2,
    description: "Two photos stacked vertically",
    icon: Camera,
    preview: "/frames/double-vertical-preview.png",
  },
  {
    id: "double-horizontal",
    name: "Double Horizontal",
    shots: 2,
    description: "Two photos side by side",
    icon: ImageIcon,
    preview: "/frames/double-horizontal-preview.png",
  },
  {
    id: "triple-vertical",
    name: "Creative Collage",
    shots: 3,
    description: "Three photos arranged artistically",
    icon: ImagePlay,
    preview: "/frames/collage-preview.png",
  },
  {
    id: "quad-vertical",
    name: "Quad Vertical",
    shots: 4,
    description: "Four photos stacked vertically",
    icon: ImagePlayIcon,
    preview: "/frames/quad-preview.png",
  },
  {
    id: "quad-horizontal",
    name: "Quad Horizontal",
    shots: 4,
    description: "Four photos arranged horizontally",
    icon: ImageUpscale,
    preview: "/frames/quad-horizontal-preview.png",
  },
];

export default function LayoutSelectionPage() {
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayout(layoutId);
  };

  const handleStartSession = () => {
    if (!selectedLayout) {
      alert("Please select a layout first!");
      return;
    }

    setIsAnimating(true);

    // Save layout selection to sessionStorage
    const selectedLayoutData = layouts.find((l) => l.id === selectedLayout);
    if (selectedLayoutData) {
      sessionStorage.setItem(
        "selectedLayout",
        JSON.stringify({
          id: selectedLayoutData.id,
          shots: selectedLayoutData.shots,
          name: selectedLayoutData.name,
        })
      );
    }

    // Delay navigation for smooth animation
    setTimeout(() => {
      router.push("/booth");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                Step 1 of 2
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-[1.1]">
              Choose Your Perfect Layout
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Select the ideal photo layout for your session. Each option is
              designed to capture your memories in a unique and beautiful way.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-6 mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                1
              </div>
              <span className="text-red-600 font-semibold text-lg">
                Choose Layout
              </span>
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-slate-300 rounded-full"></div>
            <div className="flex items-center space-x-3 opacity-50">
              <div className="w-10 h-10 bg-slate-300 text-slate-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-slate-500 font-semibold text-lg">
                Photo Booth
              </span>
            </div>
          </div>
        </div>

        {/* Layout Selection Grid */}
        <div className="relative">
          <LayoutHoverEffect
            layouts={layouts}
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
          />
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              ← Back to Home
            </button> */}

            <button
              onClick={handleStartSession}
              disabled={!selectedLayout || isAnimating}
              className={`inline-flex items-center gap-3 px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl transform cursor-pointer ${
                selectedLayout && !isAnimating
                  ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-2xl hover:shadow-red-500/40 hover:-translate-y-0.5"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              } ${isAnimating ? "animate-pulse" : ""}`}
            >
              <Camera className="w-5 h-5" />
              {isAnimating ? "Starting Session..." : "Start Photo Session"}
            </button>
          </div>

          {selectedLayout && (
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl border border-red-200/50 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4">
                {(() => {
                  const Icon = layouts.find(
                    (l) => l.id === selectedLayout
                  )?.icon;
                  return Icon ? (
                    <Icon className="w-8 h-8 text-red-500" />
                  ) : null;
                })()}
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-lg">
                    {layouts.find((l) => l.id === selectedLayout)?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {layouts.find((l) => l.id === selectedLayout)?.shots} photos
                    will be taken
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom LayoutHoverEffect Component
const LayoutHoverEffect = ({
  layouts,
  selectedLayout,
  onLayoutSelect,
}: {
  layouts: Array<{
    id: string;
    name: string;
    shots: number;
    description: string;
    icon: LucideIcon;
    preview: string;
  }>;
  selectedLayout: string;
  onLayoutSelect: (layoutId: string) => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {layouts.map((layout, idx: number) => (
        <div
          key={layout.id}
          onClick={() => onLayoutSelect(layout.id)}
          className="relative group cursor-pointer block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-black/90 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>

          {/* Selection Indicator */}
          {selectedLayout === layout.id && (
            <div className="absolute -top-2 -right-2 z-30 w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
              ✓
            </div>
          )}

          {/* Layout Card */}
          <div
            className={cn(
              "rounded-2xl h-full w-full overflow-hidden bg-white border border-transparent group-hover:border-slate-400 relative z-20 shadow-xl transition-all duration-300",
              selectedLayout === layout.id
                ? "border-red-500/50 ring-4 ring-red-500 ring-offset-4 ring-offset-white"
                : ""
            )}
          >
            <div className="relative z-50">
              {/* Preview Area */}
              <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                <layout.icon className="w-16 h-16 text-slate-400 group-hover:text-red-500 transition-colors duration-300" />
                {/* Layout Preview Pattern */}
                <div className="absolute inset-4 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center group-hover:border-red-400 transition-colors duration-300">
                  <div
                    className={`grid gap-1 w-full h-full p-2 ${
                      layout.id === "single"
                        ? "grid-cols-1"
                        : layout.id === "double-vertical"
                        ? "grid-cols-1 grid-rows-2"
                        : layout.id === "double-horizontal"
                        ? "grid-cols-2 grid-rows-1"
                        : layout.id === "triple-vertical"
                        ? "grid-cols-1 grid-rows-3"
                        : layout.id === "quad-vertical"
                        ? "grid-cols-1 grid-rows-4"
                        : layout.id === "quad-horizontal"
                        ? "grid-cols-4 grid-rows-1"
                        : "grid-cols-2"
                    }`}
                  >
                    {Array.from({ length: layout.shots }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded border border-slate-300 min-h-4 group-hover:border-red-300 group-hover:bg-red-50 transition-all duration-300"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Info */}
              <div className="p-6">
                <h3 className="text-slate-900 font-bold tracking-wide mt-4 text-xl mb-2 group-hover:text-slate-700 transition-colors duration-300">
                  {layout.name}
                </h3>
                <p className="mt-8 text-slate-600 tracking-wide leading-relaxed text-sm mb-4 group-hover:text-slate-700 transition-colors duration-300">
                  {layout.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-red-100 transition-colors duration-300">
                    {layout.shots} {layout.shots === 1 ? "Photo" : "Photos"}
                  </span>
                  <layout.icon className="w-6 h-6 text-slate-600 group-hover:text-slate-100 transition-colors duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
