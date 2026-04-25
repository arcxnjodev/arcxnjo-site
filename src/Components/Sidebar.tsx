import { UiFastRegister } from "./Ui/UiFastRegister";

export const Sidebar = () => {
  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        
        {/* Título em roxo com sombra */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center text-purple-400 drop-shadow-lg">
          Everything you need is here.
        </h1>
        
        <p className="text-lg md:text-xl w-full md:w-[70%] text-center mb-8 text-gray-300">
          ARCXNJO is your go-to destination for modern, feature-rich biolinks
          and fast, secure file hosting. Everything you need is here.
        </p>
        
        <UiFastRegister />
      </div>
    </div>
  );
};