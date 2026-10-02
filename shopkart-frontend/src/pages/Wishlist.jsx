import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      alert("Failed to remove product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-white text-2xl font-bold mb-1">My Wishlist</h1>

        {loading && <p className="text-white">Loading your wishlist...</p>}

        {!loading && error && (
          <div className="text-center mt-10">
            <p className="text-red-400 mb-4">
              Something went wrong. We couldn't load your wishlist.
            </p>
            <button
              onClick={fetchWishlist}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-white text-xl mb-2">Your wishlist is empty</p>
            <p className="text-slate-400 mb-4">
              Save products you love and find them here later.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <>
            <p className="text-slate-400 mb-4">{wishlist.length} products saved</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;