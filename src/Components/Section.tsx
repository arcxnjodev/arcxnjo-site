import { UiFastRegister } from "./Ui/UiFastRegister";

export const Section = () => {
  return (
    <div className="bg-main w-[70%] rounded-xl text-white p-[55px] mx-auto">
      <h1 className="text-5xl">Everything you need is here.</h1>
      <p className="text-lg">
       Join the people who use Arcxnjo.com and become part of our great community.
      </p>
      <UiFastRegister />
    </div>
  );
};