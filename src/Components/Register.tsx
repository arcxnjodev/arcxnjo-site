import Logo from "../assets/images/logo.webp";
import { useFormik } from "formik";
import axios from "axios";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import registerSchema from "../Shemas/registerSchema";

export const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const usernameParam = queryParams.get("username");
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async () => {
  setLoading(true);
  setMessage("");
  
  try {
    await axios.post("https://api.arcxnjo.com.br/api/register", {
      email: values.email,
      username: values.username,
      password: values.password,
    });
    
    setIsSuccess(true);
    setMessage("Successfully registered! Redirecting to login...");
    
    setTimeout(() => {
      navigate("/login?email=" + values.email);
    }, 2000);
    
  } catch (error: any) {
    setMessage(error.response?.data?.error || "Registration failed");
    setIsSuccess(false);
  } finally {
    setLoading(false);
  }
};
  
  const { values, errors, handleSubmit, handleChange } = useFormik({
    initialValues: {
      email: "",
      password: "",
      username: usernameParam || "",
      control: false,
    },
    onSubmit,
    validationSchema: registerSchema,
  });
  
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-white w-[400px] bg-slate-900 rounded-xl flex flex-col items-center p-10">
        <div className="flex flex-col items-center">
          <img src={Logo} className="w-1/4 inline-block mb-3" />
          <p className="font-semibold text-lg">Create your ARCXNJO.COM account</p>
        </div>
        
        {message && (
          <div className={`mt-4 p-2 rounded text-center w-full ${isSuccess ? "bg-green-600" : "bg-red-600"}`}>
            {message}
          </div>
        )}
        
        <div className="w-[300px] mt-6">
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <span>Email</span>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                value={values.email}
                className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-red-600 text-sm">{errors.email}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span>Password</span>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={values.password}
                className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-red-600 text-sm">{errors.password}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span>Username</span>
              <input
                name="username"
                type="text"
                onChange={handleChange}
                value={values.username}
                className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-red-600 text-sm">{errors.username}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="control"
                onChange={handleChange}
                checked={values.control}
                className="w-4 h-4"
              />
              <p className="text-sm">I agree to the Terms of Service.</p>
            </div>
            <p className="text-red-600 text-sm">{errors.control}</p>
            
            <button
  type="submit"
  disabled={loading}
  className="bg-purple-700 text-black font-bold w-full rounded-lg p-2 mt-5 border-purple-950 border-4 border-solid disabled:opacity-50 hover:bg-purple-600 transition"
>
  {loading ? "Creating account..." : "Sign Up"}
</button>
            
            <div className="text-center">
              <p className="text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-700 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};