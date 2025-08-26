"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Camera,
  CreditCard,
  LogIn,
  UserPlus,
  Gem,
  User,
  Menu,
  X,
  Bell,
  Settings,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Booth", href: "/booth", icon: Camera },
    { name: "Payment", href: "/payment", icon: CreditCard },
    { name: "Photos", href: "/photos", icon: Gem },
    { name: "Login", href: "/login", icon: LogIn },
    { name: "Register", href: "/register", icon: UserPlus },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-amber-50/90 backdrop-blur-xl border-b border-amber-200/50 shadow-xl"
          : "bg-amber-50/95 backdrop-blur-md border-b border-amber-100/50 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-amber-50 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-200">
                  <Image
                    src="/logo.png"
                    alt="ClickBooth Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </motion.div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-800 group-hover:text-red-600 transition-all duration-300">
                  ClickBooth
                </h1>
                <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
                  Professional Studio
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center space-x-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 group overflow-hidden ${
                    isActive(item.href)
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "text-slate-700 hover:bg-amber-100 hover:text-red-600"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isActive(item.href) ? "" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-red-500 rounded-2xl -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  {!isActive(item.href) && (
                    <motion.div className="absolute inset-0 bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Token Display */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 px-4 py-2.5 bg-amber-100 border border-amber-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-2.5 h-2.5 bg-red-500 rounded-full"
              />
              <Gem className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-slate-800">0</span>
              <span className="text-xs text-slate-600 font-medium">tokens</span>
            </motion.div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
            >
              <Bell className="w-5 h-5" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* Profile Button */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-amber-50/95 backdrop-blur-xl border-t border-amber-200/50 shadow-2xl"
          >
            <div className="px-6 py-8 space-y-6">
              {/* Mobile Logo for smaller screens */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sm:hidden flex items-center space-x-3 pb-6 border-b border-amber-200/50"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl shadow-md overflow-hidden border border-amber-200">
                  <Image
                    src="/logo.png"
                    alt="ClickBooth Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    ClickBooth
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
                    Professional Studio
                  </p>
                </div>
              </motion.div>

              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                        isActive(item.href)
                          ? "bg-red-500 text-white shadow-lg"
                          : "text-slate-700 hover:bg-amber-100 hover:text-red-600"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-lg">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile User Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="pt-6 mt-6 border-t border-amber-200/50 space-y-6"
              >
                {/* Token Display */}
                <div className="flex items-center justify-between px-5 py-4 bg-amber-100 border border-amber-300 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    />
                    <Gem className="w-5 h-5 text-red-600" />
                    <span className="text-lg font-bold text-slate-800">
                      0 tokens
                    </span>
                  </div>
                  <Bell className="w-6 h-6 text-slate-600" />
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center space-x-3 px-5 py-4 bg-amber-100 hover:bg-amber-200 text-slate-700 rounded-2xl font-semibold transition-all duration-300"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </motion.button>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center space-x-3 px-5 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
