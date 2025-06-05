import React, { useEffect, useState } from "react";

interface LoadingProps {
  isVisible: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isVisible }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const text = "....";

  useEffect(() => {
    if (isVisible) {
      setActiveIndex(0);
    } else {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % text.length);
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible, text.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="text-white text-9xl font-inter">
        {text.split("").map((letter, index) => (
          <span
            key={index}
            className={`inline-block transition-transform duration-300 ${
              index === activeIndex ? "-translate-y-5" : "translate-y-0"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Loading;
