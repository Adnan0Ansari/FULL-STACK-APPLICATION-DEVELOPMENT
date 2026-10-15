import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatPrice } from "../utils/format";

function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-xl mx-auto p-6 text-center">
        {loading && <p className="text-white">Loading order...</p>}

        {!loading && error && (
          <p className="text-red-400">Unable to load order details.</p>
        )}

        {!loading && !error && order && (
          <div className="bg-slate-800 rounded-lg p-8 flex flex-col gap-3 items-center">
            <p className="text-5xl">✅</p>
            <h1 className="text-white text-2xl font-bold">Order Placed Successfully</h1>
            <p className="text-slate-400 text-sm">Order ID</p>
            <p className="text-white break-all">{order._id}</p>
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-emerald-400 font-bold text-xl">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-slate-400 text-sm">Status</p>
            <p className="text-white">{order.status}</p>
            <p className="text-slate-300 mt-2">
              Your order has been saved successfully.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/orders")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate("/products")}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSuccess;