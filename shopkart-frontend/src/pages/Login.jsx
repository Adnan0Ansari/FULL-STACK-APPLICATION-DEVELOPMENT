import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/customers/login", formData);
      navigate("/home");
    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg w-96 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Login</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 rounded bg-slate-700 text-white outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 rounded bg-slate-700 text-white outline-none"
        />

        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;