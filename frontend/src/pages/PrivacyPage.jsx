import React from 'react';
import { ShieldCheck, Lock, Clock, Trash2, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparent Security Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy & File Retention
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last revised: September 2026. Zero long-term storage. Zero third-party data broker sharing.
        </p>
      </div>

      {/* Core Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Clock className="w-6 h-6 text-brand-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">30-Minute Automatic Purge</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our background daemon inspects temporary directories every 10 minutes and wipes any file older than 30 minutes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Trash2 className="w-6 h-6 text-emerald-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Immediate Cleanup</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Temporary input files are scrubbed right after processing completes. You can also explicitly trigger instant deletion.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Lock className="w-6 h-6 text-purple-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Isolated Processing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Filenames are randomized via cryptographically secure UUIDs to eliminate path traversal and collisions.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            1. Temporary Processing Only
          </h2>
          <p>
            MediaForge operates strictly as an on-demand media processor. Your uploaded files are stored temporarily on backend ephemeral storage only for the duration required to execute your requested transformations (compressing, converting, resizing, or removing background).
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            2. How Deletion Works
          </h2>
          <p>
            We do not claim files are deleted without implementing the backend mechanism:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-500 dark:text-slate-400">
            <li>Uploaded raw source files are automatically unlinked once processing finishes.</li>
            <li>Processed output files reside in a temporary cache so you can preview and download them.</li>
            <li>An asynchronous lifespan daemon runs every 10 minutes, systematically unlinking and deleting any files with a modified timestamp older than 30 minutes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            3. No Data Training or Selling
          </h2>
          <p>
            Your images, videos, audio tracks, and documents are NEVER used to train machine learning models, are never indexed by web crawlers, and are never monetized, sold, or inspected by humans.
          </p>
        </div>

      </div>

    </div>
  );
}
