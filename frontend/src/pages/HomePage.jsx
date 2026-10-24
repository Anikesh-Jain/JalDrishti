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
import {
  Stage1SensorVisual,
  Stage2WifiBlynkVisual,
  Stage3BackendVisual,
  Stage4WebAppVisual
} from '../components/home/ArchitectureVisuals';

/**
 * JalDrishti Public Landing Page
 *
 * Section Sequence (Strict Requirement):
 * 1. Landing / Hero (#hero)
 * 2. Overview (#overview, #mission)
 * 3. Indicators (#indicators)
 * 4. Architecture (#how-it-works)
 * 5. FAQ (#faq, #help)
 * 6. Contact (#contact)
 * 7. Governance / Terms (#privacy, #terms) & CTA -> Footer (via AppLayout)
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
      q: 'What is JalDrishti and how does it work?',
      a: 'JalDrishti is an IoT-based water quality monitoring platform designed to make water quality information transparent, accessible, and easy to interpret. It pairs ready-made sensor devices installed in community or household distribution lines with an intuitive web application. The platform continuously ingests telemetry, tracks historical trends, detects unusual deviations against reference benchmarks, provides interactive GIS station maps, and generates downloadable reports. Citizens can monitor community water sources and receive timely advisories.'
    },
    {
      q: 'What does the ready-made sensor device measure?',
      a: 'The ready-made hardware unit measures four fundamental physical and chemical indicators: Hydrogen-ion concentration (pH), Optical Turbidity (in NTU), Total Dissolved Solids (TDS in ppm / mg/L), and Water Temperature (in °C). The unit is pre-assembled and enclosed for inline plumbing or tank deployment, eliminating any manual breadboarding or wiring by the user.'
    },
    {
      q: 'What do pH, turbidity, TDS, and temperature indicate?',
      a: 'Each parameter provides distinct insight into water conditions: pH measures acidity or basicity (affecting pipe corrosion, metallic leaching, and chlorine disinfection efficacy); Turbidity measures cloudiness from suspended micro-particles, silt, or colloidal organic matter (a key operational indicator of filtration integrity or distribution disturbance); TDS measures total inorganic mineral salts (calcium, magnesium, chloride, sulfates) and dissolved matter that influence taste and hardness; and Water Temperature influences biochemical activity and dissolved oxygen dynamics.'
    },
    {
      q: 'Which water quality standards and reference thresholds does JalDrishti use?',
      a: 'JalDrishti aligns its reference thresholds with the Bureau of Indian Standards (BIS IS 10500:2012 Drinking Water Specification) and World Health Organization (WHO) guidance: pH is evaluated against an acceptable range of 6.5 to 8.5; Turbidity uses an acceptable limit of ≤ 1.0 NTU with a permissible limit of ≤ 5.0 NTU in the absence of an alternate source; TDS uses an acceptable limit of ≤ 500 ppm (mg/L) and a permissible limit of ≤ 2000 ppm (with drinking desirability typically < 300 ppm); Temperature is tracked against typical ambient delivery ranges (10°C to 40°C). Note: JalDrishti reference thresholds provide operational early warning screening and trend awareness; they do NOT constitute certified laboratory or regulatory potability certification, which requires microbiological and toxicological laboratory testing.'
    },
    {
      q: 'How does the automated early warning and alert engine function?',
      a: 'As telemetry arrives via the ingestion pipeline, the backend threshold engine compares each parameter against the multi-tier reference limits. If any value exceeds acceptable or permissible boundaries, the system automatically registers an active breach, marks the station on the public map, renders clear warning indicators on citizen dashboards, and dispatches debounced SMS and notification alerts to subscribed community members to avoid repetitive alert spam.'
    },
    {
      q: 'How does the ready-made sensor device connect to the application?',
      a: 'The device connects via 2.4 GHz Wi-Fi using the ESP32-S3 microcontroller and the Blynk IoT cloud infrastructure. During initial setup, the device broadcasts a temporary local configuration network (SoftAP at 192.168.4.1). Citizens enter their local Wi-Fi credentials and device token directly in their web browser. Wi-Fi credentials remain strictly on the local device and are never sent to external servers. Once online, readings stream securely to Blynk and are routed into the JalDrishti database via configured webhooks.'
    },
    {
      q: 'What can citizens do if they do not have a sensor device?',
      a: 'Citizens do not need a personal sensor device to benefit from JalDrishti. Anyone can freely access the public portal to inspect active community monitoring stations on the interactive map, examine real-time and historical 4-parameter trend charts, download municipal water quality summaries, view real-time contamination alerts, and submit surface water photos for AI-assisted image screening.'
    },
    {
      q: 'What can AI water image screening determine, and what are its limitations?',
      a: 'The complementary AI screening tool uses Google Gemini Vision to conduct preliminary visual inspection of surface water photographs, identifying visible cues such as severe discoloration, heavy colloidal cloudiness, surface oil sheens, or algal blooms. However, AI image screening CANNOT detect dissolved chemical contaminants, microscopic bacteria, heavy metals (such as arsenic or lead), or odorless toxins. It serves exclusively as an auxiliary visual screening aid and never replaces physical probe telemetry or certified laboratory testing.'
    }
  ];

  return (
    <div className="bg-[#F0FAFF] text-[#334155] font-sans selection:bg-[#38BDF8] selection:text-white">
      {/* =========================================================================
          1. FULL-VIEWPORT HERO SECTION
          ========================================================================= */}
      <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden scroll-mt-16 border-b border-[#BAE6FD]">
        {/* Natural landscape background with selective readability scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/images/hero-water.jpg')` }}
        />
        {/* Directional scrim: darkens softly on the left for crisp heading contrast while preserving vivid visibility of the Himalayan lake, mountains, and trees across the page */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/40 to-transparent pointer-events-none" />
        {/* Soft top vignette */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
        {/* Softened bottom transition without heavy opaque white washing out the lake water and shoreline */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F0FAFF]/40 to-transparent pointer-events-none" />

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
      </section>

      {/* =========================================================================
          2. PROJECT OVERVIEW & MISSION (MUST BE IMMEDIATELY AFTER HERO)
          ========================================================================= */}
      <section id="overview" className="pt-8 pb-14 lg:pt-10 lg:pb-16 bg-[#F0FAFF] border-b border-[#BAE6FD] scroll-mt-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider">
                <DropletIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Platform Overview & Civic Mission</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight leading-tight" id="mission">
                Continuous Monitoring &amp; Civic Awareness: <br />
                <span className="text-[#0284C7]">The JalDrishti Platform</span>
              </h2>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
                JalDrishti is an IoT-based water quality monitoring platform designed to make water quality information easier to access and understand. It combines a ready-made sensor device that monitors parameters such as pH, turbidity, total dissolved solids (TDS), and temperature with a web application that presents readings, historical trends, alerts, maps, and reports.
              </p>

              <p className="text-sm text-[#475569] leading-relaxed">
                Citizens without a sensor device can also explore available water quality information and use AI-assisted image screening as a complementary feature. JalDrishti aims to support continuous monitoring, early awareness of unusual readings, and more transparent communication about water quality.
              </p>

              {/* Two Core Pillar Cards */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F7FF] text-[#0284C7] flex items-center justify-center font-bold text-xs mb-3">
                    <ActivityIcon className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Continuous Telemetry</h4>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Automated multi-parameter sensor updates every 30 seconds with immediate reference threshold checking.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#DDF8E8] text-[#15803D] flex items-center justify-center font-bold text-xs mb-3">
                    <ShieldCheckIcon className="w-4 h-4 text-[#15803D]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Community Early Warning</h4>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    Clear notifications and debounced alerts when unusual readings occur, providing early awareness across the distribution line.
                  </p>
                </div>
              </div>

              {/* Reference Standards Card */}
              <div className="p-4 rounded-xl bg-[#E0F7FF]/70 border border-[#BAE6FD] flex items-center gap-3 text-xs text-[#0369A1]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shrink-0" />
                <span>
                  <strong>Reference Thresholds:</strong> Operational limits reference Bureau of Indian Standards (BIS IS 10500:2012) guidelines for indicative monitoring, supporting early awareness alongside standard laboratory testing.
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
      <section id="how-it-works" className="py-16 lg:py-20 bg-[#F0FAFF] border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>System Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              How JalDrishti Works
            </h2>
            <p className="text-sm text-[#475569] mt-2.5 leading-relaxed">
              Visual progression of the implemented telemetry pipeline from inline sensing to the citizen portal.
            </p>
          </div>

          {/* Visual 4-Stage Architecture Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stage 1: Ready-Made Sensor Device */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-[#F0FAFF] border border-[#BAE6FD]/70 group-hover:border-[#38BDF8] transition-colors">
                  <Stage1SensorVisual className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                    Stage 1 • Hardware
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1E293B]">Ready-Made Sensor Device</h3>
                <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                  Factory-sealed inline probe collar installed in pipeline plumbing, continuously measuring pH, turbidity, TDS, and water temperature.
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-[#BAE6FD]/60 flex items-center justify-between text-[11px] text-[#0284C7] font-semibold">
                <span>pH • Turbidity • TDS • Temp</span>
                <span className="text-[#94A3B8] font-mono text-[10px]">01 →</span>
              </div>
            </div>

            {/* Stage 2: Wi-Fi and Blynk Integration */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-[#F0FAFF] border border-[#BAE6FD]/70 group-hover:border-[#38BDF8] transition-colors">
                  <Stage2WifiBlynkVisual className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                    Stage 2 • Connectivity
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1E293B]">Wi-Fi &amp; Blynk Telemetry</h3>
                <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                  ESP32-S3 microcontroller transmits readings over 2.4 GHz Wi-Fi through the configured Blynk IoT cloud and authenticated webhook path.
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-[#BAE6FD]/60 flex items-center justify-between text-[11px] text-[#0284C7] font-semibold">
                <span>2.4 GHz Wi-Fi • Webhook</span>
                <span className="text-[#94A3B8] font-mono text-[10px]">02 →</span>
              </div>
            </div>

            {/* Stage 3: Backend and Database */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-[#F0FAFF] border border-[#BAE6FD]/70 group-hover:border-[#38BDF8] transition-colors">
                  <Stage3BackendVisual className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                    Stage 3 • Backend
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1E293B]">Backend &amp; Database</h3>
                <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                  Node.js server verifies readings against BIS IS 10500 limits, triggers automated alerts, and securely persists records in MongoDB.
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-[#BAE6FD]/60 flex items-center justify-between text-[11px] text-[#15803D] font-semibold">
                <span>Threshold Engine • MongoDB</span>
                <span className="text-[#94A3B8] font-mono text-[10px]">03 →</span>
              </div>
            </div>

            {/* Stage 4: Web Application */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#BAE6FD] shadow-xs hover:border-[#38BDF8] hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-3.5 bg-[#F0FAFF] border border-[#BAE6FD]/70 group-hover:border-[#38BDF8] transition-colors">
                  <Stage4WebAppVisual className="w-full h-full" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DDF8E8] text-[#15803D] border border-[#A7F3D0]">
                    Stage 4 • Application
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1E293B]">Web Application</h3>
                <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                  Citizen web application presents live telemetry readings, 4-parameter trend charts, active warnings, GIS station maps, and reports.
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-[#BAE6FD]/60 flex items-center justify-between text-[11px] text-[#0284C7] font-semibold">
                <span>Trends • Maps • Alerts</span>
                <span className="text-[#94A3B8] font-mono text-[10px]">04 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FAQ (MERGED STANDARDS & FREQUENTLY ASKED QUESTIONS)
          ========================================================================= */}
      <section id="faq" className="py-20 lg:py-24 bg-white border-b border-[#BAE6FD] scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="help">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F7FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
              <span>Answers &amp; Guidelines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#1E293B] tracking-tight">
              FAQ
            </h2>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">
              Learn how JalDrishti works, what parameters and reference thresholds are monitored, and what citizens can explore with or without hardware.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#BAE6FD] overflow-hidden bg-white shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#1E293B] hover:bg-[#F0FAFF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] cursor-pointer"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <span className="w-6 h-6 rounded-full bg-[#E0F7FF] text-[#0284C7] flex items-center justify-center text-sm font-bold shrink-0">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-[#475569] leading-relaxed border-t border-[#BAE6FD]/60 bg-[#F0FAFF]/40 space-y-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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
