import React from 'react';

// ─── Color Selector ────────────────────────────────────────────────────────────

/**
 * Circular color swatch picker.
 * @param {{ colors: {name: string, hex: string}[], selected: string, onSelect: (name: string) => void }} props
 */
export function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-xs font-semibold tracking-widest uppercase text-primary/50">
        Color
      </span>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => {
          const isActive = selected === c.name;
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onSelect(c.name)}
              style={{ backgroundColor: c.hex }}
              className={[
                'w-8 h-8 rounded-full transition-all duration-150 focus:outline-none',
                isActive
                  ? 'border-2 border-accent ring-2 ring-accent/30 scale-110'
                  : 'border-2 border-transparent hover:scale-105',
              ].join(' ')}
              aria-label={c.name}
              aria-pressed={isActive}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Size Selector ─────────────────────────────────────────────────────────────

/**
 * Size button grid.
 * @param {{ sizes: string[], selected: string, onSelect: (size: string) => void }} props
 */
export function SizeSelector({ sizes, selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-xs font-semibold tracking-widest uppercase text-primary/50">
        Talla
      </span>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isActive = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              className={[
                'w-11 h-11 rounded-xl font-body text-sm transition-all duration-150 focus:outline-none',
                isActive
                  ? 'border-2 border-accent bg-accent/5 font-bold text-primary'
                  : 'border border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
