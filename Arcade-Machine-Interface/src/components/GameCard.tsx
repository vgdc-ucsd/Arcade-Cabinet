import React from "react";

type Game = {
  name: string;
  thumbnail: string;
  description: string;
  creators: string;
  command: string;
  year: string;
  active: boolean;
  tier: number;
  difficulty: number;
};

type GameCardProps = {
  game: Game;
  isSelected: boolean;
  tier: number;
  onClick: () => void;
};

const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected,
  tier,
  onClick,
}) => {
  const getCasing = () => {
    switch (tier) {
      case 1:
        return "bg-[#505050]/50";
      case 2:
        return "bg-gradient-to-b from-yellow-600 to-yellow-700";
      case 3:
        return "bg-gradient-to-r from-[#267392] via-[#3c99aa] via-[#0eb9ae] to-[#50d0a1]";
      default:
        return "bg-[#505050]/50";
    }
  };

  const getSlider = () => {
    switch (tier) {
      case 1:
        return "bg-[#505050]";
      case 2:
        return "bg-yellow-600";
      case 3:
        return "bg-[#267392]";
      default:
        return "bg-[#505050]";
    }
  };

  const getGlow = () => {
    switch (tier) {
      case 1:
        return "shadow-[0_0_20px_rgba(80,80,80,0.3)]";
      case 2:
        return "shadow-[0_0_30px_rgba(255,215,0,0.5)]"; // Gold glow
      case 3:
        return "shadow-[0_0_30px_rgba(80,208,161,0.5)]"; // Teal glow
      default:
        return "";
    }
  };

  return (
    <div
      className={`
        aspect-4/5 flex transition-all duration-200 cursor-pointer rounded-4xl
        ${
          isSelected
            ? "transform scale-105 animate-wiggle"
            : "hover:transform hover:scale-102 hover:shadow-xl"
        }
      `}
      onClick={onClick}
    >
      <div
        className={`${getCasing()} rounded-4xl h-19/20 flex flex-col ${
          isSelected ? `${getGlow()}` : ""
        }`}
      >
        {/* Thumbnail */}
        <div className="pt-4 px-4 pb-2 overflow-hidden">
          <div className="aspect-square rounded-2xl overflow-hidden relative">
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover"
            />
            {/* Single overlay with combined shadows */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(0,0,0,0.6)]"></div>
          </div>
        </div>
        {/* Notch */}
        <div className="flex-1 flex flex-col h-full items-center">
          <div className="bg-black/50 w-3/4 rounded-t-2xl h-full flex">
            <div
              className={`h-full w-7/10 m-3 rounded-xl transition-all duration-300 ease-in-out ${
                isSelected ? "ml-auto bg-white" : `mr-auto ${getSlider()}`
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
