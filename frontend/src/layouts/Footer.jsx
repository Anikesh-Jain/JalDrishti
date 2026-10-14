import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo, { BrandLogoLink } from '../components/common/Logo';
import api from '../services/api';

/**
 * JalDrishti Application Footer (REM-11 / DEC-21)
 *
 * Recreates the exact footer from the reference image:
 * - Oceanic water ripple texture backdrop
 * - JalDrishti logo & tagline
 * - Navigation columns (About, Monitoring, Resources, Support)
 * - Academic attribution: JalDrishti — CS506 Minor Project, Acropolis Institute of Technology and Research, Indore
 * - Live backend API status pill
 * - Statutory public health advisory
 */
export default function Footer() {
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const res = await api.admin.getHealth();
        if (mounted) {
          setApiOnline(res?.status === 'ok' || res?.database === 'connected');
        }
      } catch {
        if (mounted) {
          setApiOnline(false);
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="relative bg-gradient-to-b from-[#F0FAFF] via-white to-[#E0F7FF] text-[#475569] overflow-hidden border-t border-[#BAE6FD]">
      {/* Background Water Ripple Texture Overlay with visible pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center mix-blend-multiply"
        style={{ backgroundImage: `url('/images/footer-water.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#E0F7FF]/40 via-transparent to-white/40 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-10 border-b border-[#BAE6FD]">
          {/* Brand Col (2 cols wide) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogoLink size={40} dark={false} tagline={true} />
            <p className="text-xs text-[#475569] leading-relaxed max-w-sm">
              Continuous IoT-based multi-parameter water quality monitoring and automated early warning system. Empowering communities with actionable safety telemetry.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#BAE6FD] text-[11px] text-[#334155] shadow-xs">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>System Status: <strong className={apiOnline ? 'text-emerald-700' : 'text-rose-600'}>{apiOnline ? 'API Online' : 'API Degraded'}</strong></span>
            </div>
          </div>

          {/* Col 1: About */}
          <div>
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-3">About</h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li><a href="/#overview" className="hover:text-[#0284C7] transition-colors">Project Overview</a></li>
              <li><a href="/#mission" className="hover:text-[#0284C7] transition-colors">Our Mission</a></li>
              <li><a href="/#contact" className="hover:text-[#0284C7] transition-colors">Research Team</a></li>
              <li><a href="/#contact" className="hover:text-[#0284C7] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Col 2: Monitoring */}
          <div>
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-3">Monitoring</h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li><Link to="/citizen" className="hover:text-[#0284C7] transition-colors">Real-Time Data</Link></li>
              <li><Link to="/citizen/map" className="hover:text-[#0284C7] transition-colors">Station Map</Link></li>
              <li><Link to="/citizen/trends" className="hover:text-[#0284C7] transition-colors">Water Quality Parameters</Link></li>
              <li><Link to="/citizen/alerts" className="hover:text-[#0284C7] transition-colors">Alerts</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li><a href="/#docs" className="hover:text-[#0284C7] transition-colors">Documentation</a></li>
              <li><a href="/#help" className="hover:text-[#0284C7] transition-colors">User Guide</a></li>
              <li><a href="/#docs" className="hover:text-[#0284C7] transition-colors">API Reference</a></li>
              <li><a href="/#research" className="hover:text-[#0284C7] transition-colors">Research Papers</a></li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-3">Support</h4>
            <ul className="space-y-2 text-xs text-[#475569]">
              <li><a href="/#help" className="hover:text-[#0284C7] transition-colors">Help Center</a></li>
              <li><a href="/#contact" className="hover:text-[#0284C7] transition-colors">Contact Us</a></li>
              <li><a href="/#privacy" className="hover:text-[#0284C7] transition-colors">Privacy Policy</a></li>
              <li><a href="/#terms" className="hover:text-[#0284C7] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
          <div>
            <p className="font-semibold text-[#1E293B]">
              © 2026 JalDrishti — CS506 Minor Project | Acropolis Institute of Technology and Research, Indore
            </p>
            <p className="text-[11px] text-[#475569] mt-0.5">
              Clean Water, Safer Tomorrow • Advisory Prototype Only
            </p>
          </div>

          {/* Social Icons matching reference UI */}
          <div className="flex items-center gap-4 text-[#475569]">
            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0284C7] transition-colors"
              aria-label="GitHub repository"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0284C7] transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0284C7] transition-colors"
              aria-label="Twitter / X"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0284C7] transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
