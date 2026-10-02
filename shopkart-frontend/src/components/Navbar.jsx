import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
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
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  return (
    <nav className="bg-slate-800 px-6 py-4 flex justify-between items-center">
      <h1 className="text-white font-bold text-lg">ShopKart</h1>
      <div className="flex items-center gap-6">
        <Link to="/home" className="text-white hover:text-emerald-400">
          Home
        </Link>
        <Link to="/products" className="text-white hover:text-emerald-400">
          Products
        </Link>
        <Link to="/wishlist" className="text-white hover:text-emerald-400">
          Wishlist ({wishlistCount})
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