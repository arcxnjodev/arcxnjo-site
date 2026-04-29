import axios from "axios";
import { useEffect, useState } from "react";

const templates = [
  {
    id: "neon-purple",
    name: "Neon Purple",
    description: "Dark glass card with purple glow.",
    preview: "from-purple-700 to-black",
  },
  {
    id: "cyber-glass",
    name: "Cyber Glass",
    description: "Transparent futuristic style.",
    preview: "from-cyan-500 to-purple-700",
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Simple and clean dark layout.",
    preview: "from-gray-900 to-black",
  },
  {
    id: "red-glow",
    name: "Red Glow",
    description: "Dark profile with red highlight.",
    preview: "from-red-700 to-black",
  },
  {
    id: "blue-ice",
    name: "Blue Ice",
    description: "Cold blue futuristic style.",
    preview: "from-blue-600 to-slate-950",
  },
];

const effects = [
  {
    id: "none",
    name: "None",
    description: "No animated particles.",
  },
  {
    id: "stars",
    name: "Stars",
    description: "Twinkling stars in the background.",
  },
  {
    id: "snow",
    name: "Snow",
    description: "Soft falling snow effect.",
  },
  {
    id: "sparkles",
    name: "Sparkles",
    description: "Small shining sparkles.",
  },
  {
    id: "hearts",
    name: "Hearts",
    description: "Floating hearts effect.",
  },
];

export const AppearanceSettings = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  useEffect(() => {
    const fetchAppearance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSelectedTemplate(response.data.profile_template || "neon-purple");
        setSelectedEffect(response.data.profile_effect || "none");
      } catch (error) {
        console.error("Error fetching appearance:", error);
      }
    };

    fetchAppearance();
  }, [API_URL]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/profile/appearance`,
        {
          profileTemplate: selectedTemplate,
          profileEffect: selectedEffect,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Appearance updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(
        "❌ Error saving: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-5 text-white">Appearance</p>

      {message && (
        <div
          className={`mb-4 p-2 rounded text-center ${
            message.includes("✅") ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {message}
        </div>
      )}

      <p className="text-white font-semibold mb-3">Templates</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.id)}
              className={`text-left rounded-xl overflow-hidden border transition ${
                isSelected
                  ? "border-white shadow-lg scale-[1.02]"
                  : "border-white/20 hover:border-white/60"
              }`}
            >
              <div
                className={`h-28 bg-gradient-to-br ${template.preview} flex items-center justify-center`}
              >
                <div className="w-20 h-20 rounded-full bg-black/40" />
              </div>

              <div className="bg-black/40 p-4 text-white">
                <p className="font-bold">{template.name}</p>
                <p className="text-sm text-white/70">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-white font-semibold mt-8 mb-3">Effects</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {effects.map((effect) => {
          const isSelected = selectedEffect === effect.id;

          return (
            <button
              key={effect.id}
              type="button"
              onClick={() => setSelectedEffect(effect.id)}
              className={`text-left rounded-xl p-4 border transition ${
                isSelected
                  ? "border-white bg-black/35 shadow-lg scale-[1.02]"
                  : "border-white/20 bg-black/25 hover:border-white/60"
              }`}
            >
              <p className="font-bold text-white">{effect.name}</p>
              <p className="text-sm text-white/70">{effect.description}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-900 w-full p-3 rounded-md my-6 text-white hover:bg-purple-800 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Appearance"}
      </button>
    </div>
  );
};