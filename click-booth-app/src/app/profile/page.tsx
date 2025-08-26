"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Camera,
  Download,
  Share,
  Eye,
  Grid,
  List,
  Settings,
  LogOut,
  Edit,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getUserFromCookiesClient,
  getAuthTokenFromCookies,
} from "@/helpers/getUserFromCookiesClient";
import Footer from "@/components/Footer";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Photo {
  _id: string;
  url: string;
  thumbUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadProfile();
    loadPhotos();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = getUserFromCookiesClient();
      if (!userData) {
        throw new Error("Please login first");
      }

      const token = getAuthTokenFromCookies();
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();
      setUser(profileData);
      setEditName(profileData.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const userData = getUserFromCookiesClient();
      if (!userData) return;

      const token = getAuthTokenFromCookies();
      const response = await fetch(
        `/api/photos?limit=12&skip=0&userId=${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Failed to load photos:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadPhoto = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToWhatsApp = (url: string) => {
    const message = `Check out this photo from ClickBooth! ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleLogout = () => {
    document.cookie =
      "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const handleSaveProfile = async () => {
    try {
      const userData = getUserFromCookiesClient();
      if (!userData) return;

      const token = getAuthTokenFromCookies();
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, name: editName } : null));
        setIsEditing(false);
      }
    } catch {
      setError("Failed to update profile");
    }
  };

  if (loading && !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-amber-50 flex items-center justify-center"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-amber-200/50 max-w-lg mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-amber-200 border-t-red-500 rounded-full mx-auto mb-6"
          />
          <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center">
            Loading Profile...
          </h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-amber-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white border-b border-amber-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              👤 My Profile
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your account and view your photo memories
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span className="text-red-700 font-semibold text-lg">
                {error}
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/50 p-8 sticky top-8">
              {/* Profile Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  type: "spring",
                  damping: 15,
                }}
                className="text-center mb-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                  <User className="w-16 h-16 text-white" />
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-2xl font-bold text-center bg-amber-50 border border-amber-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="flex justify-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveProfile}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl transition-colors duration-200"
                      >
                        <Save className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditing(false);
                          setEditName(user?.name || "");
                        }}
                        className="bg-slate-500 hover:bg-slate-600 text-white p-2 rounded-xl transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-800">
                        {user?.name || "Guest User"}
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsEditing(true)}
                        className="bg-amber-100 hover:bg-amber-200 text-slate-700 p-2 rounded-xl transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-2xl">
                  <Mail className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Email</p>
                    <p className="text-slate-800 font-semibold">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-2xl">
                  <Calendar className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Member Since
                    </p>
                    <p className="text-slate-800 font-semibold">
                      {user?.createdAt
                        ? formatDate(user.createdAt)
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-2xl">
                  <Camera className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Total Photos
                    </p>
                    <p className="text-slate-800 font-semibold">
                      {photos.length} Photos
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Account Settings</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Photo History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/50 p-8">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    📸 Photo History
                  </h3>
                  <p className="text-slate-600">
                    Your captured memories from ClickBooth sessions
                  </p>
                </motion.div>

                {/* View Mode Toggle */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center space-x-2 bg-amber-100 rounded-2xl p-1 shadow-lg"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      viewMode === "grid"
                        ? "bg-white text-slate-800 shadow-lg"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Grid</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      viewMode === "list"
                        ? "bg-white text-slate-800 shadow-lg"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Photos Display */}
              {photos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center py-20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", damping: 15 }}
                    className="text-8xl mb-6"
                  >
                    📸
                  </motion.div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">
                    No Photos Yet
                  </h4>
                  <p className="text-slate-600 mb-6">
                    Visit our photo booth to capture your first moments!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/booth")}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Take Photos Now
                  </motion.button>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {photos.map((photo, index) => (
                    <motion.div
                      key={photo._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl shadow-lg border border-amber-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelected(photo)}
                        className="aspect-square relative cursor-pointer overflow-hidden"
                      >
                        <Image
                          src={photo.thumbUrl ?? photo.url}
                          alt="Photo"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                      </motion.div>

                      <div className="p-4">
                        <p className="text-sm text-slate-600 mb-3 font-medium">
                          {formatDate(photo.createdAt)}
                        </p>

                        <div className="flex items-center justify-between">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              downloadPhoto(photo.url, `photo-${photo._id}.jpg`)
                            }
                            className="bg-amber-100 hover:bg-amber-200 text-slate-700 p-2 rounded-xl transition-all duration-200"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => shareToWhatsApp(photo.url)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-xl transition-all duration-200"
                            title="Share to WhatsApp"
                          >
                            <Share className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelected(photo)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-xl transition-all duration-200"
                            title="View Full Size"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="space-y-4"
                >
                  {photos.map((photo, index) => (
                    <motion.div
                      key={photo._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-white rounded-2xl shadow-lg border border-amber-200/50 p-6 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center space-x-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelected(photo)}
                          className="flex-shrink-0 cursor-pointer group"
                        >
                          <div className="w-20 h-20 rounded-2xl overflow-hidden relative shadow-lg">
                            <Image
                              src={photo.thumbUrl ?? photo.url}
                              alt="Photo thumbnail"
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="80px"
                              loading="lazy"
                            />
                          </div>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-slate-700 mb-2">
                            📸 Photo Session
                          </p>
                          <p className="text-slate-600 mb-1">
                            {formatDate(photo.createdAt)}
                          </p>
                          <p className="text-sm text-slate-500 truncate font-mono">
                            ID: {photo._id}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              downloadPhoto(photo.url, `photo-${photo._id}.jpg`)
                            }
                            className="bg-amber-100 hover:bg-amber-200 text-slate-700 p-2 rounded-xl transition-all duration-200"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => shareToWhatsApp(photo.url)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-xl transition-all duration-200"
                            title="Share to WhatsApp"
                          >
                            <Share className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelected(photo)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-xl transition-all duration-200"
                            title="View Full Size"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8 text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/photos")}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View All Photos
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Photo Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-amber-200/50 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Photo Details
                  </h3>
                  <p className="text-slate-600">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelected(null)}
                  className="bg-amber-100 hover:bg-amber-200 text-slate-700 p-2 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Photo Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="relative bg-gray-100 rounded-2xl overflow-hidden mb-6"
              >
                <Image
                  src={selected.url}
                  alt="Full size photo"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain max-h-[60vh]"
                  priority
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex flex-wrap gap-3 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    downloadPhoto(selected.url, `photo-${selected._id}.jpg`)
                  }
                  className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareToWhatsApp(selected.url)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Share className="w-5 h-5" />
                  <span>Share WhatsApp</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </motion.div>
  );
}
