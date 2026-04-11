"use client";

import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, FileText, GraduationCap, Network } from "lucide-react";
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
    return <GraduationCap className="h-16 w-16 text-indigo-500 lg:h-20 lg:w-20" />;
  }

  if (tab === "resumeAi") {
    return <FileText className="h-16 w-16 text-indigo-500 lg:h-20 lg:w-20" />;
  }

  return <Network className="h-16 w-16 text-indigo-500 lg:h-20 lg:w-20" />;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("connect");
  const activeFeature = featureContent[activeTab];

  return (
    <div
      className={`${inter.variable} ${manrope.variable} bg-white text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-500`}
    >
      <nav className="glass-nav fixed top-0 z-50 w-full border-b border-slate-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
          <div className="font-headline text-xl font-bold tracking-tighter text-slate-900">AlumUnity</div>
          <div className="hidden items-center gap-10 font-headline text-xs font-bold uppercase tracking-widest md:flex">
            <a className="text-slate-500 transition-colors duration-300 hover:text-indigo-500" href="#students">
              Students
            </a>
            <a className="text-slate-500 transition-colors duration-300 hover:text-indigo-500" href="#alumni">
              Alumni
            </a>
            <a className="text-slate-500 transition-colors duration-300 hover:text-indigo-500" href="#features">
              Features
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link
              className="rounded-full bg-indigo-500 px-6 py-2.5 font-headline text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              href="/login"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <main className="overflow-x-hidden pt-24">
        <section
          className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center px-6 pb-14 pt-8 text-center md:px-8"
          id="students"
        >
          <div className="z-10 mx-auto max-w-4xl space-y-8">
            <span className="inline-block rounded-full border border-slate-100 bg-slate-50 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              The Prestige Network
            </span>
            <h1 className="font-headline text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 lg:text-7xl">
              Bridging the gap between <span className="font-medium italic text-indigo-500">Potential</span> and
              Excellence.
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-slate-500">
              AlumUnity is the digital curator for academic legacy. We transform alumni networks into prestigious
              mentorship ecosystems, fostering career intelligence through meaningful heritage.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Link
                className="rounded-full bg-indigo-500 px-8 py-4 font-headline text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                href="/login"
              >
                Explore Opportunities
              </Link>
              <a
                className="rounded-full px-8 py-4 font-headline text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-50"
                href="#features"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-12 w-full max-w-5xl">
            <div className="premium-shadow relative aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-slate-100 shadow-2xl">
              <img
                alt="High-end professional networking"
                className="h-full w-full object-cover"
                src="https://images.pexels.com/photos/30562665/pexels-photo-30562665.jpeg"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
            </div>

            <div className="absolute -bottom-8 left-6 hidden max-w-[260px] rounded-2xl border border-slate-50 bg-white p-6 shadow-2xl md:block">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ">
                  <Check className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="font-headline whitespace-nowrap text-sm font-bold text-slate-900">Verified Alumni</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Over 5,000+ mentors from Fortune 500 companies ready to guide.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-24 lg:py-36" id="features">
          <div className="relative z-10 mx-auto mb-20 max-w-7xl px-8 text-center">
            <h2 className="mb-6 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 lg:text-7xl">
              Ecosystem infrastructure for <br />
              <span className="font-medium italic text-slate-500">alumni excellence</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl font-light leading-relaxed text-slate-500">
              Everything you need to transform institutional heritage into career intelligence. All in one place.
            </p>
          </div>
          <div className="mx-auto mb-16 flex max-w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 p-1.5">
            <button
              className={`rounded-full px-8 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "connect"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("connect")}
              type="button"
            >
              Connect
            </button>
            <button
              className={`rounded-full px-8 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "mentorship"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("mentorship")}
              type="button"
            >
              Mentorship
            </button>
            <button
              className={`rounded-full px-8 py-3 font-headline text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === "resumeAi"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("resumeAi")}
              type="button"
            >
              Resume AI
            </button>
          </div>
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex min-h-[600px] flex-col items-center gap-12 overflow-hidden rounded-[3rem] border border-slate-100/50 bg-slate-50/50 p-8 lg:flex-row lg:p-12">
              <div className="flex-1 space-y-8 lg:pl-12">
                <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
                  {activeFeature.badge}
                </span>
                <h3 className="font-headline text-4xl font-extrabold leading-tight text-slate-900 lg:text-6xl">
                  {activeFeature.heading}
                </h3>
                <p className="max-w-2xl text-lg font-light leading-relaxed text-slate-500">{activeFeature.subheading}</p>

                <div className="grid gap-3 sm:grid-cols-2">
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

                <div className="pt-4">
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
              <div className="relative h-full min-h-[400px] w-full flex-1">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent"></div>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center">
                      <FeatureCardIcon tab={activeTab} />
                    </div>
                    <div className="mb-3 h-[2px] w-24 bg-indigo-500/20"></div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{activeFeature.cardTitle}</p>
                    <p className="mt-2 font-headline text-5xl font-extrabold text-white">{activeFeature.cardMetric}</p>
                    <div className="mt-7 grid w-full max-w-[300px] grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300">
                        Live
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300">
                        Secure
                      </div>
                      <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300">
                        Smart
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="-z-10 absolute top-0 right-0 h-1/3 w-1/3 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px]"></div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col items-center gap-20 px-8 pb-28 pt-14 md:flex-row md:pt-20">
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-6">
              <div className="premium-shadow space-y-2 rounded-3xl border border-slate-100 bg-white p-10">
                <span className="font-headline text-5xl font-black text-slate-900">12k+</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Active Students</p>
              </div>
              <div className="translate-y-8 space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-10">
                <span className="font-headline text-5xl font-black text-indigo-500">85%</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Placement Rate</p>
              </div>
              <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-10">
                <span className="font-headline text-5xl font-black text-slate-900">500+</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Global Chapters</p>
              </div>
              <div className="premium-shadow translate-y-8 space-y-2 rounded-3xl border border-slate-100 bg-white p-10">
                <span className="font-headline text-5xl font-black text-slate-400">24/7</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Expert Support</p>
              </div>
            </div>
          </div>
          <div className="w-full space-y-8 md:w-1/2">
            <h2 className="font-headline text-4xl font-extrabold leading-tight text-slate-900">
              Elite Institutions, <br />
              Unrivaled <span className="font-medium italic text-indigo-500">Connections</span>.
            </h2>
            <p className="text-lg font-light leading-relaxed text-slate-500">
              AlumUnity isn&apos;t just a platform; it&apos;s a social fabric woven from the threads of academic
              excellence. We serve many  top-tier institutions globally.
            </p>
            <div className="flex items-center gap-12 pt-6 grayscale opacity-40 transition-all duration-700 hover:grayscale-0">
              <span className="font-headline text-sm font-black uppercase tracking-tighter opacity-50">Harvard</span>
              <span className="font-headline text-sm font-black uppercase tracking-tighter opacity-50">Stanford</span>
              <span className="font-headline text-sm font-black uppercase tracking-tighter opacity-50">MIT</span>
               <span className="font-headline text-sm font-black uppercase tracking-tighter opacity-50">JAIN</span>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-7xl px-8" id="alumni">
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-center text-white lg:p-24">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 50% 120%, #6366f1 0%, transparent 60%)",
              }}
            ></div>
            <h2 className="mx-auto mb-8 max-w-4xl font-headline text-4xl font-black tracking-tight lg:text-6xl">
              Your Legacy Starts with a Single Connection.
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl font-light leading-relaxed text-slate-400">
              Join the ranks of the world&apos;s most successful alumni and ambitious students. Experience the power of
              AlumUnity today.
            </p>
            <div className="relative z-10 flex flex-col justify-center gap-6 sm:flex-row">
              <Link
                className="rounded-full bg-white px-10 py-5 font-headline text-sm font-extrabold uppercase tracking-widest text-slate-900 transition-all hover:scale-105 hover:bg-slate-50"
                href="/signup"
              >
                Register as Alumni
              </Link>
              <Link
                className="rounded-full bg-indigo-500 px-10 py-5 font-headline text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-indigo-500/90"
                href="/signup"
              >
                Join as Student
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 px-12 md:flex-row">
          <div className="space-y-6">
            <div className="font-headline text-xl font-bold tracking-tighter text-slate-900">AlumUnity</div>
            <p className="max-w-xs font-body text-[11px] uppercase tracking-widest leading-loose text-slate-400">
              © 2024 AlumUnity. The Digital Curator for Alumni Excellence. Crafted for institutional prestige.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Platform</span>
              <a className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500" href="#">
                Students
              </a>
              <a className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500" href="#">
                Alumni
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Company</span>
              <a className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500" href="#">
                About
              </a>
              <a className="text-[11px] uppercase tracking-widest text-slate-400 hover:text-indigo-500" href="#">
                Contact
              </a>
            </div>
          </div>
          {/* <div className="flex gap-4">
            <a
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all hover:border-indigo-500 hover:text-indigo-500"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">language</span>
            </a>
            <a
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all hover:border-indigo-500 hover:text-indigo-500"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">alternate_email</span>
            </a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
