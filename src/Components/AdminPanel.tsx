import { useState } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { SocialMediaSettings } from "./Ui/SocialMediaSettings";
import { ProfileImagesSettings } from "./Ui/ProfileImagesSettings";
import { FaUser, FaLink, FaImage, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";

export const AdminPanel = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  const tabs = [
    { id: "profile", label: "Perfil Público", icon: <FaUser />, component: null },
    { id: "social", label: "Redes Sociais", icon: <FaLink />, component: <SocialMediaSettings /> },
    { id: "images", label: "Imagens", icon: <FaImage />, component: <ProfileImagesSettings /> },
  ];

  const ProfilePreview = () => {
    const username = email?.split("@")[0] || "usuário";
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{username}</h3>
            <p className="text-white/70 text-sm">{email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm">Seu perfil público está em:</p>
          <code className="text-sm bg-black/30 px-2 py-1 rounded mt-1 inline-block">
            https://www.arcxnjo.com.br/{username}
          </code>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-white font-bold text-xl">ARCXNJO</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                {email?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-white text-sm">{email?.split("@")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-700">
              <a
                href={`https://www.arcxnjo.com.br/${email?.split("@")[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <FaTachometerAlt />
                <span>Ver Perfil</span>
              </a>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 space-y-6">
            {activeTab === "profile" && <ProfilePreview />}
            {activeTab === "social" && tabs.find(t => t.id === "social")?.component}
            {activeTab === "images" && tabs.find(t => t.id === "images")?.component}
          </main>
        </div>
      </div>
    </div>
  );
};