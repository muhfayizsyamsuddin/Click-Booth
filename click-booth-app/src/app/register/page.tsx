"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Gift,
  Shield,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setMessage("Full name is required");
      return false;
    }
    if (!formData.username.trim()) {
      setMessage("Username is required");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage("Valid email is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setMessage("Phone number is required");
      return false;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="max-w-lg w-full mx-4">
        {/* Header */}
        <div className="auth-header">
          <div className="icon-container coral auth-icon">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-heading-2 mb-2">Join ClickBooth</h1>
          <p className="text-body">
            Create your professional photo studio account
          </p>
        </div>

        {/* Registration Form */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+62 xxx xxxx xxxx"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-500 hover:text-charcoal-700 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-500 hover:text-charcoal-700 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="alert alert-info">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-coral-600 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div className="text-sm">
                  <p>
                    By creating an account, you agree to our Terms of Service
                    and Privacy Policy. Your data is secure and protected.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary btn-large w-full ${
                loading ? "btn-loading" : ""
              }`}
            >
              {!loading && (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && (
            <div
              className={`${
                message.includes("successful") || message.includes("berhasil")
                  ? "alert alert-success"
                  : "alert alert-error"
              }`}
            >
              {message}
            </div>
          )}

          {/* Navigation Links */}
          <div className="auth-footer">
            <div className="text-center mb-4">
              <Link
                href="/login"
                className="text-coral-600 hover:text-coral-700 font-medium transition-colors duration-200"
              >
                Already have an account? Sign in
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-charcoal-600 hover:text-charcoal-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="card mt-6">
          <h3 className="text-heading-4 mb-4 text-center flex items-center justify-center space-x-2">
            <Gift className="w-5 h-5 text-coral-600" />
            <span>Welcome Benefits</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-coral-600 rounded-full"></span>
                <span className="text-body-small">5 Free starter tokens</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-coral-600 rounded-full"></span>
                <span className="text-body-small">
                  Professional photo filters
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-coral-600 rounded-full"></span>
                <span className="text-body-small">
                  WhatsApp instant sharing
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-sage-600 rounded-full"></span>
                <span className="text-body-small">Cloud photo storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-sage-600 rounded-full"></span>
                <span className="text-body-small">HD quality downloads</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-sage-600 rounded-full"></span>
                <span className="text-body-small">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cream-300">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-body-small">
              Your data is encrypted and secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
