class Sound {
    constructor(url, num_concurrent) {
        this.audioElms = []
        this.toPlayNext = 0;

        for (var i=0; i<num_concurrent; i++) {
            this.audioElms.push(new Audio(url));
        }
    }

    play() {
        var a = this.audioElms[this.toPlayNext];

        a.pause();
        a.currentTime = 0;
        a.play();

        this.toPlayNext = (this.toPlayNext+1) % this.audioElms.length;
    }
}

var rightSound   = new Sound('assets/button_37.wav', 3);
var leftSound    = new Sound('assets/button_37_pitched.wav', 3);
var confirmSound = new Sound('assets/button_41.wav', 3);

angular.module('arcadeCabinet', [])

// Remove "unsafe:" prefix that Firefox adds to the URI,
// as in this Stack Overflow answer:
// https://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
.config([
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|vgdcgame):/);
    }
])

.controller('arcadeCtrl', function($scope, $http) {
    $scope.selectedGame = 0;
    $scope.games = [];

    var gameNames = ["Colors", "Panda", "Distilled"];

    gameNames.forEach(function(name) {
        $http.get("Games/" + name + "/Game.json")
        .success(function(data) {
            $scope.games.push(data);
        });
    });

    var gameDiv = document.getElementById("games");
    var selectCooldown = 0;

    $scope.mod = function(num) {
        var base = $scope.games.length;
        return ((num % base) + base) % base;
    }

    function move(delta) {
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
    
    function setLaunchingText(text) {
        document.getElementById("launching-text").innerHTML = text;
    }
    
    var numLaunchWaitCycles = 0;
    var maxLaunchWaitCycles = 10;
    var launchWaitCycleTime = 1000;
    
    function launchWaitCycle() {
        numLaunchWaitCycles ++;
        
        if (numLaunchWaitCycles > maxLaunchWaitCycles) {
            selectCooldown = 0;
            setLaunchingText("");
        } else {
            var str = "Launching";
            for (var i=0; i<numLaunchWaitCycles-1; i++) {
                str += ".";
            }
            setLaunchingText(str);
            
            window.setTimeout(launchWaitCycle, launchWaitCycleTime);
        }
        $scope.$apply();
    }

    function select() {
        if (!selectCooldown) {
            confirmSound.play();

            selectCooldown = true;
            $scope.$apply();

            numLaunchWaitCycles = 0;
            launchWaitCycle();

            gameDiv.getElementsByClassName("game")[$scope.mod($scope.selectedGame, gameDiv.children.length)].children[0].click();

        }
    }

    $scope.getTransform = function(i) {
        var count = 18;//$scope.games.length;

        var z = Math.round((1000 / 2) / Math.tan(Math.PI / count));

        var rotateY = -$scope.selectedGame * 360 / count;
        $scope.transform = "translateZ(" + (-z) + "px) rotateY(" + rotateY + "deg)";

        // Add multiples of the game list length to this index i so that
        // it's the closest to the camera.
        var length = $scope.games.length;
        i += length * Math.floor(($scope.selectedGame-i) / length + 0.5);

        var rotateY = i * 360 / count;
        return "rotateY(" + rotateY + "deg) translateZ(" + z + "px)";
    }

    var rightLast = false;
    var leftLast = false;
    var selectLast = false;

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

            if (gamepad.buttons[1].pressed) {
                select = true;
            }
        }

        if (right && !rightLast) {
            $scope.$broadcast('right');
        } else if (left && !leftLast) {
            $scope.$broadcast('left');
        }

        if (select && !selectLast) {
            $scope.$broadcast('select');
        }

        rightLast = right;
        leftLast = left;
        selectLast = select;

        window.requestAnimationFrame(inputLoop);
    }

    inputLoop();

    // Keyboard controls for testing purposes.
    angular.element(window).on('keydown', function(e) {
        if (e.keyCode == 39) {
            $scope.$broadcast('right');
        }
        if (e.keyCode == 37) {
            $scope.$broadcast('left');
        }
        if (e.keyCode == 13) {
            $scope.$broadcast('select');
        }
    });

    $scope.$on('right' , function (e) { move(1); });
    $scope.$on('left'  , function (e) { move(-1); });
    $scope.$on('select', function (e) { select() });
    $scope.$on('back'  , function (e) { console.log("back"); });
});
