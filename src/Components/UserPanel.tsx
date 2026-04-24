import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instagram from "../assets/images/instagram.png";
import twitter from "../assets/images/x.png";
import youtube from "../assets/images/youtube.png";
import twitch from "../assets/images/twitch.png";
import kick from "../assets/images/kick.avif";
import discord from "../assets/images/discord.png";
import linkedIn from "../assets/images/linkedin.png";

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

export const UserPanel = () => {
  const [userData, setUserData] = useState<userDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.pathname.substring(1, location.pathname.length);

  const getData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/profile/${username}`);
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setLoading(false);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  useEffect(() => {
    getData();
  }, [username]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <h1 className="text-red-600 text-lg p-4">User not found. Redirecting...</h1>
      </div>
    );
  }

  const profile = userData.profile;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {profile?.banner_image && (
        <img src={profile.banner_image} className="absolute top-0 left-0 w-full h-full object-cover opacity-50" />
      )}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60"></div>
      <div className="relative z-10 bg-opacity-80 bg-gray-800 w-[500px] min-h-[350px] flex flex-col items-center rounded-xl p-6 shadow-2xl border border-purple-500 backdrop-blur-sm">
        <div className="mt-8">
          <img
            src={profile?.profile_image || "https://cdn-icons-png.flaticon.com/512/219/219986.png"}
            className="rounded-full w-[100px] h-[100px] object-cover border-4 border-purple-500"
          />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold mt-2">{userData.username}</h1>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          {userData.socialMedia?.instagram && (
            <a href={"https://www.instagram.com/" + userData.socialMedia.instagram} target="_blank">
              <img src={instagram} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.x && (
            <a href={"https://www.x.com/" + userData.socialMedia.x} target="_blank">
              <img src={twitter} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.youtube && (
            <a href={"https://www.youtube.com/@" + userData.socialMedia.youtube} target="_blank">
              <img src={youtube} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.twitch && (
            <a href={"https://www.twitch.tv/" + userData.socialMedia.twitch} target="_blank">
              <img src={twitch} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.kick && (
            <a href={"https://www.kick.com/" + userData.socialMedia.kick} target="_blank">
              <img src={kick} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.discord && (
            <a href={"https://discord.gg/" + userData.socialMedia.discord} target="_blank">
              <img src={discord} className="w-10 hover:scale-110 transition" />
            </a>
          )}
          {userData.socialMedia?.linkedIn && (
            <a href={"https://www.linkedin.com/in/" + userData.socialMedia.linkedIn} target="_blank">
              <img src={linkedIn} className="w-10 hover:scale-110 transition" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};