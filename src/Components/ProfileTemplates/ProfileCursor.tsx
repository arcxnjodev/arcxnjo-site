import { useEffect, useState } from "react";

type ProfileCursorProps = {
  cursorUrl?: string;
};

export const ProfileCursor = ({ cursorUrl }: ProfileCursorProps) => {
  const cleanCursorUrl = cursorUrl?.trim();

  const [position, setPosition] = useState({
    x: -100,
    y: -100,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!cleanCursorUrl) return;

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
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
