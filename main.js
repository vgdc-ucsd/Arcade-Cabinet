var axisDown = false;
var buttonDown = false;
function inputLoop() {
    var gamepads = navigator.getGamepads();
    for (var playerIndex = 0; playerIndex < gamepads.length; playerIndex++) {
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


document.addEventListener('left', function (e) { console.log("left"); }, false);
document.addEventListener('right', function (e) { console.log("right"); }, false);
document.addEventListener('up', function (e) { console.log("up"); }, false);
document.addEventListener('down', function (e) { console.log("down"); }, false);
document.addEventListener('select', function (e) { console.log("select"); }, false);
document.addEventListener('back', function (e) { console.log("back"); }, false);

function loadGame(name) {
    var game;
    var http_request = new XMLHttpRequest();
    http_request.open("GET", "Games/"+name+"/Game.json", true);
    http_request.onreadystatechange = function () {
        if (http_request.readyState === 4) {
            game = JSON.parse(http_request.responseText);
            var gameHtml = "<div class='game'>" +
                "<a href='game:Games\\" + name + "\\" + game.Command + "'>" +
                "<h2 class='title'>" + game.Name + "</h2>" +
                "<img src='Games/" + name + "/" + game.Image + "' />" +
                "<p class='description'>" + game.Description + "</p></a></div>";
            document.getElementById("games").innerHTML += gameHtml;
        }
    };
    http_request.send(null);
}

var games = ["Distilled", "Closing"];
games.forEach(loadGame);