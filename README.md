# Homebridge-Denon-Marantz-AVR
homebridge-plugin for Denon and Marantz AVR control with Apple-Homekit. Works with most Denon AVR since 2011.

#Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-denon) and should be installed "globally" by typing:

    sudo npm install -g homebridge-denon

#Configuration

config.json

Example:
    
    {
      "bridge": {
          "name": "Homebridge",
          "username": "CC:22:3D:E3:CE:51",
          "port": 51826,
          "pin": "031-45-154"
      },
      "description": "This is an example configuration file for homebridge denon plugin",
      "hint": "Always paste into jsonlint.com validation page before starting your homebridge, saves a lot of frustration",
      "accessories": [
          {
              "accessory": "DenonMarantzAVR",
              "name": "Denon LivingRoom",
              "ip": "192.168.1.99",
              "type" : "Denon"
              "defaultInput": "IRADIO",
              "defaultVolume": 35,
              "minVolume": 10,
              "maxVolume": 75
          }
      ]
  }
  
##possible default inputs
Setting the default input and the default volume is optional. The available inputs depend on your avr model.

- 'CD'
- 'SPOTIFY'
- 'CBL/SAT'
- 'DVD'
- 'BD' (Bluray)
- 'GAME'
- 'AUX1'
- 'MPLAY' (Media Player)
- 'USB/IPOD'
- 'TUNER'
- 'NETWORK'
- 'TV'
- 'IRADIO' (Internet Radio)


###todo
- ~~add getInput function~~
- ~~add volume characteristics~~
 
###notes
If you are interested in setting the volume of your reciever with Siri than [this](https://github.com/robertvorthman/homebridge-marantz-volume) plugin might be a good addition. Only remember to not tell Siri "Set the light in the Living room to 100 %" ;)
homebridge-marantz-volume was written by Robert Vorthman (thanks!)
