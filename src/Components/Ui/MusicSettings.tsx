import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";

export const MusicSettings = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const uploadFile = async (file: File) => {
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Allowed: MP3, WAV, OGG, WEBM.");
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new Error("File is too large. Maximum size is 25MB.");
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  const { values, handleSubmit, handleChange, setValues } = useFormik({
    initialValues: {
      musicTitle: "",
      musicUrl: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${API_URL}/api/profile/music`,
          {
            musicTitle: values.musicTitle.trim(),
            musicUrl: values.musicUrl,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage("✅ Music saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (error: any) {
        setMessage(
          "❌ Error saving: " +
            (error.response?.data?.error || error.message)
        );
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setValues({
          musicTitle: response.data.music_title || "",
          musicUrl: response.data.music_url || "",
        });
      } catch (error) {
        console.error("Error fetching music:", error);
      }
    };

    fetchMusic();
  }, [API_URL, setValues]);

  const handleMusicUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      setUploadingMusic(true);
      setMessage("");

      if (!file.type.startsWith("audio/")) {
        throw new Error("Music file must be audio.");
      }

      const uploaded = await uploadFile(file);

      setValues({
        ...values,
        musicUrl: uploaded.url,
        musicTitle: values.musicTitle || file.name.replace(/\.[^/.]+$/, ""),
      });

      setMessage("✅ Music uploaded. Click Save to publish.");
    } catch (error: any) {
      setMessage("❌ Upload error: " + error.message);
    } finally {
      setUploadingMusic(false);
    }
  };

  const clearMusic = () => {
    setValues({
      musicTitle: "",
      musicUrl: "",
    });
  };

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-5 text-white">Music</p>

      {message && (
        <div
          className={`mb-4 p-2 rounded text-center ${
            message.includes("✅") ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <p className="text-white font-medium">Music Title</p>
        <input
          type="text"
          name="musicTitle"
          placeholder="Song title"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.musicTitle}
          onChange={handleChange}
          maxLength={60}
        />

        <p className="text-white font-medium mt-4">Upload Music</p>
        <p className="text-white/70 text-sm mb-2">
          Allowed formats: MP3, WAV, OGG, WEBM.
        </p>

        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,audio/webm"
          className="w-full p-2 rounded-md my-1 bg-white text-black"
          onChange={(e) => handleMusicUpload(e.target.files?.[0])}
        />

        {uploadingMusic && (
          <p className="text-white/80 text-sm mt-1">Uploading music...</p>
        )}

        {values.musicUrl && (
          <div className="mt-4 bg-black/30 border border-white/20 rounded-lg p-4">
            <p className="text-white/80 text-sm mb-2">Preview</p>

            <audio
              src={values.musicUrl}
              controls
              className="w-full"
            />

            <button
              type="button"
              onClick={clearMusic}
              className="mt-3 bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
            >
              Remove Music
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploadingMusic}
          className="bg-purple-900 w-full p-3 rounded-md my-4 text-white hover:bg-purple-800 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Music"}
        </button>
      </form>
    </div>
  );
};