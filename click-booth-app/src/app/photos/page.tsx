"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Camera,
  Grid,
  List,
  Eye,
  Download,
  Share,
  RefreshCw,
  X,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

type PhotoItem = {
  _id: string;
  url: string;
  thumbUrl?: string;
  publicId?: string;
  createdAt?: string;
};

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PhotoItem | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const limit = 24;

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(next = false) {
    try {
      setError(null);
      setLoading(true);
      const skip = next ? photos.length : 0;
      const res = await fetch(
        `/api/photos?mine=true&limit=${limit}&skip=${skip}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "Failed to load");
        throw new Error(txt || "Failed to load");
      }
      const j = await res.json();
      const list: PhotoItem[] = Array.isArray(j.photos) ? j.photos : [];
      setPhotos((p) => (next ? [...p, ...list] : list));
      setHasMore(list.length === limit);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPhoto = (url: string, filename?: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "photo.jpg";
    a.target = "_blank";
    a.click();
  };

  const shareToWhatsApp = (url: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Check out my photo: " + url)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900 flex items-center space-x-3">
                <Camera className="w-8 h-8 text-coral-600" />
                <span>My Photos</span>
              </h1>
              <p className="text-charcoal-600 mt-1">
                Your photo collection from ClickBooth sessions
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-cream-200 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === "grid"
                    ? "bg-white text-charcoal-800 shadow-md"
                    : "text-charcoal-600 hover:text-charcoal-800"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === "list"
                    ? "bg-white text-charcoal-800 shadow-md"
                    : "text-charcoal-600 hover:text-charcoal-800"
                }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading && photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-peach-200/50 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warmRed-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-charcoal-800 mb-2">
                Loading Photos...
              </h3>
              <p className="text-charcoal-600">
                Please wait while we fetch your memories
              </p>
            </div>
          </div>
        ) : !loading && photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-peach-200/50 max-w-md mx-auto">
              <Camera className="w-16 h-16 text-warmRed-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-charcoal-800 mb-4">
                No Photos Yet
              </h3>
              <p className="text-charcoal-600 mb-6">
                Start your first photo session to see your photos here
              </p>
              <a
                href="/booth"
                className="inline-flex items-center space-x-2 bg-warmRed-700 hover:bg-warmRed-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Camera className="w-5 h-5" />
                <span>Take Your First Photo</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Photo Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    onClick={() => setSelected(photo)}
                    className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-peach-200/50 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={photo.thumbUrl ?? photo.url}
                        alt="Photo thumbnail"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="bg-white/95 backdrop-blur-sm text-charcoal-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-charcoal-500 truncate">
                        {formatDate(photo.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-peach-200/50 p-6 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center space-x-6">
                      <div
                        onClick={() => setSelected(photo)}
                        className="flex-shrink-0 cursor-pointer group"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden relative">
                          <Image
                            src={photo.thumbUrl ?? photo.url}
                            alt="Photo thumbnail"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="96px"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal-600 mb-2">
                          {formatDate(photo.createdAt)}
                        </p>
                        <p className="text-xs text-charcoal-500 truncate">
                          ID: {photo._id}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            downloadPhoto(photo.url, `photo-${photo._id}.jpg`)
                          }
                          className="bg-gray-100 hover:bg-gray-200 text-charcoal-700 p-2 rounded-xl transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareToWhatsApp(photo.url)}
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-xl transition-colors duration-200"
                          title="Share to WhatsApp"
                        >
                          <Share className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelected(photo)}
                          className="bg-warmRed-100 hover:bg-warmRed-200 text-warmRed-700 p-2 rounded-xl transition-colors duration-200"
                          title="View Full Size"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => load(true)}
                disabled={loading || !hasMore}
                className="bg-warmRed-700 hover:bg-warmRed-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : hasMore ? (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Load More</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>All Loaded</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setPhotos([]);
                  setHasMore(true);
                  load(false);
                }}
                className="bg-charcoal-700 hover:bg-charcoal-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Photo Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-peach-200/50 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-charcoal-800">
                    Photo Details
                  </h3>
                  <p className="text-charcoal-600">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-charcoal-700 p-2 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Display */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-6">
                <Image
                  src={selected.url}
                  alt="Full size photo"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain max-h-[60vh]"
                  priority
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() =>
                    downloadPhoto(selected.url, `photo-${selected._id}.jpg`)
                  }
                  className="bg-charcoal-700 hover:bg-charcoal-800 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => shareToWhatsApp(selected.url)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Share className="w-5 h-5" />
                  <span>Share WhatsApp</span>
                </button>

                <button
                  onClick={() => window.open(selected.url, "_blank")}
                  className="bg-warmRed-600 hover:bg-warmRed-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Open Original</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
