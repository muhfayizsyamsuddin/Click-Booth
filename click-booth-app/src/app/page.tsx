"use client";

import Link from "next/link";
import {
  Camera,
  Palette,
  Smartphone,
  Gem,
  Check,
  Star,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Camera,
      title: "Professional Photo Booth",
      description:
        "High-quality camera with professional lighting and filters for perfect shots.",
      iconColor: "coral",
    },
    {
      icon: Palette,
      title: "Advanced Editing Tools",
      description:
        "Professional-grade filters, effects, and editing tools to enhance your photos.",
      iconColor: "sage",
    },
    {
      icon: Smartphone,
      title: "Instant WhatsApp Share",
      description:
        "Share your photos instantly to WhatsApp or download them directly.",
      iconColor: "coral",
    },
    {
      icon: Gem,
      title: "Token-based System",
      description:
        "Purchase tokens to unlock premium features and unlimited downloads.",
      iconColor: "charcoal",
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "50K",
      tokens: 10,
      features: [
        "10 Photo Sessions",
        "Basic Filters",
        "WhatsApp Share",
        "Standard Quality",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "100K",
      tokens: 25,
      features: [
        "25 Photo Sessions",
        "Premium Filters",
        "WhatsApp Share",
        "HD Quality",
        "Advanced Editing",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "180K",
      tokens: 50,
      features: [
        "50 Photo Sessions",
        "All Filters & Effects",
        "Unlimited Sharing",
        "4K Quality",
        "Premium Templates",
        "Priority Support",
      ],
      popular: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          padding: "5rem 0",
          backgroundColor: "var(--color-cream-100, #f5f0e8)",
          textAlign: "center",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "var(--color-charcoal-900, #2a312d)",
              marginBottom: "1.5rem",
            }}
          >
            ClickBooth Studio
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--color-charcoal-700, #4a524e)",
              maxWidth: "48rem",
              margin: "0 auto 2rem",
            }}
          >
            Professional photo booth experience with AI-powered filters, instant
            sharing, and premium quality results.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Link
              href="/booth"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "var(--color-coral-600, #e8855a)",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "2rem",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              <Camera className="w-6 h-6" />
              <span>Start Photo Session</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-heading-2 mb-4">Why Choose ClickBooth?</h2>
            <p className="text-body-large max-w-2xl mx-auto">
              Experience the future of photo booth technology with our premium
              features and professional quality.
            </p>
          </div>

          <div className="grid-features">
            {features.map((feature, index) => (
              <div key={index} className="card card-feature">
                <div className={`icon-container ${feature.iconColor}`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-heading-4 mb-3">{feature.title}</h3>
                <p className="text-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-heading-2 mb-4">Choose Your Plan</h2>
            <p className="text-body-large max-w-2xl mx-auto">
              Select the perfect token package for your photo booth needs. All
              plans include premium features.
            </p>
          </div>

          <div className="grid-pricing">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card card-pricing ${plan.popular ? "popular" : ""}`}
              >
                {plan.popular && (
                  <div className="badge-popular">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-heading-3 mb-2">{plan.name}</h3>
                  <div className="text-heading-1 mb-2 text-primary">
                    Rp {plan.price}
                  </div>
                  <div className="text-body text-charcoal-600">
                    {plan.tokens} Tokens
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 text-primary" />
                      <span className="text-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/payment"
                  className={`btn w-full justify-center ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="cta-card">
            <h2 className="text-heading-2 mb-4 text-white">
              Ready to Create Amazing Photos?
            </h2>
            <p className="text-body-large mb-6 text-white/90">
              Join thousands of users who trust ClickBooth for their
              professional photo needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booth" className="btn btn-secondary">
                <Camera className="w-5 h-5" />
                <span>Try Now - Free</span>
              </Link>
              <Link href="/login" className="btn btn-outline-white">
                <Sparkles className="w-5 h-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
