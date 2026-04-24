import Logo from "../assets/images/logo.webp";
import { useFormik } from "formik";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginSchema from "../Shemas/loginSchema";
import { useDispatch } from "react-redux";
import { loginUser } from "../Store/userSlice";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("https://app.arcxnjo.com.br/api/login", {
        email: values.email,
        password: values.password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", user.email);
      dispatch(loginUser(user.email));
      navigate("/panel");
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const { values, errors, handleSubmit, handleChange } = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit,
    validationSchema: loginSchema,
  });

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-white w-[400px] bg-slate-900 rounded-xl flex flex-col items-center p-10">
        <div className="flex flex-col items-center">
          <img src={Logo} className="w-1/4 inline-block mb-3" />
          <p className="font-semibold text-lg">Sign in to your Banana.com account</p>
        </div>
        {error && <div className="mt-4 p-2 rounded text-center w-full bg-red-600">{error}</div>}
        <div className="w-[300px] mt-6">
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <span>Email</span>
              <input name="email" type="email" onChange={handleChange} value={values.email} className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500" required />
              <p className="text-red-600 text-sm">{errors.email}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span>Password</span>
              <input name="password" type="password" onChange={handleChange} value={values.password} className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500" required />
              <p className="text-red-600 text-sm">{errors.password}</p>
            </div>
            <button type="submit" disabled={loading} className="bg-purple-700 w-full rounded-lg p-2 mt-5 border-purple-950 border-4 border-solid disabled:opacity-50 hover:bg-purple-600 transition">
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center">
              <p className="text-sm">Don't have an account? <Link to="/register" className="text-purple-700 hover:underline">Sign Up</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};