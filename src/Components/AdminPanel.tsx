import { AdminMenu } from "./Ui/AdminMenu";
import { Settings } from "./Ui/Settings";
import { useSelector } from "react-redux";
import { userSliceType } from "../Store/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const AdminPanel = () => {
  const navigate = useNavigate();
  const { email } = useSelector((store: { user: userSliceType }) => store.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Só redireciona se não tiver token E não tiver email
    if (!token && !email) {
      navigate("/login");
    }
  }, [token, email, navigate]);

  // Se não tiver token, não renderiza nada (evita piscar)
  if (!token && !email) {
    return null;
  }

  return (
    <div className="flex">
      <AdminMenu email={email || ""} />
      <Settings />
    </div>
  );
};