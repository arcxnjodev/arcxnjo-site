import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../../Store/userSlice";

type userDataType = {
  id: string;
  email: string;
  username: string;
  socialMedia: {
    instagram: string;
    x: string;
    youtube: string;
    twitch: string;
    kick: string;
    discord: string;
    linkedIn: string;
  };
  profileImage: string;
  profileBanner: string;
};

export const SocialMediaSettings = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setMessage("Você precisa estar logado!");
        setLoading(false);
        return;
      }

      // Envia para a API real
      await axios.put(
        "http://localhost:3001/api/profile/social-media",
        {
          instagram: values.instagram,
          x: values.x,
          youtube: values.youtube,
          twitch: values.twitch,
          kick: values.kick,
          discord: values.discord,
          linkedIn: values.linkedIn,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      setMessage("✅ Social media saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setMessage("❌ Error saving: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const { values, handleSubmit, handleChange, setValues } = useFormik({
    initialValues: {
      instagram: "",
      x: "",
      youtube: "",
      twitch: "",
      kick: "",
      discord: "",
      linkedIn: "",
    },
    onSubmit,
  });

  // Buscar dados atuais do usuário via API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:3001/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      if (data.socialMedia) {
        setValues({
          instagram: data.socialMedia.instagram || "",
          x: data.socialMedia.x || "",
          youtube: data.socialMedia.youtube || "",
          twitch: data.socialMedia.twitch || "",
          kick: data.socialMedia.kick || "",
          discord: data.socialMedia.discord || "",
          linkedIn: data.socialMedia.linkedIn || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="flex items-start">
      <div className="bg-purple-700 p-10 rounded-lg m-5">
        <p className="text-2xl font-bold mb-5 text-white">Social Media</p>
        
        {message && (
          <div className={`mb-4 p-2 rounded text-center ${message.includes("✅") ? "bg-green-500" : "bg-red-500"} text-white`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <p className="text-white font-medium">Instagram</p>
          <input
            type="text"
            name="instagram"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.instagram}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">X (Twitter)</p>
          <input
            type="text"
            name="x"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.x}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">YouTube</p>
          <input
            type="text"
            name="youtube"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.youtube}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">Twitch</p>
          <input
            type="text"
            name="twitch"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.twitch}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">Kick</p>
          <input
            type="text"
            name="kick"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.kick}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">Discord</p>
          <input
            type="text"
            name="discord"
            placeholder="Invite code or username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.discord}
            onChange={handleChange}
          />
          
          <p className="text-white font-medium">LinkedIn</p>
          <input
            type="text"
            name="linkedIn"
            placeholder="Your username"
            className="w-full p-1 border-none rounded-md my-1"
            value={values.linkedIn}
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
    </div>
  );
};