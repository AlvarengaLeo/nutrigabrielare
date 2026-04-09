import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartIcon({ isLight = false }) {
  const { itemCount, setDrawerOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Carrito — ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150 focus:outline-none ${
        isLight ? 'text-background hover:text-white' : 'text-primary hover:text-accent'
      }`}
    >
      <ShoppingBag size={22} strokeWidth={1.75} />

      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-body font-bold leading-none shadow-sm">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
