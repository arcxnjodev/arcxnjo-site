import "./App.css";
import { AdminPanel } from "./Components/AdminPanel";
import { Home } from "./Components/Home";
import { Login } from "./Components/Login";
import { Register } from "./Components/Register";
import { Pricing } from "./Components/Pricing";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserPanel } from "./Components/UserPanel";
import { Checkout } from "./Components/Checkout";
import { Success } from "./Components/Success";
import { Cancel } from "./Components/Cancel";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/panel" element={<AdminPanel />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<UserPanel />} />
        <Route path="/checkout/:plan" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;