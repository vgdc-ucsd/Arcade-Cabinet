#SingleInstance Force
#Persistent

Sleep, 3000

Send {Enter}

1Joy10::
2Joy10::
if GetKeyState("1Joy10")
{
if GetKeyState("2Joy10")
{
    Send !{f4}
    ExitApp
}
}
return
