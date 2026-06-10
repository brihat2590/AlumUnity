"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  GraduationCap,
  Menu,
  Network,
  PhoneCall,
  X,
} from "lucide-react";
import { Inter, Manrope } from "next/font/google";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
});

type FeatureTab = "connect" | "mentorship" | "resumeAi";

const featureContent: Record<
  FeatureTab,
  {
    badge: string;
    heading: string;
    subheading: string;
    points: string[];
    cardTitle: string;
    cardMetric: string;
  }
> = {
  connect: {
    badge: "Connect Infrastructure",
    heading: "Custom-build your alumni networking experience",
    subheading:
      "Create institution-specific communities with verified profiles, interest clusters, and chapter-level discovery.",
    points: ["Verified alumni directory", "Smart cohort matching", "Campus chapter channels"],
    cardTitle: "Active network expansions",
    cardMetric: "+5,284",
  },
  mentorship: {
    badge: "Mentorship Engine",
    heading: "Run high-trust mentorship journeys at scale",
    subheading:
      "Pair students with mentors based on trajectory fit, and track outcomes through structured goal reviews.",
    points: ["Guidance from experts", "Guided goal templates", "Meeting and progress timeline"],
    cardTitle: "Mentorship hours logged",
    cardMetric: "12k",
  },
  resumeAi: {
    badge: "Resume AI Studio",
    heading: "Turn resumes into interview-ready narratives",
    subheading:
      "Get alumni-grade feedback loops with role-specific scoring and ATS readiness suggestions in minutes.",
    points: ["Resume review", "ATS optimization checks", "Version history and comparisons"],
    cardTitle: "Resumes improved this month",
    cardMetric: "120",
  },
};

