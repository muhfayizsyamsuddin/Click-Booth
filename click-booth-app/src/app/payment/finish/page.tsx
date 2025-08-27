"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

type VerifyResult = {
  ok: boolean;
  status: "success" | "pending" | "failed";
  message?: string;
};

export default function PaymentFinishPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const orderId = useMemo(() => sp.get("order_id") || "", [sp]);
  const transactionStatus = sp.get("transaction_status"); // capture | settlement | pending | deny | cancel | expire
  const fraudStatus = sp.get("fraud_status"); // accept | challenge | deny (kadang tidak ada)
  const [state, setState] = useState<
    "verifying" | "success" | "pending" | "failed"
  >("verifying");
  const [msg, setMsg] = useState("Finishing your payment...");

  useEffect(() => {
    if (!orderId) {
      setState("failed");
      setMsg("Invalid order_id.");
      return;
    }

    const verify = async () => {
      setState("verifying");
      setMsg("Verifying payment...");

      try {
        // 1) Coba verifikasi via endpoint status (pastikan Anda punya endpoint ini)
        const res = await fetch(`/api/payment/${encodeURIComponent(orderId)}`, {
          method: "GET",
        });
        if (res.ok) {
          const data = await res.json();
          // Harapkan { status: "success" | "pending" | "failed" }
          const s: VerifyResult = data;
          if (s.status === "success") {
            setState("success");
            setMsg("Payment verified. Tokens added to your account.");
            // Refresh navbar badge/token setelah 1.5s lalu arahkan
            setTimeout(() => router.replace("/profile"), 2500);
            return;
          }
          if (s.status === "pending") {
            setState("pending");
            setMsg("Payment pending. We will add tokens once it is settled.");
            return;
          }
          setState("failed");
          setMsg(s.message || "Payment failed.");
          return;
        }

        // 2) Fallback (dev): trigger manual notify agar token ditambah
        const notify = await fetch("/api/payment/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            transaction_status:
              transactionStatus === "capture" && fraudStatus !== "challenge"
                ? "settlement"
                : transactionStatus || "settlement",
            fraud_status: fraudStatus || "accept",
          }),
        });

        if (notify.ok) {
          setState("success");
          setMsg("Payment processed. Tokens added to your account.");
          setTimeout(() => router.replace("/profile"), 1500);
        } else {
          setState("pending");
          setMsg(
            "We received your payment. Please wait a moment then refresh."
          );
        }
      } catch (e) {
        console.error(e);
        setState("pending");
        setMsg("Could not verify now. We will sync shortly.");
      }
    };

    verify();
  }, [orderId, transactionStatus, fraudStatus, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-red-50 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white border border-amber-200 rounded-2xl p-8 shadow-xl text-center"
      >
        <div className="mb-4">
          {state === "verifying" && (
            <Loader2 className="w-12 h-12 text-amber-600 mx-auto animate-spin" />
          )}
          {state === "success" && (
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          )}
          {state === "pending" && (
            <Clock className="w-12 h-12 text-amber-500 mx-auto" />
          )}
          {state === "failed" && (
            <XCircle className="w-12 h-12 text-red-600 mx-auto" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {state === "success"
            ? "Payment Success"
            : state === "failed"
            ? "Payment Failed"
            : state === "pending"
            ? "Payment Pending"
            : "Verifying Payment"}
        </h1>
        <p className="text-slate-600 mb-6">{msg}</p>

        <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-600 mb-6">
          <div className="flex justify-between">
            <span>Order ID</span>
            <span className="font-medium">{orderId || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction</span>
            <span className="font-medium">{transactionStatus || "-"}</span>
          </div>
          {fraudStatus && (
            <div className="flex justify-between">
              <span>Fraud</span>
              <span className="font-medium">{fraudStatus}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.replace("/profile")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 text-white font-semibold shadow"
          >
            Go to Profile
          </button>
          <button
            onClick={() => router.replace("/payment")}
            className="px-4 py-2 rounded-lg border border-amber-200 text-slate-700 bg-white"
          >
            Back to Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
}
