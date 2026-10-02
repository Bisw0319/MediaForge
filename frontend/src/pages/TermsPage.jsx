import React from 'react';
import { FileCheck, Shield, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
          <FileCheck className="w-4 h-4 text-brand-500" />
          <span>Terms of Use</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using MediaForge, you agree to comply with and be bound by these terms. MediaForge provides automated media compression, conversion, resizing, and background removal tools.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            2. Acceptable Use
          </h2>
          <p>
            You agree not to upload malicious binaries, computer viruses, unlawful materials, or content that violates intellectual property laws. You retain full copyright and ownership of any media uploaded to MediaForge.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            3. Disclaimer of Exact Target Guarantee
          </h2>
          <p>
            MediaForge employs mathematical algorithms to approach user-specified target file sizes as closely as technically feasible while preserving acceptable perceptual fidelity. Because entropy varies greatly between raw textures and flat surfaces, actual compressed sizes may fall within a minor tolerance margin of the requested target.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            4. Service Availability
          </h2>
          <p>
            MediaForge is provided on an “as is” basis. While we strive for 99.9% uptime and fast processing throughput, we cannot guarantee uninterrupted access during scheduled maintenance windows.
          </p>
        </div>

      </div>

    </div>
  );
}
