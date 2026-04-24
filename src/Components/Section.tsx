import { UiFastRegister } from "./Ui/UiFastRegister";

export const Section = () => {
  return (
    <div className="bg-main w-[70%] rounded-xl text-white p-[55px] mx-auto">
      <h1 className="text-5xl">Everything you need is here.</h1>
      <p className="text-lg">
        Join over 280,000 people using Banana.com and become <br />
        part of our large community
      </p>
      <UiFastRegister />
    </div>
  );
};