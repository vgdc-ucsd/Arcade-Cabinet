import { useEffect, useState } from "react";
import useSound from "use-sound";
import rightButtonSound from "/sounds/button_right.wav";
import leftButtonSound from "/sounds/button_left.wav";
import selectButtonSound from "/sounds/button_select.wav";
import GameCard from "./components/GameCard";
import InfoBar from "./components/InfoBar";
import { Diff } from "lucide-react";

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

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [currentInput, setCurrentInput] = useState<GamepadInput>(BlankGamepad);
  const [lastInput, setLastInput] = useState<GamepadInput>(BlankGamepad);
  const [launching, setLaunching] = useState("");

  const [playRightButton] = useSound(rightButtonSound);
  const [playLeftButton] = useSound(leftButtonSound);
  const [playSelectButton] = useSound(selectButtonSound);

  const cols = 6;
  const rows = 3;

  const handleLeft = () => {
    const currentCol = selectedIndex % cols;

    if (currentCol > 0) {
      playLeftButton();
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleRight = () => {
    const currentCol = selectedIndex % cols;

    if (currentCol < cols - 1 && selectedIndex < games.length - 1) {
      playRightButton();
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleUp = () => {
    const currentRow = Math.floor(selectedIndex / cols);

    if (currentRow > 0) {
      playLeftButton();
      setSelectedIndex(selectedIndex - cols);
    }
  };

  const handleDown = () => {
    const currentRow = Math.floor(selectedIndex / cols);

    if (currentRow < rows - 1 && selectedIndex + cols < games.length) {
      playRightButton();
      setSelectedIndex(selectedIndex + cols);
    }
  };

  const handleEnter = () => {
    if (games.length == 0) return;

    playSelectButton();
    window.location.href = "vgdcgame:" + games[selectedIndex].command;
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
    if (event.repeat) return;
    if (event.key == "ArrowLeft") handleLeft();
    if (event.key == "ArrowRight") handleRight();
    if (event.key == "ArrowUp") handleUp();
    if (event.key == "ArrowDown") handleDown();
    if (event.key == "Enter") handleEnter();
  };

  useEffect(() => {
    if (currentInput.a && !lastInput.a) handleEnter();
    if (currentInput.start && !lastInput.start) handleEnter();
    if (currentInput.stick_left && !lastInput.stick_left) handleLeft();
    if (currentInput.stick_right && !lastInput.stick_right) handleRight();
    if (currentInput.stick_up && !lastInput.stick_up) handleUp();
    if (currentInput.stick_down && !lastInput.stick_down) handleDown();
    if (currentInput.dpad_left && !lastInput.dpad_left) handleLeft();
    if (currentInput.dpad_right && !lastInput.dpad_right) handleRight();
    if (currentInput.dpad_up && !lastInput.dpad_up) handleUp();
    if (currentInput.dpad_down && !lastInput.dpad_down) handleDown();
    setLastInput(currentInput);
  }, [currentInput]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [games, selectedIndex]);

  const getGames = async () => {
    const response = await fetch("/games/games.json");
    const data = await response.json();
    if (data) setGames(data.filter((game: Game) => game.active));
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

      if (gp.buttons.length > 13) {
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
      } else {
        inputs = {
          a: gp.buttons[0].pressed || inputs.a,
          b: gp.buttons[1].pressed || inputs.b,
          x: gp.buttons[2].pressed || inputs.x,
          y: gp.buttons[3].pressed || inputs.y,
          dpad_up: false,
          dpad_down: false,
          dpad_left: false,
          dpad_right: false,
          stick_up: gp.axes[1] < -0.8 || inputs.stick_up,
          stick_down: gp.axes[1] > 0.8 || inputs.stick_down,
          stick_left: gp.axes[0] < -0.8 || inputs.stick_left,
          stick_right: gp.axes[0] > 0.8 || inputs.stick_right,
          select: gp.buttons[8].pressed || inputs.select,
          start: gp.buttons[9].pressed || inputs.start,
        };
      }
    }

    setCurrentInput(inputs);

    start = requestAnimationFrame(gameLoop);
  }

  // window.addEventListener("gamepadconnected", () => {
  //   gameLoop();
  // });

  // window.addEventListener("gamepaddisconnected", () => {
  //   cancelAnimationFrame(start);
  // });

  useEffect(() => {
    getGames();
    requestAnimationFrame(gameLoop);
  }, []);

  return (
    <main className="bg-[#06050A] h-screen w-screen text-white font-inter overflow-hiddem flex flex-col">
      <div className="absolute top-6 left-4 text-white text-3xl font-inter animate-bounce z-10">
        {launching}
      </div>

      {/* Game Grid */}
      <div className="h-[90%] p-12">
        <div className="h-full flex justify-center">
          <div className="grid grid-cols-6 gap-12 auto-rows-fr">
            {games.map((game, i) => (
              <GameCard
                key={i}
                game={game}
                isSelected={i === selectedIndex}
                tier={game.tier}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
      {/* InfoBar */}
      <div className="flex px-12 items-center justify-center">
        <InfoBar
          gameName={games[selectedIndex]?.name || "SELECT GAME"}
          date={games[selectedIndex]?.year || "----"}
          difficulty={games[selectedIndex]?.difficulty || 0}
          gameCreators={games[selectedIndex]?.creators || "----"}
        />
        {/* <img src="./assets/VGDC-logo.png" className="w-36" /> */}
      </div>
    </main>
  );
}

export default App;
