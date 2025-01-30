# slidegame

experiment to see if I can make a game that is meant for a talk

You can run this on a web browser `npm run dev` or from jsgamelauncher or copy it to a device! (see below)

## Installing on [Knulli](https://knulli.org/) or [Batocera](https://batocera.org/)

These are meant to be used with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). Install that first using the curl command and then use a similar curl command to install this game.

NOTE! You need to run the 'Update Gamelists' Knulli/Batocera option to get the game to show up.<br>
NOTE! This script assumes your roms are stored in /userdata/roms on the root device.<br>
NOTE! This script will also delete and replace any game called "SlideGame" in /userdata/roms/jsgames that have matching names.<br>

- Make sure wifi is turned on for your Knulli device or you are otherwise connected to the internet on a Batocera device
- `ssh root@<myDevice>` (default password: linux, default device name : KNULLI or BATOCERA, use IP from device or <myDevice>.local if name fails)
- `curl -o- https://raw.githubusercontent.com/tooshel/slidegame/main/installers/install-batocera-knulli.sh | bash`
