# Homebridge-Denon-Marantz-AVR

homebridge-plugin for Denon and Marantz AVR control with Apple-Homekit. Works with most Denon AVR since 2011, supports a second zone and implements the speaker service.

# Installation
Follow the instruction in [NPM](https://www.npmjs.com/package/homebridge) for the homebridge server installation. The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-denon) and should be installed "globally" by typing:

    sudo npm install -g homebridge-denon

# Configuration

config.json

Example:
```
{
    "bridge": {
        "name": "Homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "123-45-678"
    },

    "description": "just an example config",

    "platforms": [
        {
          "platform": "DenonMarantzAVR",
          "name": "Denon LivingRoom",
          "host": "192.168.178.85",
          "maxVolume": 70
        }
    ]
}
```

### notes
If you are interested in setting the volume of your receiver with Siri than [this](https://github.com/robertvorthman/homebridge-marantz-volume) plugin might be a good addition. Only remember to not tell Siri "Set the light in the Living room to 100 %" ;)
homebridge-marantz-volume was written by Robert Vorthman (thanks!)