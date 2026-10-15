import { useState } from "react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, pendingIds } = useCart();
  const [message, setMessage] = useState("");

  const { product, quantity } = item;
  const busy = pendingIds.includes(product._id);

  const handleUpdate = async (newQuantity) => {
    setMessage("");
    const result = await updateQuantity(product._id, newQuantity);
    if (!result.ok) setMessage(result.message);
  };

  const handleRemove = async () => {
    setMessage("");
    const result = await removeFromCart(product._id);
    if (!result.ok) setMessage(result.message);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex gap-4 items-start">
      <img
        src={product.image}
        alt={product.name}
        className="w-24 h-24 object-cover rounded"
      />

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="text-white font-semibold">{product.name}</h2>
        <p className="text-slate-400 text-sm">{formatPrice(product.price)}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleUpdate(quantity - 1)}
            disabled={busy || quantity <= 1}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded"
          >
            -
          </button>
          <span className="text-white w-6 text-center">{quantity}</span>
          <button
            onClick={() => handleUpdate(quantity + 1)}
            disabled={busy || quantity >= product.stock}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded"
          >
            +
          </button>
          {busy && <span className="text-slate-400 text-sm">Updating...</span>}
        </div>

        {message && <p className="text-red-400 text-sm">{message}</p>}

        <button
          onClick={handleRemove}
          disabled={busy}
          className="self-start text-red-400 hover:text-red-300 disabled:opacity-40 text-sm"
        >
          Remove
        </button>
      </div>

      <p className="text-emerald-400 font-bold">
        {formatPrice(product.price * quantity)}
      </p>
    </div>
  );
}

export default CartItem;