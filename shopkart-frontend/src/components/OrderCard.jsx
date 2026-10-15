import { useNavigate } from "react-router-dom";
import { formatPrice, formatDate } from "../utils/format";

function OrderCard({ order }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 rounded-lg p-5 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-semibold">Order #{order._id.slice(-8)}</h2>
        <span className="text-slate-400 text-sm">{formatDate(order.createdAt)}</span>
      </div>

      <div className="text-slate-300 text-sm">
        {order.items.map((item) => (
          <p key={item._id}>
            {item.name} × {item.quantity}
          </p>
        ))}
      </div>

      <p className="text-emerald-400 font-bold">Total: {formatPrice(order.totalAmount)}</p>
      <p className="text-slate-300 text-sm">Status: {order.status}</p>

      <button
        onClick={() => navigate(`/orders/${order._id}`)}
        className="self-start mt-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
      >
        View Details
      </button>
    </div>
  );
}

export default OrderCard;