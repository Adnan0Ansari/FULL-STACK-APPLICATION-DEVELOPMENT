import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden flex flex-col">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h2 className="text-white font-semibold text-lg">{product.name}</h2>
        <p className="text-slate-400 text-sm">{product.category}</p>
        <p className="text-emerald-400 font-bold text-xl">₹{product.price}</p>
        <p className="text-slate-300 text-sm">
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-semibold"
        >
          View Details
        </button>

        <button
          onClick={() => onRemove(product._id)}
          className="bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold"
        >
          Remove ♥
        </button>
      </div>
    </div>
  );
}

export default WishlistCard;