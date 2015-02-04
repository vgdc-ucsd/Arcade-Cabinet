# Arcade-Cabinet
The launcher software for the VGDC arcade cabinet project

It looks like the easiest way to launch native applications from a web browser is to just use a custom URI scheme. The solution that is used here just has a small bootstrap program that just runs whatever it is given as an argument (ex "game:mygame.exe --fullscreen" would execute "mygame.exe --fullscreen").

##Setup
###For Firefox, but should be similar if you want to test with another browser
1. Build the solution in the Launcher directory
2. Load the page and open one of the links
3. When prompted, associate the game: URI sceme to the Launcher.exe that was created and select to remember the choice