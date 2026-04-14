import React, { useState, useRef, useEffect } from 'react';
import {
  Heart, Activity, Brain, Leaf, Scale, HeartPulse, Carrot,
  Sparkles, Sun, Moon, Flame, Droplets, Apple, Zap, Eye,
  Shield, Star, Flower2, TreePine, ChevronDown,
} from 'lucide-react';

const ICONS = [
  { name: 'Heart', icon: Heart },
  { name: 'Activity', icon: Activity },
  { name: 'Brain', icon: Brain },
  { name: 'Leaf', icon: Leaf },
  { name: 'Scale', icon: Scale },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'Carrot', icon: Carrot },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Flame', icon: Flame },
  { name: 'Droplets', icon: Droplets },
  { name: 'Apple', icon: Apple },
  { name: 'Zap', icon: Zap },
  { name: 'Eye', icon: Eye },
  { name: 'Shield', icon: Shield },
  { name: 'Star', icon: Star },
  { name: 'Flower2', icon: Flower2 },
  { name: 'TreePine', icon: TreePine },
];

/**
 * Dropdown for selecting a Lucide icon by name.
 * @param {string} value — current icon name
 * @param {function} onChange — (iconName: string) => void
 */
export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = ICONS.find((i) => i.name === value) || ICONS[0];
  const SelectedIcon = selected.icon;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border border-primary/10 rounded-xl bg-white hover:border-primary/30 transition-colors text-sm font-body"
      >
        <SelectedIcon size={16} className="text-accent" />
        <span className="text-primary/70">{selected.name}</span>
        <ChevronDown size={14} className={`text-primary/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-primary/10 rounded-xl shadow-lg z-50 p-2 grid grid-cols-5 gap-1 w-56">
          {ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => { onChange(name); setOpen(false); }}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-accent/10 transition-colors ${
                value === name ? 'bg-accent/15 ring-1 ring-accent/30' : ''
              }`}
              title={name}
            >
              <Icon size={18} className={value === name ? 'text-accent' : 'text-primary/60'} />
              <span className="text-[10px] text-primary/40 leading-tight">{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ICONS };
