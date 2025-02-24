import pygame
import psutil
import pygetwindow as gw
import win32gui
import win32process



# When this button is pressed on both joysticks, close the currently active window,
# if it is not focused on the arcade interface
JOY_QUIT_BUTTON = 9


def close_window():
    pid = get_focused_window_pid()
    print(f"PID of focused window: {pid}")

    # Get process details (optional)
    if pid:
        try:
            process = psutil.Process(pid)
            print(f"Process Name: {process.name()}")
            if (process.name() not in ("explorer.exe", "firefox.exe", "chrome.exe")):
                print(f"Killing process {process.name()}")
                process.kill()
        except psutil.NoSuchProcess:
            print("Process no longer exists.")


def get_focused_window_pid():
    hwnd = win32gui.GetForegroundWindow()  # Get the active window handle
    _, pid = win32process.GetWindowThreadProcessId(hwnd)  # Get the process ID
    return pid


# Initialize pygame and the joystick module
pygame.init()
pygame.joystick.init()

# Detect connected joysticks
joystick_count = pygame.joystick.get_count()
if joystick_count != 2:
    print("Plug in both joysticks to use")
    input()
else:
    print(f"Detected {joystick_count} joystick(s).")

    # Initialize the first joystick
    joystick1 = pygame.joystick.Joystick(0)
    joystick1.init()
    
    print(f"Joystick 1 Name: {joystick1.get_name()}")

    joystick2 = pygame.joystick.Joystick(1)
    joystick2.init()

    print(f"Joystick 2 Name: {joystick2.get_name()}")

# Event loop to read inputs
running = True
quit_buttons = [False, False]

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.JOYBUTTONDOWN:
            if event.button == 9:
                quit_buttons[event.joy] = True
                if quit_buttons[0] and quit_buttons[1]:
                    close_window()
            print(f"Button {event.button} pressed on Joystick {event.joy}")
        elif event.type == pygame.JOYBUTTONUP:
            quit_buttons[event.joy] = False
            print(f"Button {event.button} released")

# Cleanup
pygame.quit()
