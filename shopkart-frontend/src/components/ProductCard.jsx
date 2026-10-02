import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProductCard({ product, initiallyWishlisted }) {
  const navigate = useNavigate();
  const [wishlistStatus, setWishlistStatus] = useState(
    initiallyWishlisted ? "saved" : "idle"
  );

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (wishlistStatus === "saving") return;

    setWishlistStatus("saving");

    try {
      const res = await api.patch(`/wishlist/${product._id}/toggle`);
      setWishlistStatus(res.data.saved ? "saved" : "idle");
    } catch (err) {
      setWishlistStatus("error");
    }
  };

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
          onClick={handleWishlist}
          disabled={wishlistStatus === "saving"}
          className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-semibold"
        >
          {wishlistStatus === "idle" && "♡ Add to Wishlist"}
          {wishlistStatus === "saving" && "⏳ Saving..."}
          {wishlistStatus === "saved" && "♥ Remove from Wishlist"}
          {wishlistStatus === "error" && "Unable to save. Try again."}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;