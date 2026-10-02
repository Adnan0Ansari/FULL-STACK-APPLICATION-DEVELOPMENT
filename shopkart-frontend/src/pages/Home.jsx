import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/customers/me");
        setCustomer(res.data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-2 pt-20">
        <h1 className="text-3xl font-bold">Welcome, {customer.fullName}</h1>
        <p className="text-slate-300">Email: {customer.email}</p>
        <p className="text-slate-300">Phone: {customer.phone}</p>
      </div>
    </div>
  );
}

export default Home;