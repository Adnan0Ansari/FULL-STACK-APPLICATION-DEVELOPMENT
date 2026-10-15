import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, pendingIds } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setCartMessage("");
    const result = await addToCart(product._id);
    if (result.ok) {
      setCartMessage("Added to cart");
    } else {
      setCartMessage(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Something went wrong while loading this product.
      </div>
    );
  }

  const adding = pendingIds.includes(product._id);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover rounded-lg"
        />
        <h1 className="text-white text-3xl font-bold">{product.name}</h1>
        <p className="text-slate-400">{product.category}</p>
        <p className="text-slate-300">{product.description}</p>
        <p className="text-emerald-400 text-2xl font-bold">₹{product.price}</p>
        <p className="text-slate-300">
          {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded font-semibold"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
        {cartMessage && <p className="text-slate-300 text-sm">{cartMessage}</p>}
      </div>
    </div>
  );
}

export default ProductDetails;