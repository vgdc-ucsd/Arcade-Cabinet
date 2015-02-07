var axisDown = false;
var buttonDown = false;
function inputLoop() {
    var gamepads = navigator.getGamepads();
    for (var playerIndex = 0; playerIndex < gamepads.length; playerIndex++) {
        if(!document.hasFocus()) break;
        var gamepad = gamepads[playerIndex];
        if (gamepad) {
            if(gamepad.axes[0] >= 0.9 && !axisDown) {
                document.dispatchEvent(new Event('right'));
                axisDown = true;
            }
            if(gamepad.axes[0] <= -0.9 && !axisDown) {
                document.dispatchEvent(new Event('left'));
                axisDown = true;
            }
            else if(gamepad.axes[1] >= 0.9 && !axisDown) {
                document.dispatchEvent(new Event('down'));
                axisDown = true;
            }
            else if(gamepad.axes[1] <= -0.9 && !axisDown) {
                document.dispatchEvent(new Event('up'));
                axisDown = true;
            }
            else if(Math.abs(gamepad.axes[0]) < 0.9 && Math.abs(gamepad.axes[1]) < 0.9) {
                axisDown = false;
            }
            if(gamepad.buttons[0].pressed == true && !buttonDown) {
                document.dispatchEvent(new Event('select'));
                buttonDown = true;
            }
            else if(gamepad.buttons[1].pressed == true && !buttonDown) {
                document.dispatchEvent(new Event('back'));
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

var gameDiv;

var first = true;
function loadGame(name) {
    var game;
    var http_request = new XMLHttpRequest();
    http_request.open("GET", "Games/"+name+"/Game.json", true);
    http_request.onreadystatechange = function () {
        if (http_request.readyState === 4) {
            game = JSON.parse(http_request.responseText);
            var gameHtml = "<div class='game " + (first ? "selected" : "") + "'>" +
                "<a href='game:Games\\" + name + "\\" + game.Command + "'>" +
                "<h2 class='title'>" + game.Name + "</h2>" +
                "<img src='Games/" + name + "/" + game.Image + "' />" +
                "<p class='description'>" + game.Description + "</p></a></div>";
            gameDiv.innerHTML += gameHtml;
            first = false;
        }
    };
    http_request.send(null);
}

var games = ["Distilled", "Closing"];

var selectedGame = 0;
function select(index) {
    gameDiv.getElementsByClassName("game")[selectedGame].classList.remove("selected");
    if(index < 0)
        index = games.length - 1;
    else if(index >= games.length)
        index = 0;
    selectedGame = index;
    gameDiv.getElementsByClassName("game")[selectedGame].classList.add("selected");
}

document.addEventListener('left', function (e) { select(selectedGame - 1); }, false);
document.addEventListener('right', function (e) { select(selectedGame + 1); }, false);
document.addEventListener('up', function (e) { select(selectedGame - 1); }, false);
document.addEventListener('down', function (e) { select(selectedGame + 1); }, false);
document.addEventListener('select', function (e) { gameDiv.getElementsByClassName("game")[selectedGame].children[0].click() }, false);
document.addEventListener('back', function (e) { console.log("back"); }, false);


document.addEventListener("DOMContentLoaded", function (e) {
    gameDiv = document.getElementById("games");
    games.forEach(loadGame);
});