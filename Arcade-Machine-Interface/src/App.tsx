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

type GamepadInput = {
  a: boolean;
  b: boolean;
  x: boolean;
  y: boolean;
  dpad_up: boolean;
  dpad_down: boolean;
  dpad_left: boolean;
  dpad_right: boolean;
  stick_up: boolean;
  stick_down: boolean;
  stick_left: boolean;
  stick_right: boolean;
  select: boolean;
  start: boolean;
};

const BlankGamepad: GamepadInput = {
  a: false,
  b: false,
  x: false,
  y: false,
  dpad_up: false,
  dpad_down: false,
  dpad_left: false,
  dpad_right: false,
  stick_up: false,
  stick_down: false,
  stick_left: false,
  stick_right: false,
  select: false,
  start: false,
};

const FullGamepad: GamepadInput = {
  a: true,
  b: true,
  x: true,
  y: true,
  dpad_up: true,
  dpad_down: true,
  dpad_left: true,
  dpad_right: true,
  stick_up: true,
  stick_down: true,
  stick_left: true,
  stick_right: true,
  select: true,
  start: true,
};

const positiveModulo = (val: number, mod: number) => {
  return ((val % mod) + mod) % mod;
};

function App() {
  const [index, setIndex] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [currentInput, setCurrentInput] = useState<GamepadInput>(BlankGamepad);
  const [lastInput, setLastInput] = useState<GamepadInput>(BlankGamepad);
  const [launching, setLaunching] = useState("");

  const [playRightButton] = useSound(rightButtonSound);
  const [playLeftButton] = useSound(leftButtonSound);
  const [playSelectButton] = useSound(selectButtonSound);

  const handleLeft = () => {
    playLeftButton();
    setIndex((i) => i - 1);
  };

  const handleRight = () => {
    playRightButton();
    setIndex((i) => i + 1);
  };

  const handleEnter = () => {
    playSelectButton();
    window.location.href =
      "vgdcgame:" + games[positiveModulo(index, games.length)].command;
    // Launching text
    setLaunching("Launching...");
    const handleLaunch = (i: number) => {
      if (i > 0) {
        setLaunching((val) => val + ".");
        setTimeout(() => handleLaunch(i - 1), 1000);
      } else {
        setLaunching("");
      }
    };
    setTimeout(() => handleLaunch(7), 1000);
  };

  const handleKeyDown = (event: any) => {
    console.log(event.key);
    if (event.repeat) return;
    if (event.key == "ArrowLeft") handleLeft();
    if (event.key == "ArrowRight") handleRight();
    if (event.key == "Enter") handleEnter();
  };

  useEffect(() => {
    if (currentInput.a && !lastInput.a) handleEnter();
    if (currentInput.start && !lastInput.start) handleEnter();
    if (currentInput.stick_left && !lastInput.stick_left) handleLeft();
    if (currentInput.stick_right && !lastInput.stick_right) handleRight();
    if (currentInput.dpad_left && !lastInput.dpad_left) handleLeft();
    if (currentInput.dpad_right && !lastInput.dpad_right) handleRight();
    setLastInput(currentInput);
  }, [currentInput]);

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

  let start: number;

  function gameLoop() {
    if (!document.hasFocus()) {
      setLastInput(FullGamepad);
      start = requestAnimationFrame(gameLoop);
      return;
    }

    const gamepads = navigator.getGamepads();

    if (!gamepads) return;

    let inputs: GamepadInput = structuredClone(BlankGamepad);

    for (let i = 0; i < gamepads.length; i++) {
      let gp = gamepads[i];

      if (!gp) continue;

      inputs = {
        a: gp.buttons[0].pressed || inputs.a,
        b: gp.buttons[1].pressed || inputs.b,
        x: gp.buttons[2].pressed || inputs.x,
        y: gp.buttons[3].pressed || inputs.y,
        dpad_up: gp.buttons[12].pressed || inputs.dpad_up,
        dpad_down: gp.buttons[13].pressed || inputs.dpad_down,
        dpad_left: gp.buttons[14].pressed || inputs.dpad_left,
        dpad_right: gp.buttons[15].pressed || inputs.dpad_right,
        stick_up: gp.axes[1] < -0.8 || inputs.stick_up,
        stick_down: gp.axes[1] > 0.8 || inputs.stick_down,
        stick_left: gp.axes[0] < -0.8 || inputs.stick_left,
        stick_right: gp.axes[0] > 0.8 || inputs.stick_right,
        select: gp.buttons[8].pressed || inputs.select,
        start: gp.buttons[9].pressed || inputs.start,
      };
    }

    setCurrentInput(inputs);

    start = requestAnimationFrame(gameLoop);
  }

  window.addEventListener("gamepadconnected", () => {
    console.log("connected");
    gameLoop();
  });

  window.addEventListener("gamepaddisconnected", () => {
    console.log("disconnected");
    cancelAnimationFrame(start);
  });

  useEffect(() => {
    getGames();
  }, []);

  return (
    <main className="bg-[#06050a] h-screen absolute w-screen text-white font-inter overflow-clip">
      <div className="absolute top-6 left-4 text-white text-3xl font-inter animate-bounce">
        {launching}
      </div>
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
