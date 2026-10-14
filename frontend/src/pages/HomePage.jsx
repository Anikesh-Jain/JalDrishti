import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DropletIcon,
  BellIcon,
  BarChartIcon,
  ShieldCheckIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  FileTextIcon,
  MapPinIcon,
  SmartphoneIcon,
  ImageIcon
} from '../components/common/Icons';
import api from '../services/api';

/**
 * JalDrishti Public Landing Page
 *
 * Section Sequence (Strict Requirement):
 * 1. Landing / Hero (#hero)
 * 2. Overview (#overview, #mission)
 * 3. Indicators (#indicators)
 * 4. Architecture (#how-it-works)
 * 5. Standards (#research, #docs)
 * 6. Facts & Context (#facts, #help)
 * 7. Contact (#contact)
 * 8. Governance / Terms (#privacy, #terms) & CTA -> Footer (via AppLayout)
 */
export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [latestReading, setLatestReading] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactReferenceId, setContactReferenceId] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccessMsg, setContactSuccessMsg] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    async function loadLatest() {
      try {
        const res = await api.nodes.getLatestReading();
        if (mounted && res && res.data) {
          setLatestReading(res.data);
        }
      } catch {
        // Fallback to sample data for display
      }
    }
    loadLatest();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const dashboardPath = user?.role === 'Admin' ? '/admin' : '/citizen';

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    if (!contactForm.name?.trim() || !contactForm.email?.trim() || !contactForm.message?.trim()) {
      setContactError('Please fill out all required fields.');
      return;
    }
    if (contactForm.message.trim().length < 10) {
      setContactError('Message must be at least 10 characters long.');
      return;
    }

    setContactLoading(true);
    const citizenEmail = contactForm.email.trim();
    try {
      const res = await api.contact.submit({
        name: contactForm.name.trim(),
        email: citizenEmail,
        subject: contactForm.subject?.trim() || 'General Water Quality Inquiry',
        message: contactForm.message.trim()
      });
      setContactSubmitted(true);
      setContactReferenceId(res.referenceId || res.inquiryId || '');
      setSubmittedEmail(citizenEmail);
      setContactSuccessMsg(res.message || 'Thank you for reaching out. Your inquiry has been recorded by the JalDrishti team.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setContactError(err.message || 'Failed to submit inquiry. Please check your network and try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const faqs = [
    {
      q: 'Which physical and chemical water parameters are monitored?',
      a: 'JalDrishti continuously acquires four core indicators via dedicated probes: Hydrogen-ion concentration (pH), Turbidity (NTU), Total Dissolved Solids (TDS in ppm/mg/L), and Water Temperature (°C).'
    },
    {
      q: 'How does the automated early warning and alert engine function?',
      a: 'Incoming telemetry is checked against multi-tier safe limits aligned with BIS IS 10500:2012 standards. When a parameter breaches permitted limits, the engine flags an Active breach and dispatches real-time community warnings with debounced SMS notifications.'
    },
    {
      q: 'What is the role of the AI Water Image Screening feature?',
      a: 'The image screening module utilizes Google Gemini Vision to conduct preliminary visual inspection of surface water samples (detecting discoloration, algal blooms, or gross turbidity). It serves as an auxiliary citizen screening tool and does not replace laboratory chemical certification.'
    },
    {
      q: 'What hardware microcontroller is JalDrishti engineered on?',
      a: 'The IoT node runs on an ESP32-S3 microcontroller communicating over Wi-Fi via secure HTTP/JSON payloads with device API key authentication.'
    }
  ];

  return (
    <div className="bg-[#F0FAFF] text-[#334155] font-sans selection:bg-[#38BDF8] selection:text-white">
      {/* =========================================================================
          1. FULL-VIEWPORT HERO SECTION
          ========================================================================= */}
      <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden scroll-mt-16">
        {/* Natural landscape background with selective readability scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/images/hero-water.jpg')` }}
        />
        {/* Subtle directional gradient: darkens gently on the left for crisp text contrast while keeping lake, mountains, and trees clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F0FAFF] via-transparent to-black/20 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-[#BAE6FD]/40 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                <span>Continuous IoT Telemetry & Early Warning System</span>
              </div>

              {/* Primary Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-[1.1] drop-shadow-lg">
                Cleaner Water, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BAE6FD] via-[#E0F7FF] to-[#DDF8E8]">
                  Safer Tomorrow.
                </span>
              </h1>

              {/* Supporting Subheadline */}
              <p className="text-base sm:text-lg text-white/95 max-w-xl font-normal leading-relaxed drop-shadow-md">
                JalDrishti monitors community water quality in real time—combining calibrated IoT sensor telemetry, automated threshold alerts, and AI visual screening to protect drinking water infrastructure.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? dashboardPath : '/citizen'}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#0284C7] hover:bg-[#0369A1] shadow-lg shadow-black/25 hover:shadow-black/35 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                >
                  <span>Explore Citizen Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <a
                  href="#overview"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white hover:text-white bg-white/20 hover:bg-white/30 border border-white/35 backdrop-blur-md transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Project Overview</span>
                  <span>↓</span>
                </a>
              </div>
            </div>

            {/* Right Column: Floating Status Preview Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group max-w-sm w-full animate-water-float">
                {/* Subtle soft aqua glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#38BDF8]/40 to-[#0284C7]/30 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition duration-1000 animate-water-glow" />

                {/* Glassmorphic Panel */}
                <div className="relative rounded-2xl p-6 bg-white/95 backdrop-blur-md border border-[#BAE6FD] shadow-2xl text-[#334155] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#BAE6FD]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs uppercase tracking-wider font-bold text-[#475569]">
                        Station Telemetry Status
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDF8E8] border border-[#A7F3D0] text-[#15803D]">
                      {latestReading?.overallStatus || 'Safe Bound'}
                    </span>
                  </div>

                  {/* Highlight Parameters */}
                  <div className="grid grid-cols-2 gap-3 py-1">
                    <div className="p-3 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]">
                      <span className="text-[11px] text-[#475569] block font-medium">Acidity (pH)</span>
                      <span className="text-2xl font-black text-[#0284C7] mt-1 block font-mono">
                        {latestReading?.pH ? latestReading.pH.toFixed(1) : '7.2'}
                      </span>
                      <span className="text-[10px] text-[#15803D] font-semibold">BIS 6.5 — 8.5 Limit</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]">
                      <span className="text-[11px] text-[#475569] block font-medium">Dissolved Solids</span>
                      <span className="text-2xl font-black text-[#15803D] mt-1 block font-mono">
                        {latestReading?.tds ? `${latestReading.tds} ppm` : '128 ppm'}
                      </span>
                      <span className="text-[10px] text-[#15803D] font-semibold">&lt; 500 ppm Permissible</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#475569] border-t border-[#BAE6FD]">
                    <span className="truncate">Node: {latestReading?.nodeName || 'Ward 12 Municipal Station'}</span>
                    <span className="shrink-0 text-[#0284C7] font-mono text-[11px] font-semibold">● Live Telemetry</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] text-center italic">
                    Sample telemetry displayed for demonstration and evaluation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Pills Below Hero */}
          <div className="mt-14 pt-8 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/95 border border-[#BAE6FD] backdrop-blur-md text-[#334155] shadow-xs hover:border-[#38BDF8] transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#E0F7FF] text-[#0284C7] flex items-center justify-center shrink-0">
                <DropletIcon className="w-5 h-5 text-[#0284C7]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Real-Time Telemetry</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/95 border border-[#BAE6FD] backdrop-blur-md text-[#334155] shadow-xs hover:border-[#38BDF8] transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <BellIcon className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Automated Alerts</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/95 border border-[#BAE6FD] backdrop-blur-md text-[#334155] shadow-xs hover:border-[#38BDF8] transition-all">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                <BarChartIcon className="w-5 h-5 text-[#0284C7]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Historical Trends</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/95 border border-[#BAE6FD] backdrop-blur-md text-[#334155] shadow-xs hover:border-[#38BDF8] transition-all">
              <div className="w-9 h-9 rounded-lg bg-[#DDF8E8] text-[#15803D] flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-5 h-5 text-[#15803D]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Safer Communities</span>
            </div>
          </div>
        </div>

        {/* Gentle Wave Divider Transition to Overview */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10 pointer-events-none">
          <svg className="relative block w-full h-8 sm:h-12 text-[#F0FAFF]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* =========================================================================
          2. PROJECT OVERVIEW & MISSION (MUST BE IMMEDIATELY AFTER HERO)
          ========================================================================= */}
      <section id="overview" className="py-20 lg:py-24 bg-[#F0FAFF] border-b border-[#BAE6FD] scroll-mt-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
                <DropletIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Project Overview & Civic Mission</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight leading-tight" id="mission">
                Clean Water, Safer Tomorrow: <br />
                <span className="text-[#0284C7]">The JalDrishti Mission</span>
              </h2>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                JalDrishti is an applied environmental technology project conceived as part of <strong>JalDrishti — CS506 Minor Project</strong> at <strong>Acropolis Institute of Technology and Research, Indore</strong>.
              </p>

              <p className="text-sm text-[#475569] leading-relaxed">
                Our objective is to overcome the critical limitations of traditional intermittent grab-sampling in municipal water distribution by deploying autonomous, affordable IoT telemetry nodes that deliver continuous monitoring, early contamination detection, and transparent civic communication.
              </p>

              {/* Two Core Pillar Cards */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F7FF] text-[#0284C7] flex items-center justify-center font-bold text-xs mb-3">
                    <ActivityIcon className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Autonomous Telemetry</h4>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Continuous probe sampling cycle every 30 seconds with instant multi-variate threshold validation.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#DDF8E8] text-[#15803D] flex items-center justify-center font-bold text-xs mb-3">
                    <ShieldCheckIcon className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Community Early Warning</h4>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Immediate breach notifications and debounced SMS alerts before contaminated water reaches household taps.
                  </p>
                </div>
              </div>

              {/* Research Attribution Card */}
              <div className="p-4 rounded-xl bg-[#E0F7FF]/70 border border-[#BAE6FD] flex items-center gap-3 text-xs text-[#0369A1]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                <span>
                  <strong>Academic Research Grounding:</strong> Engineering verified protocols aligned with Bureau of Indian Standards (BIS IS 10500:2012) and CPCB criteria.
                </span>
              </div>
            </div>

            {/* Right Visual Presentation Column */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-white border border-[#BAE6FD] shadow-xl p-3">
                {/* Visual Image with Elegant Frame */}
                <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 w-full group">
                  <img
                    src="/images/sample-water.jpg"
                    alt="Water Quality Monitoring and Laboratory Probe Analysis"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-xs font-bold text-[#0284C7] shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In-Situ Telemetry Node</span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BAE6FD] block">
                      Civic Infrastructure Protection
                    </span>
                    <h3 className="text-base font-bold text-white drop-shadow-sm">
                      Continuous Sensing vs. Intermittent Sampling
                    </h3>
                    <p className="text-xs text-white/90 leading-snug">
                      Protecting community distribution pipelines with real-time digital monitoring and transparent public reporting.
                    </p>
                  </div>
                </div>

                {/* Micro Stats Bar Below Visual */}
                <div className="grid grid-cols-3 gap-2 pt-3 px-1 text-center">
                  <div className="p-2 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]/70">
                    <span className="text-[10px] text-[#64748B] block font-medium">Sampling Rate</span>
                    <span className="text-xs font-black text-[#0284C7] mt-0.5 block font-mono">30 Seconds</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]/70">
                    <span className="text-[10px] text-[#64748B] block font-medium">Standard</span>
                    <span className="text-xs font-black text-[#15803D] mt-0.5 block">BIS IS 10500</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F0FAFF] border border-[#BAE6FD]/70">
                    <span className="text-[10px] text-[#64748B] block font-medium">Telemetry</span>
                    <span className="text-xs font-black text-[#0284C7] mt-0.5 block">Wi-Fi / REST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ESSENTIAL WATER QUALITY INDICATORS (DIRECTLY AFTER OVERVIEW)
          ========================================================================= */}
      <section id="indicators" className="py-20 lg:py-24 bg-white border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Multi-Parameter Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              Essential Water Quality Indicators
            </h2>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">
              JalDrishti continuously measures four core physical and chemical indicators to detect contamination before municipal water reaches household taps, benchmarked strictly against Bureau of Indian Standards (BIS IS 10500:2012).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* pH Card */}
            <div className="p-6 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] hover:border-[#38BDF8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-bold text-sm shadow-xs font-mono">
                    pH
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0]">
                    Safe Band
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">Hydrogen-Ion (pH)</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Measures the acidity or alkalinity balance. Deviations accelerate pipe corrosion and heavy metal leaching into drinking supplies.
                </p>

                {/* Visual Scale Indicator */}
                <div className="mt-4 p-2.5 rounded-xl bg-white border border-[#BAE6FD]/80">
                  <div className="flex justify-between text-[10px] text-[#64748B] mb-1 font-medium">
                    <span>Acidic (0)</span>
                    <span className="text-[#15803D] font-bold">Neutral (7)</span>
                    <span>Alkaline (14)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-sky-500 relative">
                    <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#15803D] shadow-xs" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#BAE6FD]/70 flex items-baseline justify-between">
                <span className="text-xs text-[#475569] font-medium">Safe Limit:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DDF8E8] text-[#15803D] font-mono">
                  6.5 — 8.5 pH
                </span>
              </div>
            </div>

            {/* Turbidity Card */}
            <div className="p-6 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] hover:border-[#38BDF8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-sm shadow-xs font-mono">
                    NTU
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0]">
                    Safe Band
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">Turbidity</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Optical clarity index evaluating suspended colloidal silt, organic particles, and microbial pathogens that shield bacteria from disinfection.
                </p>

                {/* Visual Clarity Indicator */}
                <div className="mt-4 p-2.5 rounded-xl bg-white border border-[#BAE6FD]/80">
                  <div className="flex justify-between text-[10px] text-[#64748B] mb-1 font-medium">
                    <span>Crystal Clear</span>
                    <span className="text-amber-700 font-bold">≤ 5.0 NTU</span>
                    <span>Opaque</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-600 relative">
                    <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow-xs" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#BAE6FD]/70 flex items-baseline justify-between">
                <span className="text-xs text-[#475569] font-medium">Safe Limit:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DDF8E8] text-[#15803D] font-mono">
                  ≤ 5.0 NTU
                </span>
              </div>
            </div>

            {/* TDS Card */}
            <div className="p-6 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] hover:border-[#38BDF8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center font-bold text-sm shadow-xs font-mono">
                    TDS
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0]">
                    Safe Band
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">Total Dissolved Solids</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Sum of dissolved inorganic minerals, carbonates, chlorides, and salts. Elevated TDS impairs palatability and signals contamination.
                </p>

                {/* Visual Mineral Indicator */}
                <div className="mt-4 p-2.5 rounded-xl bg-white border border-[#BAE6FD]/80">
                  <div className="flex justify-between text-[10px] text-[#64748B] mb-1 font-medium">
                    <span>Pure Water</span>
                    <span className="text-[#15803D] font-bold">&lt; 300 ppm</span>
                    <span>500 ppm Limit</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500 relative">
                    <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0284C7] shadow-xs" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#BAE6FD]/70 flex items-baseline justify-between">
                <span className="text-xs text-[#475569] font-medium">Safe Limit:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DDF8E8] text-[#15803D] font-mono">
                  ≤ 500 ppm
                </span>
              </div>
            </div>

            {/* Temperature Card */}
            <div className="p-6 rounded-2xl bg-[#F0FAFF] border border-[#BAE6FD] hover:border-[#38BDF8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-sm shadow-xs font-mono">
                    °C
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                    Normal Band
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E293B]">Water Temperature</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Governs chemical reaction rates, oxygen solubility, and microbial proliferation kinetics across distribution networks.
                </p>

                {/* Visual Thermal Indicator */}
                <div className="mt-4 p-2.5 rounded-xl bg-white border border-[#BAE6FD]/80">
                  <div className="flex justify-between text-[10px] text-[#64748B] mb-1 font-medium">
                    <span>Cold (10°C)</span>
                    <span className="text-[#0284C7] font-bold">Ambient (24°C)</span>
                    <span>High (40°C)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-rose-400 relative">
                    <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-600 shadow-xs" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#BAE6FD]/70 flex items-baseline justify-between">
                <span className="text-xs text-[#475569] font-medium">Normal Range:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E0F7FF] text-[#0284C7] font-mono">
                  10 — 40 °C
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS / SYSTEM ARCHITECTURE (DIRECTLY AFTER INDICATORS)
          ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-24 bg-[#F0FAFF] border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>System Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              End-to-End IoT & Early Warning Pipeline
            </h2>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">
              Engineered for continuous municipal operation: from physical probe voltage acquisition to automated resident early warning.
            </p>
          </div>

          {/* Connected 4-Stage Architecture Pipeline */}
          <div className="relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-[#BAE6FD] via-[#38BDF8] to-[#BAE6FD] -translate-y-12 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {/* Step 1: Probes */}
              <div className="p-6 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#0284C7] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#0284C7]/20 font-mono">
                      01
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7]">
                      Probes & Sensing
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">IoT Sensor Ingestion</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Analog & digital probe array (pH, Turbidity optical sensor, TDS conductivity pins, DS18B20 temp) submerged in water flow.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#BAE6FD]/70 text-[11px] text-[#0284C7] font-semibold flex items-center gap-1.5">
                  <ActivityIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>30s Calibrated Sampling</span>
                </div>
              </div>

              {/* Step 2: ESP32 Edge */}
              <div className="p-6 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#0284C7] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#0284C7]/20 font-mono">
                      02
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7]">
                      Edge Controller
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">ESP32-S3 Wi-Fi Gateway</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Microcontroller samples analog ADC voltages, applies calibration polynomial curves, signs payload with API key, and transmits over Wi-Fi.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#BAE6FD]/70 text-[11px] text-[#0284C7] font-semibold flex items-center gap-1.5">
                  <SmartphoneIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Secure HTTP/JSON Payload</span>
                </div>
              </div>

              {/* Step 3: Cloud & Alerts */}
              <div className="p-6 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#0284C7] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#0284C7]/20 font-mono">
                      03
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7]">
                      Evaluation Engine
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">Threshold Engine & SMS</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Node.js backend validates telemetry, indexes into MongoDB, detects BIS parameter breaches, and dispatches debounced emergency SMS alerts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#BAE6FD]/70 text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                  <BellIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automated Debounced SMS</span>
                </div>
              </div>

              {/* Step 4: Citizen Portal */}
              <div className="p-6 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-[#0284C7] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#0284C7]/20 font-mono">
                      04
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DDF8E8] text-[#15803D]">
                      Civic Portal & AI
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B]">Transparency & AI Vision</h3>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    Residents inspect live geospatial GIS station maps, historical parameter graphs, and submit water photos for Google Gemini AI visual screening.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#BAE6FD]/70 text-[11px] text-[#15803D] font-semibold flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Public Safety Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. RESEARCH PAPERS & TECHNICAL STANDARDS (DIRECTLY AFTER ARCHITECTURE)
          ========================================================================= */}
      <section id="research" className="py-20 lg:py-24 bg-white border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Academic Foundations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              Research & Technical Standards
            </h2>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">
              Grounding IoT sensor acquisition, multi-variate threshold evaluation, and computer vision screening in scientific literature and statutory drinking water specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="docs">
            {/* BIS Standards Card */}
            <div className="p-7 bg-[#F0FAFF] rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                  Standards Document
                </span>
                <h3 className="text-lg font-bold text-[#1E293B]">BIS IS 10500:2012 Standards</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  National drinking water specification governing permissible limits for pH (6.5–8.5), Turbidity (≤5 NTU), and TDS (≤500 ppm). Configured directly inside JalDrishti threshold engine.
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#BAE6FD] text-[11px] text-[#15803D] font-medium space-y-1">
                  <div className="flex justify-between">
                    <span>pH Permissible:</span>
                    <span className="font-mono font-bold">6.5 — 8.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turbidity Permissible:</span>
                    <span className="font-mono font-bold">≤ 5.0 NTU</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDS Permissible:</span>
                    <span className="font-mono font-bold">≤ 500 ppm</span>
                  </div>
                </div>
              </div>
              <a
                href="#indicators"
                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] inline-flex items-center gap-1.5 pt-4"
              >
                <span>View Parameter Matrix</span>
                <span>→</span>
              </a>
            </div>

            {/* REST API Card */}
            <div className="p-7 bg-[#F0FAFF] rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                  API Reference
                </span>
                <h3 className="text-lg font-bold text-[#1E293B]">RESTful Sensor Ingestion API</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Standardized JSON schema endpoints for ESP32-S3 ingestion (<code className="text-[#0284C7] font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#BAE6FD]">POST /api/sensor/readings</code>), station queries, and threshold configurations.
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#BAE6FD] text-[11px] text-[#475569] space-y-1.5 font-mono">
                  <p className="truncate text-[#0284C7] flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                    <span>Authenticated via X-API-KEY</span>
                  </p>
                  <p className="truncate text-[#15803D] flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>JSON Schema Validation</span>
                  </p>
                  <p className="truncate text-[#475569] flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#475569] shrink-0" />
                    <span>Time-series MongoDB Storage</span>
                  </p>
                </div>
              </div>
              <Link
                to="/reports"
                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] inline-flex items-center gap-1.5 pt-4"
              >
                <span>Access Reports & Exports</span>
                <span>→</span>
              </Link>
            </div>

            {/* AI Vision Model Card */}
            <div className="p-7 bg-[#F0FAFF] rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0]">
                  AI Vision Model
                </span>
                <h3 className="text-lg font-bold text-[#1E293B]">Multimodal Water Screening</h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Google Gemini Vision multimodal prompt engineering for preliminary surface inspection and citizen water sample validation (detecting visible discoloration or algal blooms).
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#BAE6FD] text-[11px] text-[#15803D] space-y-1.5">
                  <p className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>Auxiliary Citizen Triage</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>Discoloration & Turbidity Analysis</span>
                  </p>
                  <p className="text-[#64748B] italic pl-5">Non-statutory laboratory companion</p>
                </div>
              </div>
              <Link
                to="/citizen/image-screening"
                className="text-xs font-bold text-[#15803D] hover:text-emerald-800 inline-flex items-center gap-1.5 pt-4"
              >
                <span>Try Image Screening</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FACTS & CONTEXT & FAQ (DIRECTLY AFTER STANDARDS)
          ========================================================================= */}
      <section id="facts" className="py-20 lg:py-24 bg-[#F0FAFF] border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Environmental Context & Facts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              Water Quality Facts & Context
            </h2>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">
              Verified operational statistics, sustainability principles, and practical knowledge regarding JalDrishti monitoring.
            </p>
          </div>

          {/* 4 Verified Project Fact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
              <span className="text-3xl font-black text-[#0284C7] font-mono block mb-2">30s</span>
              <h4 className="text-sm font-bold text-[#1E293B]">Continuous Telemetry Cycle</h4>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Autonomous sensor probe sampling runs every 30 seconds, replacing weeks-long laboratory collection cycles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
              <span className="text-3xl font-black text-[#15803D] font-mono block mb-2">100%</span>
              <h4 className="text-sm font-bold text-[#1E293B]">BIS IS 10500 Alignment</h4>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                All monitoring thresholds are directly calibrated to official Bureau of Indian Standards drinking water safety guidelines.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
              <span className="text-3xl font-black text-[#0284C7] font-mono block mb-2">4 Core</span>
              <h4 className="text-sm font-bold text-[#1E293B]">Multi-Variate Indicators</h4>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Integrated tracking of pH, Turbidity, Total Dissolved Solids, and Water Temperature for holistic safety profiling.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
              <span className="text-3xl font-black text-[#15803D] font-mono block mb-2">Instant</span>
              <h4 className="text-sm font-bold text-[#1E293B]">Automated SMS Warning</h4>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Debounced emergency notifications dispatched to registered civic subscribers upon confirmed parameter breach.
              </p>
            </div>
          </div>

          {/* FAQ Sub-Section with ID #help for anchor navigation */}
          <div className="max-w-4xl mx-auto" id="help">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold font-heading text-[#1E293B]">
                Frequently Asked Questions
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Common questions regarding sensors, alert thresholds, and civic usage.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#BAE6FD] overflow-hidden bg-white shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1E293B] hover:bg-[#F0FAFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#0284C7] text-lg font-bold shrink-0">
                      {activeFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {activeFaq === idx && (
                    <div className="p-4 sm:p-5 pt-0 text-xs text-[#475569] leading-relaxed border-t border-[#BAE6FD]/60 bg-[#F0FAFF]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CONTACT & INQUIRY FORM (DIRECTLY AFTER FACTS & CONTEXT)
          ========================================================================= */}
      <section id="contact" className="py-20 lg:py-24 bg-gradient-to-b from-[#E0F7FF]/50 via-[#F0FAFF] to-white border-b border-[#BAE6FD] scroll-mt-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Inquiries & Contact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              Contact the JalDrishti Research Team
            </h2>
            <p className="text-sm text-[#475569] mt-2 leading-relaxed">
              Acropolis Institute of Technology and Research, Bypass Road, Square, Manglaya Sadak, Indore, Madhya Pradesh — 453771, India • <a href="https://www.aitr.ac.in/" target="_blank" rel="noreferrer" className="text-[#0284C7] hover:underline font-semibold">aitr.ac.in</a>
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#BAE6FD] shadow-lg">
            {contactSubmitted ? (
              <div className="p-6 sm:p-8 rounded-xl bg-[#DDF8E8] border border-[#A7F3D0] text-center space-y-4">
                <CheckCircleIcon className="w-10 h-10 text-[#15803D] mx-auto" />
                <h3 className="text-base font-bold text-[#15803D]">Inquiry Confirmed & Persisted</h3>

                {contactReferenceId && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#A7F3D0] text-[#15803D] font-mono text-xs font-bold shadow-xs">
                    <span className="text-[#475569] font-sans font-semibold">Reference ID:</span>
                    <span>{contactReferenceId}</span>
                  </div>
                )}

                <p className="text-xs text-[#15803D] leading-relaxed max-w-lg mx-auto">
                  {contactSuccessMsg || 'Thank you for reaching out. Your inquiry has been securely stored in MongoDB and queued for Administrator review.'}
                </p>

                <div className="p-3 bg-white/90 rounded-xl border border-[#A7F3D0] text-[11px] text-[#475569] max-w-md mx-auto space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1E293B]">Initial Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#0284C7]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                      New
                    </span>
                  </div>
                  {submittedEmail && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1E293B]">Response Destination:</span>
                      <span className="font-mono text-[#1E293B] truncate max-w-[220px]">{submittedEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1E293B]">Recorded In:</span>
                    <span className="text-[#475569]">JalDrishti Central Database</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactSuccessMsg('');
                      setContactReferenceId('');
                    }}
                    className="text-xs font-semibold text-[#15803D] hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                {contactError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                    <span>{contactError}</span>
                    <button
                      type="button"
                      onClick={() => setContactError('')}
                      className="ml-2 font-bold hover:text-rose-900 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#334155] mb-1" htmlFor="contact-name">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Dr. Anikesh Jain"
                      disabled={contactLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#BAE6FD] text-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-60 bg-[#F0FAFF]/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#334155] mb-1" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="you@institution.edu"
                      disabled={contactLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#BAE6FD] text-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-60 bg-[#F0FAFF]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] mb-1" htmlFor="contact-subject">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. IoT Sensor Calibration Inquiry"
                    disabled={contactLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#BAE6FD] text-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-60 bg-[#F0FAFF]/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#334155] mb-1" htmlFor="contact-message">
                    Message * (Min 10 characters)
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Write your inquiry or feedback here..."
                    disabled={contactLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#BAE6FD] text-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8] disabled:opacity-60 bg-[#F0FAFF]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#0284C7] hover:bg-[#0369A1] transition-all shadow-md shadow-[#0284C7]/20 disabled:opacity-60 cursor-pointer"
                >
                  {contactLoading ? 'Sending Inquiry...' : 'Send Inquiry to Research Team'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. GOVERNANCE, TERMS OF SERVICE & FINAL CTA
          ========================================================================= */}
      <section id="privacy" className="py-16 bg-white border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Privacy Policy */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider block">
              Governance & Compliance
            </span>
            <h2 className="text-2xl font-bold font-heading text-[#1E293B]">Privacy Policy</h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              JalDrishti is designed with civic data privacy by default. Passwords are cryptographically hashed using bcrypt with salt rounds before database persistence. No personally identifiable sensor telemetry is shared externally. Phone numbers provided for SMS emergency alerts are utilized strictly for threshold breach notifications and are never disclosed to third parties.
            </p>
          </div>

          {/* Terms of Service */}
          <div className="space-y-3 pt-6 border-t border-[#BAE6FD]" id="terms">
            <h2 className="text-2xl font-bold font-heading text-[#1E293B]">Terms of Service & Research Disclaimer</h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              JalDrishti is developed as an academic engineering prototype (JalDrishti — CS506 Minor Project, Acropolis Institute of Technology and Research, Indore). Sensor telemetry and AI image screening results are provided for indicative awareness and research evaluation. They do not constitute statutory water certification. For official public health drinking water certifications, consult municipal authorities and accredited laboratory testing facilities.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION SECTION (DIRECTLY PRECEDING FOOTER) */}
      <section className="py-16 bg-gradient-to-br from-[#0369A1] via-[#0284C7] to-[#38BDF8] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-white drop-shadow-sm">
            Ready to Explore Community Water Quality?
          </h2>
          <p className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed">
            Experience real-time telemetry, interactive geographical maps, and AI-powered water sample screening.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/citizen"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-white text-[#0284C7] hover:bg-[#F0FAFF] shadow-lg shadow-black/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Launch Citizen Portal →
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-all text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
