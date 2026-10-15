import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartCount, resetCart } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get("/wishlist");
        setWishlistCount(res.data.count);
      } catch (err) {
        setWishlistCount(0);
      }
    };

    fetchCount();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (err) {
      // redirect to login regardless
    }
    resetCart();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-800 px-6 py-4 flex justify-between items-center flex-wrap gap-3">
      <h1 className="text-white font-bold text-lg">ShopKart</h1>
      <div className="flex items-center gap-6 flex-wrap">
        <Link to="/home" className="text-white hover:text-emerald-400">
          Home
        </Link>
        <Link to="/products" className="text-white hover:text-emerald-400">
          Products
        </Link>
        <Link to="/wishlist" className="text-white hover:text-emerald-400">
          Wishlist ({wishlistCount})
        </Link>
        <Link to="/cart" className="text-white hover:text-emerald-400">
          Cart ({cartCount})
        </Link>
        <Link to="/orders" className="text-white hover:text-emerald-400">
          Orders
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;