import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ─── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'nutri-cart';

// ─── Context ───────────────────────────────────────────────────────────────────

const CartContext = createContext(null);

// ─── Helper ────────────────────────────────────────────────────────────────────

/** Unique key per product+size+color combo */
function itemKey(productId, size, color) {
  return `${productId}__${size}__${color}`;
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Persist on every change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Add a product to the cart. Merges quantity if the same
   * product+size+color combo already exists.
   * @param {Object} product  — product object from PRODUCTS catalog
   * @param {string} size
   * @param {string} color    — color name string
   * @param {number} qty      — quantity to add (default 1)
   */
  const addItem = useCallback((product, size, color, qty = 1) => {
    setItems((prev) => {
      const key = itemKey(product.id, size, color);
      const nextImage = product.images?.[0] ?? null;
      const existing = prev.find(
        (i) => itemKey(i.productId, i.size, i.color) === key,
      );

      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.size, i.color) === key
            ? {
                ...i,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: nextImage ?? i.image ?? null,
                quantity: i.quantity + qty,
              }
            : i,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          size,
          color,
          quantity: qty,
          image: nextImage,
        },
      ];
    });

    setDrawerOpen(true);
  }, []);

  /**
   * Remove all entries matching product+size+color.
   */
  const removeItem = useCallback((productId, size, color) => {
    const key = itemKey(productId, size, color);
    setItems((prev) =>
      prev.filter((i) => itemKey(i.productId, i.size, i.color) !== key),
    );
  }, []);

  /**
   * Set an explicit quantity. Removes the item when qty <= 0.
   */
  const updateQuantity = useCallback((productId, size, color, qty) => {
    if (qty <= 0) {
      removeItem(productId, size, color);
      return;
    }
    const key = itemKey(productId, size, color);
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.productId, i.size, i.color) === key
          ? { ...i, quantity: qty }
          : i,
      ),
    );
  }, [removeItem]);

  /** Empty the cart completely. */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      drawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, subtotal, drawerOpen, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
