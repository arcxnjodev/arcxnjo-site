import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaLink,
  FaMusic,
  FaSave,
  FaTimes,
  FaUpload,
  FaVolumeUp,
} from "react-icons/fa";

type MusicValues = {
  musicTitle: string;
  musicUrl: string;
};

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

  const { values, handleSubmit, handleChange, setValues } =
    useFormik<MusicValues>({
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
              musicUrl: values.musicUrl.trim(),
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

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-black/35 px-11 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-pink-600/10 p-5 md:p-6">
        <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaMusic />
            Music Player
          </div>

          <h3 className="text-2xl font-black text-white">
            Música do perfil
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Coloque uma música para tocar quando alguém entrar no seu perfil. O
            visitante precisa clicar em CLICK TO ENTER para liberar o áudio.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            message.includes("✅")
              ? "border-green-400/20 bg-green-500/10 text-green-200"
              : "border-red-400/20 bg-red-500/10 text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70">
              <FaVolumeUp />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Track info</h4>
              <p className="text-xs text-white/40">
                Nome da música e link do arquivo.
              </p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Music Title
              </label>

              <div className="relative">
                <FaMusic className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />

                <input
                  type="text"
                  name="musicTitle"
                  placeholder="Song title"
                  className={inputClass}
                  value={values.musicTitle}
                  onChange={handleChange}
                  maxLength={60}
                />
              </div>

              <p className="mt-2 text-xs text-white/35">
                {values.musicTitle.length}/60
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                Music URL
              </label>

              <div className="relative">
                <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />

                <input
                  type="text"
                  name="musicUrl"
                  placeholder="https://..."
                  className={inputClass}
                  value={values.musicUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="mb-5">
            <h4 className="text-lg font-black text-white">Upload Music</h4>
            <p className="mt-1 text-sm text-white/40">
              Allowed formats: MP3, WAV, OGG, WEBM. Max 25MB.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.035] px-4 py-5 text-sm font-semibold text-white/60 transition hover:border-purple-400/35 hover:bg-purple-500/10 hover:text-white">
            <FaUpload />
            {uploadingMusic ? "Uploading..." : "Upload audio file"}
            <input
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg,audio/webm"
              className="hidden"
              onChange={(e) => handleMusicUpload(e.target.files?.[0])}
            />
          </label>
        </section>

        {values.musicUrl && (
          <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-white">Preview</h4>
                <p className="mt-1 text-sm text-white/40">
                  {values.musicTitle || "Profile music"}
                </p>
              </div>

              <button
                type="button"
                onClick={clearMusic}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-500/20 hover:text-white"
              >
                <FaTimes className="text-xs" />
                Remove
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <audio src={values.musicUrl} controls className="w-full" />
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <FaCheckCircle className="text-green-300" />
                Ready to publish
              </p>

              <p className="mt-1 text-xs text-white/40">
                Music: {values.musicUrl ? "set" : "empty"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingMusic}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              {loading ? "Saving..." : "Save Music"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};