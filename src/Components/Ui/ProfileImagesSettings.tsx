import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userSliceType } from "../../Store/userSlice";

export const ProfileImagesSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const { email } = useSelector((store: { user: userSliceType }) => store.user);

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(
        "http://localhost:3001/api/profile/images",
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

  const handleFileUpload = async (file: File, type: 'profile' | 'banner') => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:3001/api/upload", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      if (type === 'profile') {
        setFieldValue('profileImage', response.data.url);
      } else {
        setFieldValue('bannerImage', response.data.url);
      }
      
      setMessage("✅ File uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error: any) {
      setMessage("❌ Upload failed: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const { values, handleSubmit, handleChange, setFieldValue, setValues } = useFormik({
    initialValues: {
      profileImage: "",
      bannerImage: "",
    },
    onSubmit,
  });

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setValues({
        profileImage: response.data.profile_image || "",
        bannerImage: response.data.banner_image || "",
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
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
        <p className="text-white font-medium">Profile Picture (URL or upload)</p>
        <input
          type="text"
          name="profileImage"
          placeholder="Enter image URL"
          className="w-full p-1 border-none rounded-md my-1"
          value={values.profileImage}
          onChange={handleChange}
        />
        
        <div className="my-2">
          <label className="text-white text-sm">Or upload an image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'profile');
            }}
            className="w-full text-white text-sm mt-1"
            disabled={uploading}
          />
        </div>
        
        <p className="text-white font-medium mt-4">Banner Image (URL or upload)</p>
        <input
          type="text"
          name="bannerImage"
          placeholder="Enter image URL"
          className="w-full p-1 border-none rounded-md my-1"
          value={values.bannerImage}
          onChange={handleChange}
        />
        
        <div className="my-2">
          <label className="text-white text-sm">Or upload a banner:</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'banner');
            }}
            className="w-full text-white text-sm mt-1"
            disabled={uploading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-purple-900 w-full p-3 rounded-md my-4 text-white hover:bg-purple-800 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : uploading ? "Uploading..." : "Save"}
        </button>
      </form>
    </div>
  );
};