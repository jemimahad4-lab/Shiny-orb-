import React, { useState } from 'react';
import { X, Download, Package, FileCode, DollarSign, Globe, CheckCircle2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const handleDownload = (filename: string, label: string) => {
    sound.playPowerUp();
    setDownloadedItem(label);
    
    // Create an invisible link to trigger immediate browser download
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadedItem(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white tracking-wide">
                EXPORT GAME PACKAGES
              </h2>
              <span className="text-[11px] text-slate-400">
                Download ready-to-upload ZIP files for game portals & monetization
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-900/60">
          {downloadedItem && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Starting download for <strong>{downloadedItem}</strong>! Check your browser downloads.</span>
            </div>
          )}

          {/* Download Options */}
          <div className="space-y-3">
            {/* Option 1: Game Portal Ready Zip */}
            <div className="p-4 rounded-xl bg-slate-850/90 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        HTML5 Game Build (.ZIP)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                        Ready to Upload
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contains <code className="text-slate-200">index.html</code> and standalone assets. Upload directly to <strong>CrazyGames</strong>, <strong>itch.io</strong>, <strong>GameDistribution</strong>, or <strong>Poki</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload('game-portal-html5.zip', 'HTML5 Game Build (game-portal-html5.zip)')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Standalone HTML5 Game (.ZIP)</span>
              </button>
            </div>

            {/* Option 2: Full Source Code Zip */}
            <div className="p-4 rounded-xl bg-slate-850/90 border border-slate-700/80 hover:border-sky-500/60 transition-all flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        Full Source Code (.ZIP)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                        Developer Source
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete React 19 + TypeScript + Vite project. Perfect for editing gameplay, changing themes, or adding ad SDKs.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload('dodge-the-spikes-2-source.zip', 'Full Source Code (dodge-the-spikes-2-source.zip)')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 border border-sky-500/40 hover:border-sky-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Source Code (.ZIP)</span>
              </button>
            </div>

            {/* Option 3: Complete All-in-One Master Pack */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-200">
                  All-in-One Master Bundle
                </span>
                <p className="text-[11px] text-slate-400">
                  Includes both Source Code, Web Build & Monetization Guide in one file.
                </p>
              </div>
              <button
                onClick={() => handleDownload('dodge-the-spikes-2-complete-pack.zip', 'Complete Master Pack')}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ml-3"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Monetization & Portals Guide Cards */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Recommended Game Portals to Monetize</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>CrazyGames</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-normal">50% Rev-Share</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    30M+ monthly gamers. Submit the <code className="text-emerald-400">game-portal-html5.zip</code> directly in their Developer Portal.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  developer.crazygames.com
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>GameDistribution</span>
                    <span className="text-[10px] text-sky-400 font-mono font-normal">Global Syndication</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Syndicates to thousands of web publishers automatically with built-in ad monetization and monthly wire payouts.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  gamedistribution.com
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>itch.io</span>
                    <span className="text-[10px] text-pink-400 font-mono font-normal">Tips & Sales</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Create a project, upload the ZIP, check &quot;Play in browser&quot;, and receive direct donations or tips.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  itch.io/developers
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>Google AdSense (H5)</span>
                    <span className="text-[10px] text-amber-400 font-mono font-normal">Self-Hosted</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    If hosting on your own site, use AdSense for HTML5 Games to trigger interstitial & rewarded ads.
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  adsense.google.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
