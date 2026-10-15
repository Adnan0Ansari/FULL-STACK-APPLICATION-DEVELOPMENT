import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { loadRazorpayScript } from "../services/razorpay";

const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "addressLine1", label: "Address", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "pincode", label: "Pincode", type: "text" },
];

const initialForm = FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});

function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    unauthorized,
    fetchCart,
    cartCount,
    subtotal,
    clearCart,
  } = useCart();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState("");
  const paymentCompleted = useRef(false);

  useEffect(() => {
    if (unauthorized) navigate("/login");
  }, [unauthorized, navigate]);

  useEffect(() => {
    if (
      !loading &&
      !error &&
      !unauthorized &&
      cartItems.length === 0 &&
      !paymentCompleted.current
    ) {
      navigate("/cart");
    }
  }, [loading, error, unauthorized, cartItems.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    FIELDS.forEach((f) => {
      if (!form[f.name].trim()) {
        newErrors[f.name] = `${f.label} is required.`;
      }
    });

    if (!newErrors.phone && !/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Phone must contain 10 digits.";
    }

    if (!newErrors.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Pincode must contain 6 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setPlacing(true);

    const shippingAddress = FIELDS.reduce(
      (acc, f) => ({ ...acc, [f.name]: form[f.name].trim() }),
      {}
    );

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError("Unable to load Razorpay. Check your connection and try again.");
        setPlacing(false);
        return;
      }

      const res = await api.post("/orders/create-payment-order", { shippingAddress });
      const data = res.data;

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        handler: async (response) => {
          try {
            await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            paymentCompleted.current = true;
            clearCart();
            navigate(`/order-success/${data.shopKartOrderId}`);
          } catch (err) {
            setServerError(
              err.response?.data?.message ||
                "Payment verification failed. Your cart has not been cleared."
            );
            setPlacing(false);
          }
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", async () => {
        setServerError("Payment failed. Your cart has not been cleared. Please try again.");
        try {
          await api.post("/orders/payment-failed", {
            shopKartOrderId: data.shopKartOrderId,
          });
        } catch (err) {
          // ignore
        }
      });

      paymentObject.open();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading checkout...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Unable to load your cart.</p>
        <button
          onClick={fetchCart}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-white text-2xl font-bold mb-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-slate-800 rounded-lg p-6 flex flex-col gap-4"
          >
            <h2 className="text-white text-xl font-bold">Shipping Details</h2>

            {FIELDS.map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-slate-300 text-sm">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="p-2 rounded bg-slate-700 text-white outline-none"
                />
                {errors[f.name] && (
                  <p className="text-red-400 text-sm">{errors[f.name]}</p>
                )}
              </div>
            ))}

            {serverError && <p className="text-red-400 text-sm">{serverError}</p>}

            <button
              type="submit"
              disabled={placing}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2 rounded font-semibold"
            >
              {placing ? "Processing..." : "Place Order"}
            </button>
          </form>

          <OrderSummary
            items={cartItems}
            itemCount={cartCount}
            total={subtotal}
            totalLabel="Total"
          />
        </div>
      </div>
    </div>
  );
}

export default Checkout;