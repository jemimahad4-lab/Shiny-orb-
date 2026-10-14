import React, { useState } from 'react';
import { X, Navigation, Shield, Flame, Zap, Award, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { sound } from '../utils/audio';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "CONTROLS & MOVEMENT",
      description: "Navigate your drone with razor-sharp reflexes.",
      items: [
        { label: "Mobile Touch", desc: "Drag your thumb anywhere on the screen to guide your drone fluidly." },
        { label: "Desktop Keys", desc: "Use WASD, Arrow keys, or follow your mouse cursor." },
        { label: "Emergency Dash", desc: "Tap the DASH button (or Spacebar / Double-tap) to burst forward with brief invulnerability!" }
      ],
      icon: <Navigation className="w-8 h-8 text-sky-400" />
    },
    {
      title: "SPIKES & OBSTACLES",
      description: "Survival requires reading danger patterns ahead.",
      items: [
        { label: "Standard Spikes", desc: "Fall straight down or float in steady hazard trajectories." },
        { label: "Homing Mines", desc: "Target your drone position and track your maneuvers. Evade sharply!" },
        { label: "Laser Beams", desc: "Telegraph red warning lanes across the arena before firing lethal pulses." },
        { label: "Bouncing Orbs", desc: "Ricochet off the arena walls at high velocity." }
      ],
      icon: <Flame className="w-8 h-8 text-rose-400" />
    },
    {
      title: "POWER-UPS & BOOSTS",
      description: "Collect floating capsules to tilt survival in your favor.",
      items: [
        { label: "Energy Shield", desc: "Absorbs one collision hit without losing a heart." },
        { label: "Slow Motion", desc: "Dilates temporal flow, making high-speed spikes 50% slower." },
        { label: "Coin Magnet", desc: "Pulls nearby gold coins directly into your hull." },
        { label: "Overcharge Invincibility", desc: "Render your drone completely immune to all hazards." }
      ],
      icon: <Shield className="w-8 h-8 text-emerald-400" />
    },
    {
      title: "COMBOS & PROGRESSION",
      description: "Perform near-misses and unlock elite gear.",
      items: [
        { label: "Near-Miss Combos", desc: "Skim dangerously close to spikes without touching to build up multiplier streaks up to x5!" },
        { label: "Unlock Cosmetics", desc: "Use collected gold coins in the Hangar to unlock 8 custom drones & 6 atmospheric themes." },
        { label: "30 Sector Campaign", desc: "Complete specialized level objectives to collect all 90 campaign stars." }
      ],
      icon: <Sparkles className="w-8 h-8 text-amber-400" />
    }
  ];

  const current = slides[slide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {current.icon}
            <div>
              <h2 className="font-['Chakra_Petch'] text-lg font-bold text-white">
                {current.title}
              </h2>
              <span className="text-xs text-slate-400">Step {slide + 1} of {slides.length}</span>
            </div>
          </div>
          <button
            id="tutorial-close-btn"
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <p className="text-xs text-slate-300 font-medium">
          {current.description}
        </p>

        <div className="flex flex-col gap-2.5">
          {current.items.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col">
              <span className="font-bold text-xs text-sky-400 font-['Chakra_Petch']">
                {item.label}
              </span>
              <span className="text-xs text-slate-300 mt-0.5">
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination Dots & Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${
                  i === slide ? 'w-6 bg-sky-500' : 'bg-slate-700'
                }`} 
              />
            ))}
          </div>

          <div className="flex gap-2">
            {slide > 0 && (
              <button
                onClick={() => {
                  sound.playButton();
                  setSlide(s => s - 1);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-750 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {slide < slides.length - 1 ? (
              <button
                onClick={() => {
                  sound.playButton();
                  setSlide(s => s + 1);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playButton();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 flex items-center gap-1"
              >
                <span>Got It!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
