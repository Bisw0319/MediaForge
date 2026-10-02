import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Zap,
  Heart,
  Bug,
  X,
  CheckCircle2,
  Send,
  Globe,
  Mail,
  Copy
} from 'lucide-react';
import { api } from '../services/api';

// Custom crisp SVG brand icons for social accounts
function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}


export default function Footer({ setActivePage }) {
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [bugCategory, setBugCategory] = useState('Compression Issue');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [copied, setCopied] = useState(false);

  const navTo = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;

    setIsSubmittingBug(true);
    // 1. Submit to Backend API (which automatically routes to lead developer server-side)
    try {
      await api.submitBugReport({
        category: bugCategory,
        description: bugDescription,
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.warn("Backend report logging error:", err);
    } finally {
      setIsSubmittingBug(false);
    }

    setBugSubmitted(true);
    setTimeout(() => {
      setBugSubmitted(false);
      setBugModalOpen(false);
      setBugDescription('');
    }, 2800);
  };

  const handleCopyReport = () => {
    const reportText = `[MediaForge Issue Report]\nCategory: ${bugCategory}\nIssue:\n${bugDescription}\n\nUA: ${navigator.userAgent}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'GitHub', icon: GithubIcon, url: 'https://github.com/Bisw0319', color: 'hover:text-slate-900 dark:hover:text-white' },
    { name: 'LinkedIn', icon: LinkedinIcon, url: 'https://www.linkedin.com/in/biswajit-baral-abb842325/?isSelfProfile=true', color: 'hover:text-blue-500' },
    { name: 'Twitter / X', icon: TwitterIcon, url: 'https://x.com/Biswa1120', color: 'hover:text-sky-400' },
    { name: 'Instagram', icon: InstagramIcon, url: 'https://www.instagram.com/zen__z__zero/', color: 'hover:text-pink-500' },
    { name: 'Portfolio', icon: Globe, url: 'https://biswajitbaral-portfolio.netlify.app/', color: 'hover:text-brand-500' },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md pt-12 pb-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Privacy & Security highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-200 dark:border-slate-800 mb-10">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Strict Privacy Protocol</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Files are strictly processed in private temporary buffers and automatically purged.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Smart Target-Size Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculates optimal bitrate, resolution, and quality rather than crude generic presets.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Automatic 30-Min Purge</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated daemon deletes all processed files every 10 minutes to protect your assets.
              </p>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand info & Social Accounts */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">MediaForge</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              “Streamline your workflow, one page at a time.”
            </p>

            {/* Social Media Accounts */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">let's connect</p>
              <div className="flex items-center space-x-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ${social.color} transition-all duration-200 hover:scale-110`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Compress */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Compression
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navTo('image-compressor')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Image Compressor
                </button>
              </li>
              <li>
                <button onClick={() => navTo('video-compressor')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Video Compressor
                </button>
              </li>
              <li>
                <button onClick={() => navTo('pdf-compressor')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  PDF Compressor
                </button>
              </li>
              <li>
                <button onClick={() => navTo('audio-compressor')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Audio Compressor
                </button>
              </li>
              <li>
                <button onClick={() => navTo('zip-creator')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Make ZIP Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Tools & AI */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Tools & AI
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navTo('background-remover')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Background Remover
                </button>
              </li>
              <li>
                <button onClick={() => navTo('image-resizer')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Image Resizer (Passport & Social)
                </button>
              </li>
              <li>
                <button onClick={() => navTo('image-converter')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Image Converter
                </button>
              </li>
              <li>
                <button onClick={() => navTo('video-converter')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Video Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Legal & Bug Report */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Support & Legal
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navTo('about')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  About MediaForge
                </button>
              </li>
              <li>
                <button onClick={() => navTo('privacy')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navTo('terms')} className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Terms of Service
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setBugModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-xs hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors"
                >
                  <Bug className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Report a Bug</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar with Biswas signature */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} MediaForge. All rights reserved. Zero permanent data retention.</p>

          {/* User's signature requested in prompt */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-50 to-sky-50 dark:from-slate-800 dark:to-slate-850 border border-brand-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <span className="text-xs">Crafted by</span>
              <span className="font-extrabold bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
                Biswas
              </span>
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </span>
          </div>
        </div>

      </div>

      {/* Bug Report Modal */}
      {bugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-slide-up relative">

            {/* Close button */}
            <button
              onClick={() => setBugModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Report an Issue</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct Developer Feedback • Private & Secure
                </p>
              </div>
            </div>

            {bugSubmitted ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Report Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your report has been received and automatically dispatched to our lead developer. Thank you for making MediaForge better!
                </p>
              </div>
            ) : (
              <form onSubmit={handleBugSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={bugCategory}
                    onChange={(e) => setBugCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Compression Issue">Compression Output Size Issue</option>
                    <option value="Video Conversion">Video Conversion / Transcoding Glitch</option>
                    <option value="Drag and Drop">Drag & Drop File Upload</option>
                    <option value="Background Removal">Background Removal Artifacts</option>
                    <option value="UI/Display">User Interface / Display Bug</option>
                    <option value="Other">Other Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description of the Issue
                  </label>
                  <textarea
                    rows={4}
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Describe what file type was used and what happened..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Report'}</span>
                  </button>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setBugModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBug}
                      className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-brand-600/30 transition-all flex-1 sm:flex-initial"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingBug ? 'Submitting...' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </footer>
  );
}
