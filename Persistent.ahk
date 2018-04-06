#SingleInstance Force
#Persistent

1Joy10::
if GetKeyState("2Joy10")
{
    Send, {Esc down}
    Sleep, 100 ; We wait because Flash player projector doesn't close correctly if Esc is just quickly tapped...
    Send, {Esc up}
}
return