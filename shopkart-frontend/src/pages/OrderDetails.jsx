import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatPrice, formatDate } from "../utils/format";

function OrderDetails() {
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

      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate("/orders")}
          className="text-slate-400 hover:text-white mb-4"
        >
          ← Back to My Orders
        </button>

        {loading && <p className="text-white">Loading order...</p>}

        {!loading && error && (
          <p className="text-red-400">Unable to load this order.</p>
        )}

        {!loading && !error && order && (
          <div className="bg-slate-800 rounded-lg p-6 flex flex-col gap-4">
            <div className="flex justify-between flex-wrap gap-2">
              <h1 className="text-white text-xl font-bold">
                Order #{order._id.slice(-8)}
              </h1>
              <span className="text-slate-400 text-sm">
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="text-slate-300 text-sm">
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentStatus}</p>
            </div>

            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-3 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white">{item.name}</p>
                    <p className="text-slate-400 text-sm">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-emerald-400 font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <hr className="border-slate-700" />

            <div className="text-slate-300 text-sm">
              <p className="text-white font-semibold mb-1">Shipping Address</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
              </p>
            </div>

            <p className="text-white font-bold text-lg text-right">
              Total: {formatPrice(order.totalAmount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;