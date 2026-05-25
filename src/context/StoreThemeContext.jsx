import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

/**
 * Global store-theme context. Controls the visual palette of the shared
 * chrome (Navbar, Footer, CartIcon, CartDrawer) when navigating between
 * Pleno (suplementos) and Nutrigabrielare (digital + servicios).
 *
 * Possible values:
 *   - 'pleno' → deep-green editorial palette
 *   - 'nutri' → rose nutri palette
 *   - null    → default brand palette (used on /, /fluir-femenino, etc.)
 *
 * The flow rule is: each storefront sets its own theme; product detail
 * pages set the theme based on the product kind they load. Other public
 * pages (home, contact, fluir-femenino) leave it null.
 */
const StoreThemeContext = createContext({
  theme: null,
  setTheme: () => {},
});

export function StoreThemeProvider({ children }) {
  const [theme, setThemeState] = useState(null);

  const setTheme = useCallback((next) => {
    setThemeState((prev) => (prev === next ? prev : next));
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return (
    <StoreThemeContext.Provider value={value}>
      {children}
    </StoreThemeContext.Provider>
  );
}

export function useStoreTheme() {
  return useContext(StoreThemeContext);
}
