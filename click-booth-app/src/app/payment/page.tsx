"use client";

import { TOKEN_PACKAGES } from "@/helpers/tokenPackage";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(100000);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("basic");

  const packages = (
    Object.entries(TOKEN_PACKAGES) as [
      keyof typeof TOKEN_PACKAGES,
      { price: number; tokens: number }
    ][]
  ).map(([id, data]) => {
    return {
      id,
      name:
        id === "basic"
          ? "Basic Pack"
          : id === "pro"
          ? "Pro Pack"
          : "Premium Pack",
      tokens: data.tokens,
      price: data.price,
      description:
        id === "basic"
          ? "10 tokens for basic photo editing features"
          : id === "pro"
          ? "30 tokens with advanced filters and effects"
          : "50 tokens with premium templates and unlimited downloads",
      popular: id === "pro", // contoh: jadikan Pro sebagai popular
      color:
        id === "basic" ? "slate-600" : id === "pro" ? "red-500" : "amber-500",
    };
  });

  useEffect(() => {
    if (!document.querySelector("script[data-midtrans-snap]")) {
      const s = document.createElement("script");
      s.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      s.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
      );
      s.setAttribute("data-midtrans-snap", "1");
      document.body.appendChild(s);
    }
  }, []);

  const handlePackageSelect = (pkg: (typeof packages)[0]) => {
    setSelectedPackage(pkg.id);
    setAmount(pkg.price);
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const selectedPkg = packages.find((p) => p.id === selectedPackage);
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: selectedPackage,
          itemName: selectedPkg?.name || "Token Package",
          itemId: selectedPackage,
        }),
      });

      const data = await res.json();
      if (!data?.token) throw new Error(data?.error || "Token not received");

      if (!window.snap) {
        alert("Midtrans snap belum terload");
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: (result: unknown) => {
          console.log("Payment success", result);
          // You can redirect to success page or show success message
          alert("Payment successful! Tokens will be added to your account.");
        },
        onPending: (result: unknown) => {
          console.log("Payment pending", result);
          alert("Payment is being processed. Please wait for confirmation.");
        },
        onError: (result: unknown) => {
          console.error("Payment error", result);
          alert("Payment failed. Please try again.");
        },
        onClose: () => {
          console.log("Payment popup closed");
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

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
        <div className="container py-6">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-center text-slate-800"
          >
            Token Packages
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-lg mt-2 text-slate-600"
          >
            Choose your perfect package and unlock premium features
          </motion.p>
        </div>
      </motion.div>

      <div className="container py-12">
        {/* Package Selection */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePackageSelect(pkg)}
              className={`relative bg-white rounded-2xl shadow-xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedPackage === pkg.id
                  ? "border-red-500 ring-4 ring-red-500/20 shadow-2xl"
                  : "border-amber-200 hover:border-red-300 hover:shadow-2xl"
              }`}
            >
              {pkg.popular && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    🔥 Most Popular
                  </span>
                </motion.div>
              )}

              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className={`w-20 h-20 rounded-3xl bg-${pkg.color} flex items-center justify-center mb-6 mx-auto shadow-lg`}
                >
                  <span className="text-2xl font-bold text-white">
                    {pkg.tokens}
                  </span>
                </motion.div>

                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="text-2xl font-bold mb-3 text-slate-800"
                >
                  {pkg.name}
                </motion.h3>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className="mb-6 text-slate-600 leading-relaxed"
                >
                  {pkg.description}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                  className="mb-8"
                >
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-slate-500">
                    Rp{" "}
                    {Math.round(pkg.price / pkg.tokens).toLocaleString("id-ID")}{" "}
                    per token
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    ></motion.div>
                    <span className="text-slate-600 font-medium">
                      {pkg.tokens} Tokens included
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    ></motion.div>
                    <span className="text-slate-600 font-medium">
                      Premium photo filters
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-3 h-3 bg-red-500 rounded-full"
                    ></motion.div>
                    <span className="text-slate-600 font-medium">
                      WhatsApp sharing
                    </span>
                  </div>
                  {pkg.id !== "basic" && (
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      ></motion.div>
                      <span className="text-slate-600 font-medium">
                        Advanced editing tools
                      </span>
                    </div>
                  )}
                  {pkg.id === "premium" && (
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      ></motion.div>
                      <span className="text-slate-600 font-medium">
                        Unlimited downloads
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8 mb-12"
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-3xl font-bold mb-8 text-center text-slate-800"
          >
            🛒 Payment Summary
          </motion.h2>

          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 mb-8 border border-amber-200 shadow-inner"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-lg font-medium text-slate-600">
                  Selected Package:
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {selectedPkg?.name}
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-lg font-medium text-slate-600">
                  Tokens:
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {selectedPkg?.tokens} tokens
                </span>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="flex items-center justify-between text-xl pt-4 border-t border-amber-300"
              >
                <span className="text-xl font-medium text-slate-600">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="space-y-4"
            >
              <motion.button
                onClick={handlePay}
                disabled={loading || !amount || amount <= 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-2xl"
                }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Pay with Midtrans</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-10 border border-amber-200 shadow-xl"
        >
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-3xl font-bold mb-8 text-center text-slate-800"
          >
            🔒 Secure Payment
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.9 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-red-500 to-red-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <span className="text-2xl">🛡️</span>
              </motion.div>
              <h4 className="text-xl font-semibold mb-3 text-slate-800">
                SSL Protected
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Your payment data is encrypted and secure
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-amber-500 to-amber-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <span className="text-2xl">🏦</span>
              </motion.div>
              <h4 className="text-xl font-semibold mb-3 text-slate-800">
                Trusted Gateway
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Powered by Midtrans payment system
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-slate-600 to-slate-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <span className="text-2xl">⚡</span>
              </motion.div>
              <h4 className="text-xl font-semibold mb-3 text-slate-800">
                Instant Tokens
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Tokens added immediately after payment
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
}
