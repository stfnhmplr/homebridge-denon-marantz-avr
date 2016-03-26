var Service, Characteristic;
var Denon = require('./lib/denon');
var inherits = require('util').inherits;


module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    fixInheritance(DenonAVRAccessory.Volume, Characteristic);
    fixInheritance(DenonAVRAccessory.Mute, Characteristic);
    fixInheritance(DenonAVRAccessory.AudioService, Service);

    homebridge.registerAccessory('homebridge-denon-marantz-avr', 'DenonMarantzAVR', DenonAVRAccessory);

};


function fixInheritance(subclass, superclass) {
    var proto = subclass.prototype;
    inherits(subclass, superclass);
    subclass.prototype.parent = superclass.prototype;
    for (var mn in proto) {
        subclass.prototype[mn] = proto[mn];
    }
}


function DenonAVRAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.ip = config['ip'];
    this.type = config['type'];
    this.name = config['name'];

    this.defaultInput = config['defaultInput'] || null;
    this.defaultVolume = config['defaultVolume'] || null;
    this.minVolume = config['minVolume'] || 0;
    this.maxVolume = config['maxVolume'] || 70;

    this.denon = new Denon(this.ip, this.type);
}

//custom characteristics
DenonAVRAccessory.Volume = function () {
    Characteristic.call(this, 'Volume', '00001001-0000-1000-8000-135D67EC4377');
    this.setProps({
        format: Characteristic.Formats.UINT8,
        unit: Characteristic.Units.PERCENTAGE,
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
};


DenonAVRAccessory.Mute = function () {
    Characteristic.call(this, 'Mute', '6b5e0bed-fdbe-40b6-84e1-12ca1562babd');
    this.setProps({
        format: Characteristic.Formats.UINT8,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
}


DenonAVRAccessory.AudioService = function (displayName, subtype) {
    Service.call(this, displayName, '48a7057e-cb08-407f-bf03-6317700b3085', subtype);
    this.addCharacteristic(DenonAVRAccessory.Volume);
    this.addOptionalCharacteristic(DenonAVRAccessory.Mute);
};


DenonAVRAccessory.prototype.getPowerState = function (callback) {
    this.denon.getPowerState(function (err, state) {
        if (err) {
            this.log(err);
            callback(err);
        } else
            this.log('current power state is: %s', (state) ? 'ON' : 'OFF');
        callback(null, state);
    }.bind(this));
};


DenonAVRAccessory.prototype.setPowerState = function (powerState, callback) {
    if (powerState && this.defaultInput) {
        this.denon.setInput(this.defaultInput, function (err) {
            if (err) {
                this.log('Error setting default input');
                callback(err);
            }
        }.bind(this));
    } else {
        this.denon.setPowerState(powerState, function (err, state) {
            if (err) {
                this.log(err);
                callback(err);
            } else {
                this.log('denon avr powered %s', state);
            }
        }.bind(this));
    }

    if (powerState && this.defaultVolume) {
        setTimeout(function () {
            this.denon.setVolume(this.defaultVolume, function (err) {
                if (err) {
                    this.log('Error setting default volume');
                    callback(err);
                }
            }.bind(this));
        }.bind(this), 4000);
    }

    callback(null);
};


DenonAVRAccessory.prototype.getVolume = function (callback) {
    this.denon.getVolume(function (err, volume) {
        if (err) {
            this.log('get Volume error: ' + err)
            callback(err);
        } else {
            this.log('current volume is: ' + volume);
            var pVol = Math.round(volume / this.maxVolume * 100);
            callback(null, pVol);
        }
    }.bind(this))
};


DenonAVRAccessory.prototype.setVolume = function (pVol, callback) {
    var volume = Math.round(pVol / 100 * this.maxVolume);
    this.denon.setVolume(volume, function (err) {
        if (err) {
            this.log('set Volume error: ' + err);
            callback(err);
        } else {
            this.log('set Volume to: ' + volume);
            callback(null);
        }
    }.bind(this))
};


DenonAVRAccessory.prototype.setMuteState = function (state, callback) {
    this.denon.setMuteState(state, function (err) {
        if (err) {
            this.log('set mute error: ' + err);
            callback(err);
        } else {
            callback(null);
        }
    }.bind(this));
};


DenonAVRAccessory.prototype.getMuteState = function (callback) {
    this.denon.getMuteState(function (err, state) {
        if (err) {
            this.log('get mute error: ' + err);
            callback(err);
        } else {
            callback(state);
        }
    }.bind(this))
};


DenonAVRAccessory.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, this.type);

    var switchService = new Service.Switch(this.name);
    switchService.getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    var audioService = new DenonAVRAccessory.AudioService('Audio Service');
    audioService.getCharacteristic(DenonAVRAccessory.Volume)
        .on('get', this.getVolume.bind(this))
        .on('set', this.setVolume.bind(this));

    return [informationService, switchService, audioService];
};
