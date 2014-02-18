# https://github.com/aidraj/twitch-plays/blob/master/lib/game.py

import win32api
import win32con
import win32ui
import time
import sys

keymap = {
    'up': 0x30, #0
    'left': 0x31, #1
    'down': 0x32, #2
    'right': 0x33, #3
    'b': 0x34, #4
    'a': 0x35, #5
    'y': 0x36, #6
    'x': 0x37, #7
    'start': 0x38, #8
    'select': 0x39 #9
}

def button_to_key(button):
    return keymap[button]

def push_button(button):
    win32api.keybd_event(button_to_key(button), 0, 0, 0)
    time.sleep(0.1)
    win32api.keybd_event(button_to_key(button), 0, win32con.KEYEVENTF_KEYUP, 0)

if __name__ == "__main__":
   PyCWnd1 = win32ui.FindWindow( None, "DeSmuME 0.9.10 x64" )
   PyCWnd1.SetForegroundWindow()
   PyCWnd1.SetFocus()
   push_button(sys.argv[1])