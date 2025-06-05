import React from "react";
import { Calendar, Skull, Users2 } from "lucide-react";

type InfoBarProps = {
  gameName: string;
  date: string;
  difficulty: number;
  gameCreators: string;
};

const InfoBar: React.FC<InfoBarProps> = ({
  gameName,
  date,
  difficulty,
  gameCreators,
}) => {
  const renderSkulls = () => {
    const skulls = [];
    for (let i = 0; i < 5; i++) {
      skulls.push(
        <Skull
          key={i}
          className={`h-6 w-6 ${
            i < difficulty ? "text-white" : "text-black/40"
          }`}
        />
      );
    }
    return skulls;
  };

  return (
    <div className="px-12">
      <div className="h-20 rounded-full p-1 bg-gradient-to-r  from-[#267392] via-[#3c99aa] via-[#0eb9ae] to-[#50d0a1]">
        <div className="h-full flex items-center gap-4 px-2">
          {/* Game Name */}
          <div className="w-[1000px] h-16 rounded-full bg-[#3A3F41]/50 flex items-center gap-4 px-6">
            <Users2 className="h-8 w-8 flex-shrink-0" />
            <div className="flex flex-col -space-y-1">
              <span className="text-white font-bold text-xl uppercase tracking-wider truncate">
                {gameName}
              </span>
              <span className="text-gray-300 text-sm uppercase truncate">
                {gameCreators}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="w-[200px] h-16 rounded-full bg-[#3A3F41]/50 flex justify-center items-center px-6">
            <Calendar className="h-8 w-8 flex-shrink-0" />
            <span className="text-white font-bold text-xl mx-auto truncate">
              {date}
            </span>
          </div>

          {/* Difficulty */}
          <div className="w-[300px] h-16 rounded-full bg-[#3A3F41]/50 flex justify-center items-center px-6">
            <span className="flex mx-auto truncate">{renderSkulls()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;
