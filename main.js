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

    function select() {
        if (!selectCooldown) {
            gameDiv.getElementsByClassName("game")[$scope.mod($scope.selectedGame, gameDiv.children.length)].children[0].click();

            confirmSound.play();

            selectCooldown = true;
            $scope.$apply();

            window.setTimeout(function() {
                selectCooldown = 0;
                $scope.$apply();
            }, 2000);
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

    var axisDown = false;
    var buttonDown = false;
    var stepCount = 0;

    function inputLoop() {
        // Pretty hacky way to slow down the rapidfire scrolling...
        stepCount ++;
        if (!axisDown) {
            stepCount = 0;
        }
        if (stepCount % 8 != 0) {
            window.requestAnimationFrame(inputLoop);
            return;
	}

        var gamepads = navigator.getGamepads();
        for (var playerIndex = 0; playerIndex < gamepads.length; playerIndex++) {
            if(!document.hasFocus()) break;
            var gamepad = gamepads[playerIndex];
            if (gamepad) {
                if(gamepad.axes[0] >= 0.9 && !axisDown) {
                    $scope.$broadcast('right');
                    axisDown = true;
                }
                else if(gamepad.axes[0] <= -0.9 && !axisDown) {
                    $scope.$broadcast('left');
                    axisDown = true;
                }
                else if(gamepad.axes[1] >= 0.9 && !axisDown) {
                    $scope.$broadcast('down');
                    axisDown = true;
                }
                else if(gamepad.axes[1] <= -0.9 && !axisDown) {
                    $scope.$broadcast('up');
                    axisDown = true;
                }
                else if(Math.abs(gamepad.axes[0]) < 0.9 && Math.abs(gamepad.axes[1]) < 0.9) {
                    axisDown = false;
                }

                if(gamepad.buttons[1].pressed == true && !buttonDown) {
                    $scope.$broadcast('select');
                    buttonDown = true;
                }
                else if(gamepad.buttons[2].pressed == true && !buttonDown) {
                    $scope.$broadcast('back');
                    buttonDown = true;
                }
                else if(gamepad.buttons[1].pressed == false && gamepad.buttons[2].pressed == false) {
                    buttonDown = false;
                }
            }
        }
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
