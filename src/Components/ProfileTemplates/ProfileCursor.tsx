import { useEffect, useState } from "react";

type ProfileCursorProps = {
  cursorUrl?: string;
};

export const ProfileCursor = ({ cursorUrl }: ProfileCursorProps) => {
  const cleanCursorUrl = cursorUrl?.trim();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!cleanCursorUrl) return;

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cleanCursorUrl]);

  if (!cleanCursorUrl) return null;

  return (
    <img
      src={cleanCursorUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none fixed z-[9999] hidden h-[30px] w-[30px] select-none object-contain transition-opacity duration-150 md:block ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-2px, -2px)",
      }}
    />
  );
};
