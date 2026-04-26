import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";

export const SocialMediaSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const formik = useFormik({
    initialValues: {
      instagram: "",
      x: "",
      youtube: "",
      twitch: "",
      kick: "",
      discord: "",
      linkedin: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `${API_URL}/api/profile/social-media`,
          {
            instagram: values.instagram.trim(),
            x: values.x.trim(),
            youtube: values.youtube.trim(),
            twitch: values.twitch.trim(),
            kick: values.kick.trim(),
            discord: values.discord.trim(),
            linkedIn: values.linkedin.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage("✅ Social media saved successfully!");
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

  const { values, handleSubmit, handleChange, setValues } = formik;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const socialMedia = response.data.socialMedia || {};

        setValues({
          instagram: socialMedia.instagram || "",
          x: socialMedia.x || "",
          youtube: socialMedia.youtube || "",
          twitch: socialMedia.twitch || "",
          kick: socialMedia.kick || "",
          discord: socialMedia.discord || "",
          linkedin: socialMedia.linkedin || socialMedia.linkedIn || "",
        });
      } catch (error) {
        console.error("Error fetching social media:", error);
      }
    };

    fetchUserData();
  }, [API_URL, setValues]);

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-5 text-white">Social Media</p>

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
        <p className="text-white font-medium">Instagram</p>
        <input
          type="text"
          name="instagram"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.instagram}
          onChange={handleChange}
        />

        <p className="text-white font-medium">X (Twitter)</p>
        <input
          type="text"
          name="x"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.x}
          onChange={handleChange}
        />

        <p className="text-white font-medium">YouTube</p>
        <input
          type="text"
          name="youtube"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.youtube}
          onChange={handleChange}
        />

        <p className="text-white font-medium">Twitch</p>
        <input
          type="text"
          name="twitch"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.twitch}
          onChange={handleChange}
        />

        <p className="text-white font-medium">Kick</p>
        <input
          type="text"
          name="kick"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.kick}
          onChange={handleChange}
        />

        <p className="text-white font-medium">Discord</p>
        <input
          type="text"
          name="discord"
          placeholder="Invite link, invite code, or username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.discord}
          onChange={handleChange}
        />

        <p className="text-white font-medium">LinkedIn</p>
        <input
          type="text"
          name="linkedin"
          placeholder="Your username"
          className="w-full p-2 border-none rounded-md my-1 text-black"
          value={values.linkedin}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-900 w-full p-3 rounded-md my-4 text-white hover:bg-purple-800 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
};