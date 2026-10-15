import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-white text-2xl font-bold mb-4">My Orders</h1>

        {loading && <p className="text-white">Loading your orders...</p>}

        {!loading && error && (
          <div className="text-center mt-10">
            <p className="text-red-400 mb-4">Unable to load your orders.</p>
            <button
              onClick={fetchOrders}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-white text-xl mb-4">
              You have not placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;