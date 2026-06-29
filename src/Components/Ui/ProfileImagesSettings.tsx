import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaImage,
  FaLayerGroup,
  FaSave,
  FaUpload,
  FaUserCircle,
  FaVideo,
} from "react-icons/fa";

type ProfileMediaValues = {
  profileImage: string;
  bannerType: string;
  bannerImage: string;
  bannerVideo: string;
};

export const ProfileImagesSettings = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const uploadFile = async (file: File) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM."
      );
    }

    const isVideo = file.type.startsWith("video/");
const maxSizeMb = isVideo && plan === "pro" ? 50 : 25;

if (file.size > maxSizeMb * 1024 * 1024) {
  throw new Error(
    isVideo
      ? `Video is too large. Maximum size is ${maxSizeMb}MB for your plan.`
      : `File is too large. Maximum size is ${maxSizeMb}MB.`
  );
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

  const { values, handleSubmit, setValues } =
    useFormik<ProfileMediaValues>({
      initialValues: {
        profileImage: "",
        bannerType: "image",
        bannerImage: "",
        bannerVideo: "",
      },
      onSubmit: async (values) => {
        setLoading(true);
        setMessage("");

        try {
          const token = localStorage.getItem("token");

          await axios.put(
            `${API_URL}/api/profile/images`,
            {
              profileImage: values.profileImage.trim(),
              bannerType: values.bannerType,
              bannerImage: values.bannerImage.trim(),
              bannerVideo: values.bannerVideo.trim(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setMessage("✅ Profile media saved successfully!");
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
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
     setPlan(response.data.plan === "pro" ? "pro" : "free");
        
     setValues({
          profileImage: response.data.profile_image || "",
          bannerType: response.data.banner_type || "image",
          bannerImage: response.data.banner_image || "",
          bannerVideo: response.data.banner_video || "",
        });
      } catch (error) {
        console.error("Error fetching profile media:", error);
      }
    };

    fetchUserData();
  }, [API_URL, setValues]);

  const handleProfileUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      setUploadingProfile(true);
      setMessage("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Profile picture must be an image.");
      }

      const uploaded = await uploadFile(file);

      setValues({
        ...values,
        profileImage: uploaded.url,
      });

      setMessage("✅ Profile picture uploaded. Click Save to publish.");
    } catch (error: any) {
      setMessage("❌ Upload error: " + error.message);
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleBackgroundUpload = async (file: File | undefined) => {
    if (!file) return;

    try {
      setUploadingBackground(true);
      setMessage("");

      const uploaded = await uploadFile(file);

      if (uploaded.mimetype?.startsWith("video/")) {
        setValues({
          ...values,
          bannerType: "video",
          bannerVideo: uploaded.url,
          bannerImage: "",
        });
      } else {
        setValues({
          ...values,
          bannerType: "image",
          bannerImage: uploaded.url,
          bannerVideo: "",
        });
      }

      setMessage("✅ Background uploaded. Click Save to publish.");
    } catch (error: any) {
      setMessage("❌ Upload error: " + error.message);
    } finally {
      setUploadingBackground(false);
    }
  };

  const currentBackground =
    values.bannerType === "video" ? values.bannerVideo : values.bannerImage;

    "w-full rounded-2xl border border-white/10 bg-black/35 px-11 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-purple-400/60 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(168,85,247,0.12)]";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/30 to-blue-600/10 p-5 md:p-6">
        <div className="absolute right-[-70px] top-[-90px] h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
            <FaLayerGroup />
            Profile Media
          </div>

          <h3 className="text-2xl font-black text-white">
            Avatar e fundo do perfil
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            Envie avatar, imagem, GIF ou vídeo de fundo. O upload salva no
            Cloudinary, mas você ainda precisa clicar em Save para publicar.
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
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70">
                <FaUserCircle className="text-xl" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Avatar</h4>
                <p className="text-xs text-white/40">
                  Imagem principal do perfil
                </p>
              </div>
            </div>

            <div className="mb-5 flex justify-center">
              <div className="relative">
                <img
                  src={
                    values.profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/219/219986.png"
                  }
                  alt="Profile preview"
                  className="h-32 w-32 rounded-full border-4 border-white/10 bg-black object-cover shadow-[0_0_40px_rgba(168,85,247,0.18)]"
                />

                <span className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-purple-600 text-white shadow-lg">
                  <FaImage />
                </span>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.035] px-4 py-4 text-sm font-semibold text-white/60 transition hover:border-purple-400/35 hover:bg-purple-500/10 hover:text-white">
              <FaUpload />
              {uploadingProfile ? "Uploading..." : "Upload avatar"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleProfileUpload(e.target.files?.[0])}
              />
            </label>

            <p className="mt-3 text-xs text-white/35">
              Allowed formats: JPG, PNG, WEBP, GIF. Max 25MB.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/70">
                  {values.bannerType === "video" ? <FaVideo /> : <FaImage />}
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">Background</h4>
                  <p className="text-xs text-white/40">
                    Imagem, GIF ou vídeo no fundo do perfil
                  </p>
                </div>
              </div>

              <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setValues({
                      ...values,
                      bannerType: "image",
                      bannerVideo: "",
                    })
                  }
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                    values.bannerType === "image"
                      ? "bg-purple-600 text-white"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  Image
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setValues({
                      ...values,
                      bannerType: "video",
                      bannerImage: "",
                    })
                  }
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                    values.bannerType === "video"
                      ? "bg-purple-600 text-white"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35">
              {values.bannerType === "video" && values.bannerVideo ? (
                <video
                  src={values.bannerVideo}
                  className="h-56 w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : values.bannerImage ? (
                <div
                  className="h-56 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${values.bannerImage})` }}
                />
              ) : (
                <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-purple-950 via-black to-gray-950">
                  <div className="text-center">
                    <FaLayerGroup className="mx-auto text-3xl text-white/25" />
                    <p className="mt-3 text-sm text-white/35">
                      Background preview
                    </p>
                  </div>
                </div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.035] px-4 py-4 text-sm font-semibold text-white/60 transition hover:border-purple-400/35 hover:bg-purple-500/10 hover:text-white">
              <FaUpload />
              {uploadingBackground ? "Uploading..." : "Upload background"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => handleBackgroundUpload(e.target.files?.[0])}
              />
            </label>

            <p className="mt-3 text-xs text-white/35">
              Allowed formats: JPG, PNG, WEBP, GIF, MP4, WEBM. Videos up to 50MB on Pro.
            </p>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <FaCheckCircle className="text-green-300" />
                Ready to publish
              </p>

              <p className="mt-1 text-xs text-white/40">
                Avatar: {values.profileImage ? "set" : "empty"} · Background:{" "}
                {currentBackground ? "set" : "empty"} · Type:{" "}
                {values.bannerType}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingProfile || uploadingBackground}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(147,51,234,0.22)] transition hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-[0_0_38px_rgba(147,51,234,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              {loading ? "Saving..." : "Save Profile Media"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};