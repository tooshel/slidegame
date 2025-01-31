#!/usr/bin/env bash

{ # this ensures the entire script is downloaded #

# Configuration variables
GAME_NAME="slidegame"                                                    # Name of the game folder
REPO_URL="https://github.com/tooshel/slidegame/archive/refs/heads/main.zip"  # URL to download the game
INSTALL_PATH="/userdata/roms/jsgames"                                    # Where to install the game
NODE_VERSION="22"                                                        # Node.js version to use
RUN_NPM_INSTALL=false                                                    # Whether to run npm install
NPM_INSTALL_FLAGS="--omit=dev"                                          # Flags for npm install command

# this will exit the script if any error is encountered . . . 
# . . . it usually also exits the ssh connection so not using this for now
# set -e

my_has() {
  type "$1" > /dev/null 2>&1
}

my_distro_check() {
  if grep -q "knulli" /etc/issue; then
    return 0  # True
  elif grep -q "READY" /etc/issue; then
    return 0  # True
  else 
    return 1  # False
  fi
}

my_echo() {
  command printf %s\\n "$*" 2>/dev/null
}

#
# Unsets the various functions defined
# during the execution of the install script
#
my_reset() {
  unset -f my_has my_echo my_distro_check my_grep
}

my_echo "=> STARTING SAMPLE GAME INSTALL SCRIPT"

if [ -z "${BASH_VERSION}" ] || [ -n "${ZSH_VERSION}" ]; then
  my_echo >&2 'Error: the install instructions explicitly say to pipe the install script to `bash`; please follow them'
  exit 1
fi

my_grep() {
  GREP_OPTIONS='' command grep "$@"
}

# check to see if I'm running on a knulli device
if my_distro_check; then
  my_echo "=> This is a compatible device, /etc/issue says so"
else
  my_echo "=> This NOT is a compatible device, EXITING!!"
  exit 1
fi

my_warning() {
    my_echo "=> NOTE! You need to run the 'Update Gamelists' Knulli/Batocera option to get the game to show up."
    my_echo "=> NOTE! This script assumes your roms are stored in /userdata/roms on the root device."
    my_echo "=> NOTE! This script will also delete and replace any game called "SlideGame" in /userdata/roms/jsgames that have matching names."
}

my_warning

cd ~

my_echo "=> Cleaning up old files"
if [ -d "$HOME/mygame.zip" ]; then
  my_echo "=> File ~/mygame.zip exists. Deleting..."
  rm -rf ~/mygame.zip
fi

if [ -d "$HOME/slidegame-main" ]; then
  my_echo "=> File ~/slidegame-main exists. Deleting..."
  rm -rf ~/slidegame-main
fi


my_echo "=> Downloading the game . . . "
source ~/.bash_profile
curl -o mygame.zip -L "$REPO_URL"
unzip mygame.zip



if my_distro_check; then
  my_echo "=> This is a compatible device so I'm copying the game"

  if [ -d "/userdata/roms/jsgames" ]; then
    my_echo "=> Folder /userdata/roms/jsgames exists, no need to create it."
  else 
    my_echo "=> Folder /userdata/roms/jsgames does not exist! That could be a problem."
    mkdir /userdata/roms/jsgames
  fi

  source ~/.bash_profile
  nvm use $NODE_VERSION
  cd ~/slidegame-main
  
  my_echo "=> Deleting existing ${GAME_NAME} game from ${INSTALL_PATH}"
  rm -rf "${INSTALL_PATH}/${GAME_NAME}"

  cd ~
  mkdir -p "${INSTALL_PATH}/${GAME_NAME}"
  mv slidegame-main/* "${INSTALL_PATH}/${GAME_NAME}"
  rm -r ~/slidegame-main

  cd "${INSTALL_PATH}/${GAME_NAME}"
  if [ "$RUN_NPM_INSTALL" = true ]; then
    my_echo "=> Running npm install..."
    npm install $NPM_INSTALL_FLAGS
  fi

  my_echo "=> INSTALL SUCCESSFUL!"
  cd ~
else
  my_echo "=> my_distro_check says this is NOT is a compatible device, so I'm not installing!"
  my_echo "=> INSTALL NOT SUCCESSFUL!"
fi

my_warning
my_reset

} # this ensures the entire script is downloaded #


