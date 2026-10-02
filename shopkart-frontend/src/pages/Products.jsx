import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);

      try {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (sort) params.sort = sort;

        const [productsRes, wishlistRes] = await Promise.all([
          api.get("/products", { params }),
          api.get("/wishlist"),
        ]);

        setProducts(productsRes.data.products);
        setWishlistIds(wishlistRes.data.wishlist.map((item) => item._id));
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] p-2 rounded bg-slate-800 text-white outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 rounded bg-slate-800 text-white outline-none"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="p-2 rounded bg-slate-800 text-white outline-none"
          >
            <option value="">Default Sorting</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading && <p className="text-white">Loading products...</p>}

        {!loading && error && (
          <p className="text-red-400">Something went wrong while loading products.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-slate-300">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initiallyWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;