import { useEffect, useState } from "react";

type Props = {
  text: string;
  className?: string;
  speed?: number; // ms por caractere
  delay?: number; // delay inicial em ms
};

export const TypewriterBio = ({
  text,
  className = "",
  speed = 35,
  delay = 400,
}: Props) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    let i = 0;
    const timeout = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);

      return () => window.clearInterval(interval);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <p className={`whitespace-pre-line ${className}`}>
      {displayed}
      {!done && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-current align-middle opacity-80" />
      )}
    </p>
  );
};
