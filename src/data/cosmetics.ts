import { CharacterConfig, ThemeConfig } from '../types/game';

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'classic',
    name: 'Aero',
    description: 'The standard issue agile drone. Well-balanced and responsive.',
    price: 0,
    colors: {
      primary: '#38bdf8', // sky-400
      secondary: '#0284c7', // sky-600
      glow: '#0ea5e9',
      trail: 'rgba(56, 189, 248, 0.4)'
    },
    shape: 'circle',
    perkDescription: 'Standard responsive handling'
  },
  {
    id: 'neon',
    name: 'Pulse',
    description: 'Synthesized high-frequency energy core radiating pure neon light.',
    price: 150,
    colors: {
      primary: '#22c55e', // green-500
      secondary: '#15803d',
      glow: '#4ade80',
      trail: 'rgba(74, 222, 128, 0.5)'
    },
    shape: 'diamond',
    perkDescription: 'Enhanced visibility in dark zones'
  },
  {
    id: 'fire',
    name: 'Ignis',
    description: 'Forged in volcanic depths. Leaves a fiery thermal wake.',
    price: 300,
    colors: {
      primary: '#f97316', // orange-500
      secondary: '#dc2626', // red-600
      glow: '#fb923c',
      trail: 'rgba(249, 115, 22, 0.5)'
    },
    shape: 'shield',
    perkDescription: 'Blazing flame aura trail'
  },
  {
    id: 'ice',
    name: 'Glacier',
    description: 'Carved from unbreakable eternal permafrost. Crisp and cold.',
    price: 450,
    colors: {
      primary: '#67e8f9', // cyan-300
      secondary: '#06b6d4', // cyan-500
      glow: '#a5f3fc',
      trail: 'rgba(103, 232, 249, 0.5)'
    },
    shape: 'star',
    perkDescription: 'Sparkling snowflake emission'
  },
  {
    id: 'cyber',
    name: 'Vektor',
    description: 'Sub-nanosecond cybernetic scout running overclocked microcode.',
    price: 650,
    colors: {
      primary: '#e879f9', // fuchsia-400
      secondary: '#a21caf',
      glow: '#f0abfc',
      trail: 'rgba(232, 121, 249, 0.5)'
    },
    shape: 'cube',
    perkDescription: 'Digital holographic matrix'
  },
  {
    id: 'galaxy',
    name: 'Cosmos',
    description: 'Infused with the gravitational stardust of an ancient nebula.',
    price: 900,
    colors: {
      primary: '#818cf8', // indigo-400
      secondary: '#4338ca',
      glow: '#a5b4fc',
      trail: 'rgba(129, 140, 248, 0.5)'
    },
    shape: 'hexagon',
    perkDescription: 'Celestial orbital starlight'
  },
  {
    id: 'shadow',
    name: 'Phantom',
    description: 'Mysterious stealth construct that slips like smoke between spikes.',
    price: 1200,
    colors: {
      primary: '#c084fc', // purple-400
      secondary: '#581c87',
      glow: '#9333ea',
      trail: 'rgba(147, 51, 234, 0.5)'
    },
    shape: 'diamond',
    perkDescription: 'Dark matter smoke wake'
  },
  {
    id: 'golden',
    name: 'Midas',
    description: 'Pure aurum chassis crafted for the true arcade sovereign.',
    price: 2000,
    colors: {
      primary: '#facc15', // yellow-400
      secondary: '#ca8a04', // yellow-600
      glow: '#fef08a',
      trail: 'rgba(250, 204, 21, 0.6)'
    },
    shape: 'star',
    perkDescription: 'Prestige golden coin sparkle aura'
  }
];

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic',
    name: 'Classic Arcade',
    tagline: 'Retro high-voltage arcade hall',
    price: 0,
    bgGradient: ['#0f172a', '#020617'],
    ambientColor: '#38bdf8',
    gridColor: 'rgba(56, 189, 248, 0.08)',
    particleColors: ['#38bdf8', '#818cf8', '#34d399']
  },
  {
    id: 'night',
    name: 'Midnight Sky',
    tagline: 'Starlit celestial nightscape with shooting stars',
    price: 150,
    bgGradient: ['#090d16', '#030712'],
    ambientColor: '#6366f1',
    gridColor: 'rgba(99, 102, 241, 0.06)',
    particleColors: ['#ffffff', '#e0e7ff', '#a5b4fc']
  },
  {
    id: 'fire',
    name: 'Inferno Valley',
    tagline: 'Molten magma chambers and floating embers',
    price: 250,
    bgGradient: ['#1f0b08', '#0d0302'],
    ambientColor: '#ea580c',
    gridColor: 'rgba(234, 88, 12, 0.1)',
    particleColors: ['#f97316', '#ef4444', '#fbbf24']
  },
  {
    id: 'ice',
    name: 'Glacial Cavern',
    tagline: 'Sub-zero frozen realm with falling snowflakes',
    price: 350,
    bgGradient: ['#081826', '#020b12'],
    ambientColor: '#06b6d4',
    gridColor: 'rgba(6, 182, 212, 0.08)',
    particleColors: ['#ffffff', '#a5f3fc', '#67e8f9']
  },
  {
    id: 'neon',
    name: 'Neon Horizon',
    tagline: 'Synthwave grid with pulsating laser highways',
    price: 500,
    bgGradient: ['#180928', '#08020e'],
    ambientColor: '#d946ef',
    gridColor: 'rgba(217, 70, 239, 0.12)',
    particleColors: ['#f43f5e', '#a855f7', '#06b6d4']
  },
  {
    id: 'cyber',
    name: 'Cyber Void',
    tagline: 'Deep digital matrix with scanlines & data stream',
    price: 750,
    bgGradient: ['#03140e', '#010805'],
    ambientColor: '#10b981',
    gridColor: 'rgba(16, 185, 129, 0.12)',
    particleColors: ['#10b981', '#34d399', '#6ee7b7']
  }
];
