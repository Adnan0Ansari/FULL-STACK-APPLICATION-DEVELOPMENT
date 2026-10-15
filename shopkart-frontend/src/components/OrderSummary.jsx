import { formatPrice } from "../utils/format";

function OrderSummary({ items, itemCount, total, totalLabel = "Total", children }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 flex flex-col gap-3">
      <h2 className="text-white text-xl font-bold">Order Summary</h2>

      {items.map((item) => (
        <div
          key={item.product._id}
          className="flex justify-between text-slate-300 text-sm"
        >
          <span>
            {item.product.name} × {item.quantity}
          </span>
          <span>{formatPrice(item.product.price * item.quantity)}</span>
        </div>
      ))}

      <hr className="border-slate-700" />

      <div className="flex justify-between text-slate-300">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>

      <div className="flex justify-between text-white font-bold text-lg">
        <span>{totalLabel}</span>
        <span>{formatPrice(total)}</span>
      </div>

      {children}
    </div>
  );
}

export default OrderSummary;