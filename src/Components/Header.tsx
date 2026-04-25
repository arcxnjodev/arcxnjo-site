import Logo from "../assets/images/logo.webp";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className="fixed w-full flex justify-center top-5 z-50">
      <div className="text-white bg-gray-900/90 backdrop-blur-md flex items-center justify-between px-5 w-[90%] md:w-[70%] rounded-full h-[70px] md:h-[80px] shadow-2xl border border-white/10">
        
        {/* Logo e nome */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src={Logo} className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="ARCXNJO" />
          <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-primary to-purple-secondary">
            ARCXNJO
          </span>
        </Link>

        {/* Menu de navegação */}
        <div>
          <ul className="flex items-center gap-2 md:gap-5">
            <li>
              <a href="#" className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base" style={{ color: '#a855f7' }}>
                Pricing
              </a>
            </li>
            <li>
              <Link to="/login" className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base" style={{ color: '#a855f7' }}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="py-2 px-3 md:px-4 rounded-lg transition bg-purple-600 hover:bg-purple-700 text-white text-sm md:text-base">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};