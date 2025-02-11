// Sound stuff, idk
class Sound {
  constructor(url, num_concurrent) {
    this.audioElms = [];
    this.toPlayNext = 0;

    for (var i = 0; i < num_concurrent; i++) {
      this.audioElms.push(new Audio(url));
    }
  }

  play() {
    var a = this.audioElms[this.toPlayNext];

    a.pause();
    a.currentTime = 0;
    a.play();

    this.toPlayNext = (this.toPlayNext + 1) % this.audioElms.length;
  }
}

var rightSound = new Sound("assets/button_37.wav", 3);
var leftSound = new Sound("assets/button_37_pitched.wav", 3);
var confirmSound = new Sound("assets/button_41.wav", 3);

// Creates an angular module
angular
  .module("arcadeCabinet", [])

  // Remove "unsafe:" prefix that Firefox adds to the URI,
  // as in this Stack Overflow answer:
  // https://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
  .config([
    "$compileProvider",
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(
        /^\s*(https?|ftp|mailto|vgdcgame):/
      );
    },
  ])

  // This is where the fun stuff happens
  .controller("arcadeCtrl", function ($scope, $http) {
    // The current index of the selected games
    $scope.selectedGame = 0;
    // The list of games as JSON data
    $scope.games = [];

    // Gets all the games and adds their data to `games`. On Chrome, this creates CORS issues.
    $http.get("Games/Games.json").success(function (data) {
      data.forEach(function (name) {
        $http.get("Games/" + name + "/Game.json").success(function (data) {
          $scope.games.push(data);
        });
      });
    });

    // Container of all the games
    var gameDiv = document.getElementById("games");
    // TODO: FIGURE OUT WHAT THIS IS
    var selectCooldown = 0;

    // This is a modulo command that changes numbers based on the # of games
    $scope.mod = function (num) {
      var base = $scope.games.length;
      return ((num % base) + base) % base;
    };

    // Function that moves X games to the left or right and plays a sound.
    // I'm surprised the selectedGame doesn't have modulo applied
    function move(delta) {
      // Only moves if the cooldown has run out
      if (!selectCooldown) {
        $scope.selectedGame += delta;
        $scope.$apply();

        if (delta == 1) {
          rightSound.play();
        } else if (delta == -1) {
          leftSound.play();
        }
      }
    }

    // This sets the "Launching......." text in the top-right corner
    function setLaunchingText(text) {
      document.getElementById("launching-text").innerHTML = text;
    }

    // Seems to have to do with launching then re-launching games.
    // Avoids overlap.
    var numLaunchWaitCycles = 0;
    var maxLaunchWaitCycles = 10;
    var launchWaitCycleTime = 1000;

    // This is run when a game is launched, and then re-runs every {launchWaitCycleTime} until it reaches {maxLaunchWaitCycles} cycles.
    function launchWaitCycle() {
      // Increments the wait cycle
      numLaunchWaitCycles++;

      // If the wait cycles have gone on long enough, stop the cycle
      if (numLaunchWaitCycles > maxLaunchWaitCycles) {
        selectCooldown = 0;
        // Get rid of the launching text
        setLaunchingText("");
      }
      // If we're still waiting...
      else {
        // Set the launching text
        var str = "Launching";
        for (var i = 0; i < numLaunchWaitCycles - 1; i++) {
          str += ".";
        }
        setLaunchingText(str);

        // Loop the cycle in {launchWaitCycleTime} ms
        window.setTimeout(launchWaitCycle, launchWaitCycleTime);
      }
      // Renders changes
      $scope.$apply();
    }

    // Plays (or "selects") a game
    function select() {
      // Only selects a game if the cooldown has run out
      if (!selectCooldown) {
        // Plays a sound
        confirmSound.play();

        // A second ago this was a number, I'm annoyed
        selectCooldown = true;
        // This updates the DOM to reflect changes
        $scope.$apply();

        // Starts a new wait cycle
        numLaunchWaitCycles = 0;
        launchWaitCycle();

        // Literally runs the game by finding the game element and then "clicking" it
        gameDiv
          .getElementsByClassName("game")
          [
            $scope.mod($scope.selectedGame, gameDiv.children.length)
          ].children[0].click();
      }
    }

    // This defines the style of each game element
    $scope.getTransform = function (i) {
      // This is how many games it *appears* there are.
      // There's basically a fake "circle" of games. This is the number of games in that circle.
      // Higher numbers will show no rotation, low numbers will show a tiny number of games side by side.
      // 18 looks pretty good.
      var count = 18; //$scope.games.length;

      // Some fancy math to decide the rotation
      var z = Math.round(1000 / 2 / Math.tan(Math.PI / count));

      var rotateY = (-$scope.selectedGame * 360) / count;
      // This is the transform on the "games" div
      $scope.transform = "translateZ(" + -z + "px) rotateY(" + rotateY + "deg)";

      // Add multiples of the game list length to this index i so that
      // it's the closest to the camera.
      var length = $scope.games.length;
      i += length * Math.floor(($scope.selectedGame - i) / length + 0.5);

      var rotateY = (i * 360) / count;
      return "rotateY(" + rotateY + "deg) translateZ(" + z + "px)";
    };

    var rightLast = false;
    var leftLast = false;
    var selectLast = false;

    // The loop for keyboard and joystick input.
    // This isn't actually too complex.
    function inputLoop() {
      if (!document.hasFocus()) {
        rightLast = false;
        leftLast = false;
        selectLast = true; // True so if the select button is held as the
        // browser regains focus, we don't immediately launch a game.
        window.requestAnimationFrame(inputLoop);
        return;
      }

      var right = false;
      var left = false;
      var select = false;

      var gamepads = navigator.getGamepads();
      for (var i = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (!gamepad) {
          continue;
        }

        var deadZone = 0.9;

        if (gamepad.axes[0] >= deadZone) {
          right = true;
        } else if (gamepad.axes[0] <= -deadZone) {
          left = true;
        }

        //else if(Math.abs(gamepad.axes[0]) < deadZone && Math.abs(gamepad.axes[1]) < deadZone) {
        //    axisDown = false;
        //}

        //if (gamepad.buttons[1].pressed) { // green button
        if (gamepad.buttons[9].pressed) {
          // start button
          select = true;
        }
      }

      if (right && !rightLast) {
        $scope.$broadcast("right");
      } else if (left && !leftLast) {
        $scope.$broadcast("left");
      }

      if (select && !selectLast) {
        $scope.$broadcast("select");
      }

      rightLast = right;
      leftLast = left;
      selectLast = select;

      // Re-runs this loop every frame
      window.requestAnimationFrame(inputLoop);
    }

    // Runs the input loop the first time.
    inputLoop();

    // Keyboard controls for testing purposes.
    angular.element(window).on("keydown", function (e) {
      if (e.keyCode == 39) {
        $scope.$broadcast("right");
      }
      if (e.keyCode == 37) {
        $scope.$broadcast("left");
      }
      if (e.keyCode == 13) {
        $scope.$broadcast("select");
      }
    });

    // Moves or selects based on input broadcast.
    $scope.$on("right", function (e) {
      move(1);
    });
    $scope.$on("left", function (e) {
      move(-1);
    });
    $scope.$on("select", function (e) {
      select();
    });
    $scope.$on("back", function (e) {
      console.log("back");
    });
  });
