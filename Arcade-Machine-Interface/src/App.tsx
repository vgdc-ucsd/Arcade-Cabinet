import { useEffect, useState } from "react";
import useSound from "use-sound";
import rightButtonSound from "/sounds/button_right.wav";
import leftButtonSound from "/sounds/button_left.wav";
import selectButtonSound from "/sounds/button_select.wav";

const count = 18;

type Game = {
  name: String;
  thumbnail: String;
  description: String;
  creators: String;
  command: String;
};

const positiveModulo = (val: number, mod: number) => {
  return ((val % mod) + mod) % mod;
};

function App() {
  const [index, setIndex] = useState(0);
  const [games, setGames] = useState<Game[]>([]);

  const [playRightButton] = useSound(rightButtonSound);
  const [playLeftButton] = useSound(leftButtonSound);
  const [playSelectButton] = useSound(selectButtonSound);

  const handleKeyDown = (event: any) => {
    if (event.repeat) return;
    if (event.key == "ArrowLeft") {
      playLeftButton();
      setIndex((i) => i - 1);
    }
    if (event.key == "ArrowRight") {
      playRightButton();
      setIndex((i) => i + 1);
    }
    if (event.key == "Enter") {
      playSelectButton();
      window.location.href =
        "vgdcgame:" + games[positiveModulo(index, games.length)].command;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [games, index]);

  const getGames = async () => {
    const response = await fetch("/games/games.json");
    const data = await response.json();
    if (data) setGames(data);
  };

  useEffect(() => {
    getGames();
  }, []);

  return (
    <main className="bg-[#06050a] h-screen absolute w-screen text-white font-inter overflow-clip">
      <div className="absolute w-full h-fit top-[50%] -translate-y-[50%]">
        {/* Centerpiece */}
        <div className="w-128 mx-auto h-fit">
          <img src="./assets/VGDC-logo.png" className="w-80 mx-auto" />
          <h1 className="text-center mt-6 text-4xl font-semibold">
            Arcade Machine
          </h1>
          <h3 className="text-center mt-2 text-lg">
            Games made by VGDC members!
            <br />
            Join us at{" "}
            <a
              className="text-[#50d0a1] font-semibold"
              href="https://www.vgdc.dev"
            >
              vgdc.dev
            </a>
            !
          </h3>
        </div>
        <div className="h-140 perspective-distant">
          <div
            style={{
              transform: `translateZ(-${Math.round(
                1000 / 2 / Math.tan(Math.PI / count)
              )}px) rotateY(${(-index * 360) / count}deg)`,
            }}
            className="w-full transition-all top-[10%] transform-3d duration-300"
          >
            {games.map((game, i) => (
              <Game
                index={i}
                currentPosition={index}
                totalGames={games.length}
                name={game.name}
                description={game.description}
                thumbnail={game.thumbnail}
                creators={game.creators}
                command={game.command}
                key={i}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Game({
  index,
  currentPosition,
  totalGames,
  name,
  thumbnail,
  description,
  creators,
  command,
}: any) {
  // Some fancy math to decide the rotation
  let z = Math.round(1000 / 2 / Math.tan(Math.PI / count));

  let newIndex =
    index +
    totalGames * Math.floor((currentPosition - index) / totalGames + 0.5);

  let rotateY = (newIndex * 360) / count;

  return (
    <a
      id={`startgame:${index}`}
      href={`vgdcgame:${command}`}
      style={{ transform: `rotateY(${rotateY}deg) translateZ(${z}px)` }}
      className={`w-160 h-128 block absolute -translate-x-[50%] left-[50%] top-[5vh] transition-colors duration-300`}
    >
      <img src={thumbnail}></img>
      <div className="whitespace-pre">
        <h2 className="text-center mt-6 text-2xl font-semibold">{name}</h2>
        <h3 className="text-center text-xl">{description}</h3>
        <h4 className="text-center text-base font-light leading-6 mt-2">
          By {creators}
        </h4>
      </div>
    </a>
  );
}

export default App;
