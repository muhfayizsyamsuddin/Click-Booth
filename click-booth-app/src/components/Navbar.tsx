"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Booth", href: "/booth", icon: Camera },
    { name: "Payment", href: "/payment", icon: CreditCard },
    { name: "Login", href: "/login", icon: LogIn },
    { name: "Register", href: "/register", icon: UserPlus },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <Link href="/" className="navbar-brand">
          <div
            className="icon-container coral"
            style={{ width: "2.5rem", height: "2.5rem", marginBottom: 0 }}
          >
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-heading-4" style={{ marginBottom: 0 }}>
              ClickBooth
            </span>
            <div
              className="text-caption"
              style={{
                marginTop: "-0.25rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Professional Studio
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <ul className="navbar-nav">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`navbar-link flex items-center gap-2 ${
                    isActive(item.href) ? "active" : ""
                  }`}
                  style={{
                    backgroundColor: isActive(item.href)
                      ? "var(--color-primary)"
                      : undefined,
                    color: isActive(item.href) ? "white" : undefined,
                    fontWeight: isActive(item.href) ? "600" : "500",
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* User Profile / Tokens */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "var(--color-cream-200)" }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--color-primary)" }}
              ></div>
              <Gem
                className="w-4 h-4"
                style={{ color: "var(--color-foreground-secondary)" }}
              />
              <span className="text-body-small">0 tokens</span>
            </div>
            <button className="btn btn-primary">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-cream-200)",
              color: "var(--color-foreground)",
            }}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: "white",
            borderColor: "var(--color-cream-300)",
          }}
        >
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive(item.href)
                    ? "var(--color-primary)"
                    : "transparent",
                  color: isActive(item.href)
                    ? "white"
                    : "var(--color-foreground-secondary)",
                  fontWeight: isActive(item.href) ? "600" : "500",
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Mobile User Info */}
            <div
              className="pt-4 mt-4 border-t"
              style={{ borderColor: "var(--color-cream-300)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  ></div>
                  <Gem
                    className="w-4 h-4"
                    style={{ color: "var(--color-foreground-secondary)" }}
                  />
                  <span className="text-body-small">0 tokens</span>
                </div>
              </div>
              <button className="btn btn-primary w-full justify-center">
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
