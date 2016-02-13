var Service, Characteristic;
var Denon = require('./lib/denon');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-denon', 'DenonAVR', DenonAVRAccessory);
};

function DenonAVRAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.ip = config['ip'];
    this.defaultInput = config['defaultInput'] || false;
    this.defaultVolume = config['defaultVolume'] || false;

    this.denon = new Denon(this.ip);
    this.denon.getName(function (err, res) {
        if (!err)
            this.name = res;
    }.bind(this));

    this.service = new Service.Switch('Power');
}

DenonAVRAccessory.prototype.getPowerState = function (callback) {
    this.denon.getPowerState(function (err, res) {
        if (err) {
            this.log(err);
            callback(err);
        } else
            this.log('current power state is: %s', res);
        callback(null, res);
    }.bind(this));
};

DenonAVRAccessory.prototype.setPowerState = function (powerState, callback) {
    this.denon.setPowerState(powerState, function (err, state) {
        if (err) {
            this.log(err);
            callback(err);
        } else {
            this.log('denon avr powered %s', state);
            callback(null);
        }
    }.bind(this));

    if (powerState && this.defaultInput) {
        this.denon.setInput(this.defaultInput, function (err) {
            if (err)
                this.log('Error setting default input');
        }.bind(this));
    }

    if (powerState && this.defaultVolume) {
        this.denon.setVolume(this.defaultInput, function (err) {
            if (err)
                this.log('Error setting default volume');
        }.bind(this));
    }
};

DenonAVRAccessory.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, 'Denon')
        .setCharacteristic(Characteristic.Model, this.name)
        .setCharacteristic(Characteristic.SerialNumber, 'unknown');

    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    return [informationService, this.service];
};
