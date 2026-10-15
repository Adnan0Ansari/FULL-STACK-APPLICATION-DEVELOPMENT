import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, unauthorized, fetchCart, cartCount, subtotal } =
    useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (unauthorized) navigate("/login");
  }, [unauthorized, navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-white text-2xl font-bold mb-4">My Cart</h1>

        {loading && <p className="text-white">Loading your cart...</p>}

        {!loading && error && (
          <div className="text-center mt-10">
            <p className="text-red-400 mb-4">Unable to load your cart.</p>
            <button
              onClick={fetchCart}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-white text-xl mb-2">Your cart is empty 🛒</p>
            <p className="text-slate-400 mb-4">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <OrderSummary
              items={cartItems}
              itemCount={cartCount}
              total={subtotal}
              totalLabel="Subtotal"
            >
              <button
                onClick={() => navigate("/checkout")}
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-semibold"
              >
                Proceed to Checkout
              </button>
            </OrderSummary>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;