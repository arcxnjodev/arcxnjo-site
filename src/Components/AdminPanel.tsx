import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { SocialMediaSettings } from "./Ui/SocialMediaSettings";
import { ProfileImagesSettings } from "./Ui/ProfileImagesSettings";
import { FaUser, FaLink, FaImage, FaSignOutAlt, FaTachometerAlt, FaPalette } from "react-icons/fa";
import axios from "axios";
import { AppearanceSettings } from "./Ui/AppearanceSettings";

export const AdminPanel = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const usernameFromToken = tokenPayload.username || "";

      const response = await axios.get(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsername(response.data.username || usernameFromToken);
      setBio(response.data.bio || "");
    } catch (error) {
      console.error("Error fetching user data:", error);

      const token = localStorage.getItem("token");

      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          setUsername(tokenPayload.username || "");
        } catch {
          setUsername("");
        }
      }
    }
  };

  fetchUserData();
}, [API_URL]);

  const handleSaveBio = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/bio`,
        { bio },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  const tabs = [
  { id: "profile", label: "Public Profile", icon: <FaUser />, component: null },
  { id: "social", label: "Social Media", icon: <FaLink />, component: <SocialMediaSettings /> },
  { id: "images", label: "Images", icon: <FaImage />, component: <ProfileImagesSettings /> },
  { id: "appearance", label: "Appearance", icon: <FaPalette />, component: <AppearanceSettings /> },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
  <a href="/" className="flex items-center hover:opacity-80 transition">
    <span
      className="text-white text-xl md:text-2xl font-bold tracking-[0.25em]"
      style={{ fontFamily: "Orbitron, sans-serif" }}
    >
      ARC<span className="text-purple-500">X</span>NJO
    </span>
  </a>
</div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                {username?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-white text-sm">{username || email?.split("@")[0]}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
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
  <button
    type="button"
    onClick={() => {
      if (!username) {
        alert("Username is still loading. Please wait a moment.");
        return;
      }

      window.open(`https://www.arcxnjo.com.br/${username}`, "_blank");
    }}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
  >
    <FaTachometerAlt />
    <span>View Profile</span>
  </button>
</div>
          </aside>

          <main className="flex-1 space-y-6">

  {activeTab === "profile" && (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="w-full">
          <h3 className="text-xl font-bold">{username}</h3>
          <p className="text-white/70 text-sm">{email}</p>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
              className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white resize-none"
              rows={3}
              maxLength={160}
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-white/60">
                {bio.length}/160
              </span>

              <button
                onClick={handleSaveBio}
                className="bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Save Bio
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm">Your public profile is at:</p>
        <code className="text-sm bg-black/30 px-2 py-1 rounded mt-1 inline-block break-all">
         https://www.arcxnjo.com.br/{username || "loading"}
        </code>
      </div>

    </div>
  )}

  {activeTab === "social" && tabs.find((t) => t.id === "social")?.component}
{activeTab === "images" && tabs.find((t) => t.id === "images")?.component}
{activeTab === "appearance" && tabs.find((t) => t.id === "appearance")?.component}

</main>
        </div>
      </div>
    </div>
  );
};