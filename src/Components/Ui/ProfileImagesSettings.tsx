import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";

export const ProfileImagesSettings = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [message, setMessage] = useState("");

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
      throw new Error("Invalid file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM.");
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

      if (uploaded.mimetype.startsWith("video/")) {
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

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-5 text-white">Profile Media</p>

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
        <p className="text-white font-medium">Profile Picture URL</p>
        <input
          type="text"
          name="profileImage"
          placeholder="Enter profile image URL"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.profileImage}
          onChange={handleChange}
        />

        <p className="text-white font-medium mt-3">Or upload profile picture</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="w-full p-2 rounded-md my-1 bg-white text-black"
          onChange={(e) => handleProfileUpload(e.target.files?.[0])}
        />

        {uploadingProfile && (
          <p className="text-white/80 text-sm mt-1">Uploading profile picture...</p>
        )}

        {values.profileImage && (
          <div className="mt-3 mb-5">
            <p className="text-white/80 text-sm mb-2">Profile Preview</p>
            <img
              src={values.profileImage}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20 bg-black"
            />
          </div>
        )}

        <p className="text-white font-medium mt-4">Background Type</p>
        <select
          name="bannerType"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.bannerType}
          onChange={handleChange}
        >
          <option value="image">Image / GIF</option>
          <option value="video">Video</option>
        </select>

        <p className="text-white font-medium mt-3">Upload background</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          className="w-full p-2 rounded-md my-1 bg-white text-black"
          onChange={(e) => handleBackgroundUpload(e.target.files?.[0])}
        />

        {uploadingBackground && (
          <p className="text-white/80 text-sm mt-1">Uploading background...</p>
        )}

        {values.bannerType === "image" && (
          <>
            <p className="text-white font-medium mt-4">Background Image or GIF URL</p>
            <input
              type="text"
              name="bannerImage"
              placeholder="Enter image or GIF URL"
              className="w-full p-2 border-none rounded-md my-1 text-black"
              value={values.bannerImage}
              onChange={handleChange}
            />

            {values.bannerImage && (
              <div className="mt-3 mb-5">
                <p className="text-white/80 text-sm mb-2">Background Preview</p>
                <div
                  className="w-full h-40 rounded-lg bg-cover bg-center border border-white/20"
                  style={{ backgroundImage: `url(${values.bannerImage})` }}
                />
              </div>
            )}
          </>
        )}

        {values.bannerType === "video" && (
          <>
            <p className="text-white font-medium mt-4">Background Video URL</p>
            <input
              type="text"
              name="bannerVideo"
              placeholder="Enter video URL"
              className="w-full p-2 border-none rounded-md my-1 text-black"
              value={values.bannerVideo}
              onChange={handleChange}
            />

            {values.bannerVideo && (
              <div className="mt-3 mb-5">
                <p className="text-white/80 text-sm mb-2">Video Preview</p>
                <video
                  src={values.bannerVideo}
                  className="w-full h-40 rounded-lg object-cover border border-white/20"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading || uploadingProfile || uploadingBackground}
          className="bg-purple-900 w-full p-3 rounded-md my-4 text-white hover:bg-purple-800 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};