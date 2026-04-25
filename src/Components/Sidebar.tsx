import { UiFastRegister } from "./Ui/UiFastRegister";

export const Sidebar = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* GIF DE FUNDO */}
    <img
    src="/images/fundo.jpg"
    alt="Background"
    className="absolute top-0 left-0 w-full h-full object-cover brightness-50 contrast-125"
  />

      {/* Overlay escuro (opcional, para texto ficar legível) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold mb-6 text-center">
          Everything you need is here.
        </h1>
        <p className="text-xl w-[70%] text-center mb-8">
          ARCXNJO is your go-to destination for modern, feature-rich biolinks
          and fast, secure file hosting. Everything you need is here.
        </p>
        <UiFastRegister />
      </div>
    </div>
  );
};