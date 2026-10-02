import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded font-semibold">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;