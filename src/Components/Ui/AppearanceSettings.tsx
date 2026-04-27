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
    description: "Clean transparent futuristic style.",
    preview: "from-cyan-500 to-purple-700",
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Simple, clean and dark.",
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

export const AppearanceSettings = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("neon-purple");
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
        { profileTemplate: selectedTemplate },
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
                <div className="w-20 h-20 rounded-full bg-black/40 border border-white/20" />
              </div>

              <div className="bg-black/40 p-4 text-white">
                <p className="font-bold">{template.name}</p>
                <p className="text-sm text-white/70">
                  {template.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-purple-900 w-full p-3 rounded-md my-4 text-white hover:bg-purple-800 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Appearance"}
      </button>
    </div>
  );
};