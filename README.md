# Arcade-Cabinet

The launcher software for the VGDC arcade cabinet project.

It looks like the easiest way to launch native applications from a web browser is to just use a custom URI scheme. The solution that is used here just has a small bootstrap program that just runs whatever it is given as an argument (ex "vgdcgame:mygame.exe --fullscreen" would execute "mygame.exe --fullscreen").

## Setup

1. Build the solution in the Launcher directory.
2. Edit vgdcgame.reg so the path points to the created `Launcher/Debug/Launcher.exe`. Be sure to preserve the format with the slashes and quotes.
3. Run vgdcgame.reg.
Below setup is for Firefox, but should be similar if you want to test with another browser.
4. Open Firefox. In about:config change security.fileuri.strict_origin_policy to false if you are not serving the files through a web server so that ajax works
5. Load the page and open one of the links
6. When prompted to launch an application, DON'T select the Launcher.exe in the list; instead hit "Choose" and pick the Launcher.exe in the folder. Make sure "Remember my choice" is checked and click "Open link".
7. You should be good to go! F11 puts Firefox in fullscreen.

## Adding games

Each game has its own directory in the Games directory:
```
index.html
Games/
    Game1/
        Game.json       <- format shown below
        thumbnail.png   <- 16:9 aspect ratio
    Game2/
        ...
```
Game.json format: (note the use of `\\\\` in paths)
```
{
"Name":"Colors",
"Authors":"Patrick",
"Description":"Become a artist.",
"Command":"Colors.exe"
}
```

## External links

[Register protocol - MozillaZine Knowledge Base](http://kb.mozillazine.org/Register_protocol)

[Caleb Faith's GUI Button SFX Pack](https://www.assetstore.unity3d.com/en/#!/content/22259)
