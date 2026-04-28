import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { SocialMediaSettings } from "./Ui/SocialMediaSettings";
import { ProfileImagesSettings } from "./Ui/ProfileImagesSettings";
import { AppearanceSettings } from "./Ui/AppearanceSettings";
import { MusicSettings } from "./Ui/MusicSettings";
import {
  FaUser,
  FaLink,
  FaImage,
  FaSignOutAlt,
  FaTachometerAlt,
  FaPalette,
  FaMusic,
} from "react-icons/fa";
import axios from "axios";

export const AdminPanel = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);

  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");

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

        const currentUsername = response.data.username || usernameFromToken;

        setUsername(currentUsername);
        setNewUsername(currentUsername);
        setDisplayName(response.data.display_name || "");
        setBio(response.data.bio || "");
        setLocation(response.data.location || "");
        setStatusText(response.data.status_text || "");
      } catch (error) {
        console.error("Error fetching user data:", error);

        const token = localStorage.getItem("token");

        if (token) {
          try {
            const tokenPayload = JSON.parse(atob(token.split(".")[1]));
            const usernameFromToken = tokenPayload.username || "";

            setUsername(usernameFromToken);
            setNewUsername(usernameFromToken);
          } catch {
            setUsername("");
            setNewUsername("");
          }
        }
      }
    };

    fetchUserData();
  }, [API_URL]);

  const handleSaveUsername = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/profile/username`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsername(response.data.username);
      setNewUsername(response.data.username);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      alert("Username updated successfully!");
    } catch (error: any) {
      console.error("Error updating username:", error);
      alert(error.response?.data?.error || "Failed to update username.");
    }
  };

  const handleSaveDisplayName = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/display-name`,
        { displayName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Display name updated successfully!");
    } catch (error) {
      console.error("Error updating display name:", error);
      alert("Failed to update display name. Please try again.");
    }
  };

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

  const handleSaveDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/details`,
        { location, statusText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Profile details updated successfully!");
    } catch (error) {
      console.error("Error updating profile details:", error);
      alert("Failed to update profile details. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  const tabs = [
    {
      id: "profile",
      label: "Public Profile",
      icon: <FaUser />,
      component: null,
    },
    {
      id: "social",
      label: "Social Media",
      icon: <FaLink />,
      component: <SocialMediaSettings />,
    },
    {
      id: "images",
      label: "Images",
      icon: <FaImage />,
      component: <ProfileImagesSettings />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <FaPalette />,
      component: <AppearanceSettings />,
    },
    {
      id: "music",
      label: "Music",
      icon: <FaMusic />,
      component: <MusicSettings />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-900/50 border-b border-gray-700 sticky top-0 z-10">
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
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {username?.charAt(0).toUpperCase() ||
                  email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>

              <span className="text-white text-sm">
                {username || email?.split("@")[0]}
              </span>
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
                    {username.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="w-full">
                    <h3 className="text-xl font-bold">
                      {displayName || username || "User"}
                    </h3>

                    <p className="text-white/70 text-sm">{email}</p>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold mb-2">
                        Username
                      </label>

                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="your-username"
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
                        maxLength={20}
                      />

                      <p className="text-xs text-white/60 mt-1">
                        3-20 characters. Letters, numbers, dots, underscores,
                        and hyphens only.
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          {newUsername.length}/20
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveUsername}
                          className="bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Save Username
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold mb-2">
                        Display Name
                      </label>

                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
                        maxLength={32}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          {displayName.length}/32
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveDisplayName}
                          className="bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Save Display Name
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold mb-2">
                        Bio
                      </label>

                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a short bio..."
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/50 resize-none outline-none focus:border-white/40"
                        rows={3}
                        maxLength={160}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          {bio.length}/160
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveBio}
                          className="bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Save Bio
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold mb-2">
                        Location
                      </label>

                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Your location"
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
                        maxLength={40}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-semibold mb-2">
                        Status
                      </label>

                      <input
                        type="text"
                        value={statusText}
                        onChange={(e) => setStatusText(e.target.value)}
                        placeholder="What are you doing now?"
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
                        maxLength={80}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          {statusText.length}/80
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveDetails}
                          className="bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Save Details
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

            {activeTab === "social" &&
              tabs.find((t) => t.id === "social")?.component}

            {activeTab === "images" &&
              tabs.find((t) => t.id === "images")?.component}

            {activeTab === "appearance" &&
              tabs.find((t) => t.id === "appearance")?.component}

            {activeTab === "music" &&
              tabs.find((t) => t.id === "music")?.component}
          </main>
        </div>
      </div>
    </div>
  );
};