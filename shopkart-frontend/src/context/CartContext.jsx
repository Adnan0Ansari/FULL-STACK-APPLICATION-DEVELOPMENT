import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await api.get("/cart");
      setCartItems(res.data.cart);
      setUnauthorized(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
        setUnauthorized(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const runMutation = async (productId, request) => {
    setPendingIds((prev) => [...prev, productId]);

    try {
      const res = await request();
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Something went wrong. Please try again.",
      };
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const addToCart = (productId) =>
    runMutation(productId, () => api.post(`/cart/${productId}`));

  const updateQuantity = (productId, quantity) =>
    runMutation(productId, () => api.patch(`/cart/${productId}`, { quantity }));

  const removeFromCart = (productId) =>
    runMutation(productId, () => api.delete(`/cart/${productId}`));

  const clearCart = () => {
    setCartItems([]);
  };

  const resetCart = () => {
    setCartItems([]);
    setUnauthorized(true);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        unauthorized,
        pendingIds,
        cartCount,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}