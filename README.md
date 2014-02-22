#Chat Plays#

A way to crowdsource commands to a program (inspired by TwitchPlaysPokemon)
Using MutationObservers in the browser to send to socket.io to run keyboard events through xdotool or win32api.

INFO: Check out https://github.com/eltacodeldiablo/TwitchPlaysX for an version using IRC.

Code is just hacked together so don't expect too much!

![](http://i.imgur.com/AmNuB5E.png)

##General Method##

- Get chat (twitch, etc)
    - Most people are using **IRC** to connect to twitch chat servers.  
- Parse for certain commands
    - can use simple if statements, regex, switch statment, check in array of commands, etc 
- hook up to a program (emulator)
    - if windows
        - use the **win32** api
            - python: `win32api.keybd_event`
            - C#,java
        - 
    - if nix
        - **xdotool** 
- since most ways of sending keyboard commands are sent to the focused window, you might need to run a VM so you can still use your computer.
- Otherwise with xdotool and linux you need to figure out how to stream.

Installation
--------------
- Need a modern browser to use MutationObserver (Chrome, Firefox, IE11, etc)

###If Windows###
1. [Node.js] and npm
2. [socket.io] npm package `npm install socket.io`
3. [python] - http://www.python.org/download/releases/2.7.6/
4. [python win32] package - http://sourceforge.net/projects/pywin32/files/pywin32/

###If Ubuntu###
```sh
# to get nodejs
sudo apt-get update
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
# to get socket.io
npm install socket.io
# to get xdotool
apt-get install xdotool
# or go to http://www.semicomplete.com/projects/xdotool/
```

- then find a program to send input to (an emulator, etc) and find out the Title of it's window
- for notepad.exe it would be "Notepad" or even "Untitled - Notepad"

##Run##

1. Open program/emulator to stream to (visualboy,desmume)
1a. Change the controls on desmume (keys.py for windows, for ubuntu its just the key itself)
1b. uncheck pause if unfocused if necessary

2. Run the socket.io server in nodejs
-------------
```sh
node server.js windows window_title_of_program
or 
node server.js linux window_title_of_program

#if desmume
node server.js windows Desmume

```

3. Copy play.js and paste in browser console on a twitch stream page `twitch.tv/streamname`

4. Type commands!

*on windows, the program will send inputs by focusing on the emulator so you won't be able to use your computer at that time*

##Notes##

Tried using AutoIt, AHK, Powershell as well but couldn't get any version of Send or ControlSend to work properly/consistently.  
Would be great to find something that could send inputs to an unfocused window.

###Other awesome things###

  - https://github.com/Abysice/TwitchIRCBot
  - https://github.com/aidraj/twitch-plays
  - https://github.com/AntCGallagher/TwitchSaysPokemon
  - https://github.com/iCart/TwitchPlaysStreetFighter
  - https://github.com/Lnxfx/IRCGameCommander
  - https://github.com/matias49/twitchbotirc
  - https://github.com/whitebird/TwitchMote
  - https://github.com/vevix/twitch-plays
  - https://github.com/Xesyto/TwitchPlays

[node.js]:http://nodejs.org
[socket.io]:http://socket.io/
[python win32]:http://starship.python.net/~skippy/win32/Downloads.html
[python]:http://www.python.org/
