import { UiFastRegister } from "./Ui/UiFastRegister";

export const Sidebar = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Imagem de fundo escura */}
      <img
        src="/images/fundo.png"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover brightness-50 contrast-125"
      />

      {/* Overlay escuro adicional */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center drop-shadow-lg">
          Everything you need is here.
        </h1>
        <p className="text-lg md:text-xl w-full md:w-[70%] text-center mb-8 text-gray-200">
          ARCXNJO is your go-to destination for modern, feature-rich biolinks
          and fast, secure file hosting. Everything you need is here.
        </p>
        <UiFastRegister />
      </div>
    </div>
  );
};