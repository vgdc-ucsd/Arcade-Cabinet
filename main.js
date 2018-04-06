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
.config( [
    '$compileProvider',
    function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|vgdcgame):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
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

    $scope.mod = function(num) {
        var base = $scope.games.length;
        return ((num % base) + base) % base;
    }

    function select(delta) {
        if (selectCooldown == 0) {
            $scope.selectedGame += delta;
            $scope.$apply();
            if (delta == 1) {
                rightSound.play();
            } else if (delta == -1) {
                leftSound.play();
            }
        }
    }

    var selectCooldown = 0;

    $scope.getTransform = function(i) {
        var count = 18;//$scope.games.length;

        var z = Math.round((1000 / 2) / Math.tan(Math.PI / count));

        var worldRotateY = -$scope.selectedGame * 360 / count;
        var worldTranslateZ = z;
        $scope.transform = "translateZ(-" + worldTranslateZ + "px) rotateY(" + worldRotateY + "deg)";

        var gameTranslateY = 0;
        /*if (selectCooldown && i == $scope.selectedGame) {
            gameTranslateY = -100;
        }*/

        // Add multiples of the game list length to this index i so that
        // it's the closest to the camera.
        var length = $scope.games.length;
        i += length * Math.floor(($scope.selectedGame-i+length/2) / length);

        var gameRotateY = i * 360 / count;
        var gameZ = z;
        if (selectCooldown == 1) {
            gameZ += 200;
        }
        return "rotateY(" + gameRotateY + "deg)"+
               "translateZ(" + gameZ + "px)"+
               "translateY(" + gameTranslateY + "px)";
    }

    var axisDown = false;
    var buttonDown = false;

    function inputLoop() {
        var gamepads = navigator.getGamepads();
        for (var playerIndex = 0; playerIndex < gamepads.length; playerIndex++) {
            if(!document.hasFocus()) break;
            var gamepad = gamepads[playerIndex];
            if (gamepad) {
                if(gamepad.axes[0] >= 0.9 && !axisDown) {
                    $scope.$broadcast('right');
                    axisDown = true;
                }
                if(gamepad.axes[0] <= -0.9 && !axisDown) {
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
                if(gamepad.buttons[0].pressed == true && !buttonDown) {
                    $scope.$broadcast('select');
                    buttonDown = true;
                }
                else if(gamepad.buttons[1].pressed == true && !buttonDown) {
                    $scope.$broadcast('back');
                    buttonDown = true;
                }
                else if(gamepad.buttons[0].pressed == false && gamepad.buttons[1].pressed == false) {
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

    $scope.$on('right', function (e) { select(1); });
    $scope.$on('left', function (e) { select(-1); });
    $scope.$on('select', function (e) {
        if (selectCooldown == 0) {
            confirmSound.play();
            selectCooldown = 1;
            $scope.$apply();
            window.setTimeout(function() {
                selectCooldown = 0;
                $scope.$apply();
            }, 2000);
            gameDiv.getElementsByClassName("game")[$scope.mod($scope.selectedGame, gameDiv.children.length)].children[0].click();
        }
    });
    $scope.$on('back', function (e) { console.log("back"); });
});

