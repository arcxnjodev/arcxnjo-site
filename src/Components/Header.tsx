import Logo from "../assets/images/logo.webp";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className="fixed w-full flex justify-center top-5 z-50">
      <div className="text-white bg-gray-900/90 backdrop-blur-md flex items-center justify-between px-5 w-[90%] md:w-[70%] rounded-full h-[70px] md:h-[80px] shadow-2xl border border-white/10">
        
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img
            src="/arcxnjo-logo.png"
            alt="ARCXNJO"
            className="h-10 md:h-12 w-auto object-contain"
          />
          <span className="text-purple-400 font-bold text-xl md:text-2xl">
            ARCXNJO
          </span>
        </Link>

        <div>
          <ul className="flex items-center gap-2 md:gap-5">
            <li>
              <Link to="/pricing" className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/login" className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base text-white">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="py-2 px-3 md:px-4 rounded-lg transition bg-purple-600 hover:bg-purple-700 !text-black font-bold text-sm md:text-base">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};