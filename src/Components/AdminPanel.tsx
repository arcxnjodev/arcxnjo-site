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
    if (!token && !email) {
      navigate("/login");
    }
  }, [token, email, navigate]);

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