function FeatureCardIcon({ tab }: { tab: FeatureTab }) {
  if (tab === "mentorship") {
    return <GraduationCap className="h-14 w-14 text-indigo-500 md:h-20 md:w-20" />;
  }

  if (tab === "resumeAi") {
    return <FileText className="h-14 w-14 text-indigo-500 md:h-20 md:w-20" />;
  }

  return <Network className="h-14 w-14 text-indigo-500 md:h-20 md:w-20" />;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("connect");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeFeature = featureContent[activeTab];

  const navLinks = [
    { href: "#students", label: "Students" },
    { href: "#alumni", label: "Alumni" },
    { href: "#features", label: "Features" },
    { href: "/call", label: "Calls" },
  ];

  return (
    <div
      className={`${inter.variable} ${manrope.variable} bg-white text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-500`}
    >
      {/* ── Navigation ── */}
      <nav className="glass-nav fixed top-0 z-50 w-full border-b border-slate-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          {/* Logo */}
          <div className="font-headline text-xl font-bold tracking-tighter text-slate-900">
            AlumUnity
          </div>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-10 font-headline text-xs font-bold uppercase tracking-widest md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="text-slate-500 transition-colors duration-300 hover:text-indigo-500"
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-slate-900 transition-all hover:border-indigo-500 hover:text-indigo-500"
              href="/call"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              Calls
            </Link>
            <Link
              className="rounded-full bg-indigo-500 px-5 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              href="/login"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile: compact CTA + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              className="rounded-full bg-indigo-500 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-white"
              href="/login"
            >
              Join
            </Link>
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-500"
              onClick={() => setMobileMenuOpen((v) => !v)}
              type="button"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white/95 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-0 px-5 pb-6 pt-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  className="border-b border-slate-50 py-3.5 font-headline text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:text-indigo-500"
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex gap-3">
                <Link
                  className="flex-1 rounded-full border border-slate-200 py-3 text-center font-headline text-xs font-bold uppercase tracking-widest text-slate-900 transition-colors hover:border-indigo-500 hover:text-indigo-500"
                  href="/call"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calls
                </Link>
                <Link
                  className="flex-1 rounded-full bg-indigo-500 py-3 text-center font-headline text-xs font-bold uppercase tracking-widest text-white"
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="overflow-x-hidden pt-20 sm:pt-24">
        {/* ── Hero Section ── */}
        <section
          className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-6xl flex-col justify-center px-5 pb-14 pt-10 text-center sm:px-8 sm:pt-12 md:min-h-[calc(100vh-6rem)]"
          id="students"
        >
          <div className="z-10 mx-auto max-w-4xl space-y-6 sm:space-y-8">
            <span className="inline-block rounded-full border border-slate-100 bg-slate-50 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              The Prestige Network
            </span>
            <h1 className="font-headline text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl">
              Bridging the gap between{" "}
              <span className="font-medium italic text-indigo-500">Potential</span> and Excellence.
            </h1>
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-slate-500 sm:text-lg">
              AlumUnity is the digital curator for academic legacy. We transform alumni networks into
              prestigious mentorship ecosystems, fostering career intelligence through meaningful
              heritage.
            </p>

            {/* Hero CTAs — stacked on mobile, row on sm+ */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4 sm:pt-4">
              <Link
                className="w-full rounded-full bg-indigo-500 px-8 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] sm:w-auto"
                href="/login"
              >
                Explore Opportunities
              </Link>
              <Link
                className="w-full rounded-full border border-slate-200 px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:border-indigo-500 hover:text-indigo-500 sm:w-auto"
                href="/call"
              >
                Start a Call
              </Link>
              <a
                className="w-full rounded-full px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-50 sm:w-auto"
                href="#features"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative mx-auto mt-10 w-full max-w-5xl sm:mt-12">
            <div className="premium-shadow relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-100 shadow-2xl sm:rounded-[2rem]">
              <img
                alt="High-end professional networking"
                className="h-full w-full object-cover"
                src="https://images.pexels.com/photos/30562665/pexels-photo-30562665.jpeg"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
            </div>

            {/* Floating card — shown from md up, absolute positioned */}
            <div className="absolute -bottom-8 left-4 hidden max-w-[240px] rounded-2xl border border-slate-50 bg-white p-5 shadow-2xl sm:left-6 sm:max-w-[260px] sm:p-6 md:block">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="font-headline whitespace-nowrap text-sm font-bold text-slate-900">
                  Verified Alumni
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Over 5,000+ mentors from Fortune 500 companies ready to guide.
              </p>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section className="relative overflow-hidden bg-white py-20 lg:py-36" id="features">
          {/* Section header */}
          <div className="relative z-10 mx-auto mb-12 max-w-7xl px-5 text-center sm:px-8 sm:mb-16 lg:mb-20">
            <h2 className="mb-4 font-headline text-3xl font-extrabold tracking-tighter text-slate-900 sm:text-4xl sm:mb-6 lg:text-7xl">
              Ecosystem infrastructure for{" "}
              <span className="font-medium italic text-slate-500">alumni excellence</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-slate-500 sm:text-xl">
              Everything you need to transform institutional heritage into career intelligence. All in
              one place.
            </p>
          </div>

          {/* Tab pills — scrollable on mobile */}
          <div className="mb-10 overflow-x-auto px-5 sm:px-8 sm:mb-16">
            <div className="mx-auto flex w-fit min-w-0 items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 p-1.5 sm:gap-2">
              {(["connect", "mentorship", "resumeAi"] as FeatureTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 font-headline text-xs font-bold uppercase tracking-widest transition-all sm:px-8 sm:py-3 sm:text-sm ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab === "resumeAi" ? "Resume AI" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Feature card */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-slate-100/50 bg-slate-50/50 p-6 sm:rounded-[3rem] sm:gap-12 sm:p-10 lg:flex-row lg:min-h-[560px] lg:p-12">
              {/* Text side */}
              <div className="flex-1 space-y-6 sm:space-y-8 lg:pl-8">
                <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  {activeFeature.badge}
                </span>
                <h3 className="font-headline text-2xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {activeFeature.heading}
                </h3>
                <p className="text-base font-light leading-relaxed text-slate-500 sm:text-lg">
                  {activeFeature.subheading}
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {activeFeature.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                      {point}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105"
                    href="#"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    Learn more
                  </a>
                </div>
              </div>

              {/* Visual card side */}
              <div className="relative w-full min-h-[280px] flex-1 sm:min-h-[360px] lg:min-h-0">
                <div className="relative flex h-full w-full min-h-[280px] items-center justify-center overflow-hidden rounded-3xl bg-slate-900 shadow-2xl sm:min-h-[360px] sm:rounded-[2.5rem] lg:min-h-[460px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent"></div>
                  <div className="relative flex flex-col items-center text-center px-4">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                      <FeatureCardIcon tab={activeTab} />
                    </div>
                    <div className="mb-3 h-[2px] w-24 bg-indigo-500/20"></div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {activeFeature.cardTitle}
                    </p>
                    <p className="mt-2 font-headline text-4xl font-extrabold text-white sm:text-5xl">
                      {activeFeature.cardMetric}
                    </p>
                    <div className="mt-6 grid w-full max-w-[280px] grid-cols-3 gap-2 sm:mt-7 sm:max-w-[300px] sm:gap-3">
                      {["Live", "Secure", "Smart"].map((label) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-700 bg-slate-800 px-2 py-2 text-xs font-semibold text-slate-300 sm:px-3"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="-z-10 absolute top-0 right-0 h-1/3 w-1/3 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px]"></div>
        </section>

        {/* ── Stats + Institutions Section ── */}
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-5 pb-24 pt-12 sm:px-8 sm:pb-28 md:flex-row md:gap-20 md:pt-20">
          {/* Stats grid */}
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="premium-shadow space-y-2 rounded-2xl border border-slate-100 bg-white p-6 sm:rounded-3xl sm:p-10">
                <span className="font-headline text-4xl font-black text-slate-900 sm:text-5xl">
                  12k+
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Active Students
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:rounded-3xl sm:translate-y-8 sm:p-10">
                <span className="font-headline text-4xl font-black text-indigo-500 sm:text-5xl">
                  85%
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Placement Rate
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:rounded-3xl sm:p-10">
                <span className="font-headline text-4xl font-black text-slate-900 sm:text-5xl">
                  500+
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Global Chapters
                </p>
              </div>
              <div className="premium-shadow space-y-2 rounded-2xl border border-slate-100 bg-white p-6 sm:rounded-3xl sm:translate-y-8 sm:p-10">
                <span className="font-headline text-4xl font-black text-slate-400 sm:text-5xl">
                  24/7
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Expert Support
                </p>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="w-full space-y-6 md:w-1/2 md:space-y-8">
            <h2 className="font-headline text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Elite Institutions, <br />
              Unrivaled{" "}
              <span className="font-medium italic text-indigo-500">Connections</span>.
            </h2>
            <p className="text-base font-light leading-relaxed text-slate-500 sm:text-lg">
              AlumUnity isn&apos;t just a platform; it&apos;s a social fabric woven from the threads
              of academic excellence. We serve many top-tier institutions globally.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 grayscale opacity-40 transition-all duration-700 hover:grayscale-0 sm:gap-12 sm:pt-6">
              {["Harvard", "Stanford", "MIT", "JAIN"].map((name) => (
                <span
                  key={name}
                  className="font-headline text-sm font-black uppercase tracking-tighter opacity-50"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="mx-auto mb-16 max-w-7xl px-5 sm:mb-32 sm:px-8" id="alumni">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-center text-white sm:rounded-[3rem] sm:p-12 lg:p-24">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 120%, #6366f1 0%, transparent 60%)",
              }}
            ></div>
            <h2 className="mx-auto mb-6 max-w-4xl font-headline text-3xl font-black tracking-tight sm:mb-8 sm:text-4xl lg:text-6xl">
              Your Legacy Starts with a Single Connection.
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base font-light leading-relaxed text-slate-400 sm:mb-12 sm:text-xl">
              Join the ranks of the world&apos;s most successful alumni and ambitious students.
              Experience the power of AlumUnity today.
            </p>
            <div className="relative z-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-6">
              <Link
                className="w-full rounded-full bg-white px-8 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-slate-900 transition-all hover:scale-105 hover:bg-slate-50 sm:w-auto sm:px-10 sm:py-5"
                href="/signup"
              >
                Register as Alumni
              </Link>
              <Link
                className="w-full rounded-full bg-indigo-500 px-8 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-indigo-500/90 sm:w-auto sm:px-10 sm:py-5"
                href="/signup"
              >
                Join as Student
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-12 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 sm:px-12 md:flex-row md:gap-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="font-headline text-xl font-bold tracking-tighter text-slate-900">
              AlumUnity
            </div>
            <p className="max-w-xs font-body text-[11px] uppercase tracking-widest leading-loose text-slate-400">
              © 2026 AlumUnity. The Digital Curator for Alumni Excellence. Crafted for institutional
              prestige.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                Platform
              </span>
              <a
                className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500"
                href="#"
              >
                Students
              </a>
              <a
                className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500"
                href="#"
              >
                Alumni
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                Company
              </span>
              <a
                className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500"
                href="#"
              >
                About
              </a>
              <a
                className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500"
                href="#"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
