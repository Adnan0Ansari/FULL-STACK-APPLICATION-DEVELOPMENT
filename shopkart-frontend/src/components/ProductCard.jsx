import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, initiallyWishlisted }) {
  const navigate = useNavigate();
  const { addToCart, pendingIds } = useCart();
  const [wishlistStatus, setWishlistStatus] = useState(
    initiallyWishlisted ? "saved" : "idle"
  );
  const [cartMessage, setCartMessage] = useState("");

  const adding = pendingIds.includes(product._id);

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

  const handleAddToCart = async () => {
    setCartMessage("");
    const result = await addToCart(product._id);
    if (!result.ok) {
      setCartMessage(result.message);
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
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded font-semibold"
        >
          {adding ? "Adding..." : product.stock === 0 ? "Out of stock" : "Add to Cart"}
        </button>

        {cartMessage && <p className="text-red-400 text-sm">{cartMessage}</p>}

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