import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreTheme } from '../context/StoreThemeContext';

const BADGE_BG = {
  pleno: '#196b41',
  nutri: '#7A1838',
};

export default function CartIcon({ isLight = false }) {
  const { itemCount, setDrawerOpen } = useCart();
  const { theme } = useStoreTheme();
  const badgeBg = BADGE_BG[theme] ?? BADGE_BG.pleno;
  const hoverColor = theme === 'nutri' ? 'hover:text-nutri-rose' : 'hover:text-pleno-green';

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Carrito — ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150 focus:outline-none ${
        isLight ? 'text-white hover:text-white/80' : `text-primary ${hoverColor}`
      }`}
    >
      <ShoppingBag size={22} strokeWidth={1.75} />

      {itemCount > 0 && (
        <span
          style={{ backgroundColor: badgeBg }}
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-body font-bold leading-none shadow-sm"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
