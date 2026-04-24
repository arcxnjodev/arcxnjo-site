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

export const ProfileImagesSettings = () => {
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile/images`,
        {
          profileImage: values.profileImage,
          bannerImage: values.bannerImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessage("✅ Images saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error: any) {
      setMessage("❌ Error saving: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const { values, handleSubmit, handleChange, setValues } = useFormik({
    initialValues: {
      profileImage: "",
      bannerImage: "",
    },
    onSubmit,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setValues({
          profileImage: response.data.profile_image || "",
          bannerImage: response.data.banner_image || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="bg-purple-700 p-10 rounded-lg m-5">
      <p className="text-2xl font-bold mb-5 text-white">Profile Images</p>
      
      {message && (
        <div className={`mb-4 p-2 rounded text-center ${message.includes("✅") ? "bg-green-500" : "bg-red-500"} text-white`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <p className="text-white font-medium">Profile Picture (URL)</p>
        <input
          type="text"
          name="profileImage"
          placeholder="Enter image URL"
          className="w-full p-1 border-none rounded-md my-1"
          value={values.profileImage}
          onChange={handleChange}
        />
        
        <p className="text-white font-medium mt-4">Banner Image (URL)</p>
        <input
          type="text"
          name="bannerImage"
          placeholder="Enter image URL"
          className="w-full p-1 border-none rounded-md my-1"
          value={values.bannerImage}
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