angular.module('arcadeCabinet', [])
.controller('arcadeCtrl', function($scope, $http) {
    $scope.selectedGame = 0;
    $scope.games = [];

    var gameNames = ["Distilled", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing", "Distilled", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing", "Closing"];
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

    function select(index) {
        $scope.selectedGame = index;
        $scope.$apply();
    }

    $scope.getTransform = function(i) {
        var count = $scope.games.length;
        var z = Math.round((1000 / 2) / Math.tan(Math.PI / count));
        $scope.transform = "translateZ(-" + z + "px) rotateY(" + -$scope.selectedGame * 360 / count + "deg)";
        return "rotateY(" + i * 360 / count + "deg) translateZ(" + z + "px)";
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

    $scope.$on('right', function (e) { select($scope.selectedGame + 1); });
    $scope.$on('left', function (e) { select($scope.selectedGame - 1); });
    $scope.$on('up', function (e) { select($scope.selectedGame - 1); });
    $scope.$on('down', function (e) { select($scope.selectedGame + 1); });
    $scope.$on('select', function (e) { gameDiv.getElementsByClassName("game")[$scope.mod($scope.selectedGame, gameDiv.children.length)].children[0].click() });
    $scope.$on('back', function (e) { console.log("back"); });
});

