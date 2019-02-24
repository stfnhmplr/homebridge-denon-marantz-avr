require('@babel/polyfill');
import callbackify from '../util/callbackify'

let Characteristic, Service;

export default function (homebridge: Object) {
    Characteristic = homebridge.hap.Characteristic;
    Service = homebridge.hap.Service;

    return MainZoneAccessory
}

class MainZoneAccessory {
    log: Function
    name: string
    maxVolume: ?number
    platform: Object

    informationService: Object
    SwitchService: Object
    SpeakerService: Object

    constructor(platform) {
        this.platform = platform;
        this.log = platform.log;

        this.name = `${platform.config['name']} 2nd Zone`;
        this.maxVolume = platform.config['maxVolume'] || 70;

        platform.denon.on('data', data => this.handleResponse(
            data.toString('utf8').replace(/\r?\n|\r/gm, ''))
        )

        platform.send('Z2?')
        platform.send('Z2MU?')
        platform.send('Z2?')
    }

    getServices() {
        this.informationService = new Service.AccessoryInformation();
        this.informationService // TODO update placeholder values
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'Denon/Marantz')
            .setCharacteristic(Characteristic.Model, 'unknown')
            .setCharacteristic(Characteristic.FirmwareRevision, 'unknown')
            .setCharacteristic(Characteristic.SerialNumber, 'unknown')

        this.SwitchService = new Service.Switch(this.name);
        this.SwitchService.getCharacteristic(Characteristic.On)
            .on('set', callbackify(this.setPower))

        this.SpeakerService = new Service.Speaker(this.name);
        this.SpeakerService.getCharacteristic(Characteristic.Mute)
            .on('set', callbackify(this.setMute))
        this.SpeakerService.getCharacteristic(Characteristic.Volume)
            .on('set', callbackify(this.setVolume))

        return [this.informationService, this.SwitchService, this.SpeakerService]
    }

    handleResponse(res) {
        const regExp = /Z2MUON|Z2MUOFF|Z2ON|Z2OFF|Z2\d{1,3}/gm
        res = res.match(regExp)

        if (!Array.isArray(res)) return

        for (let i=0; i<res.length; i++) {
            this.log.debug(`received response: ${res[i]}`)

            switch (res[i]) {
                case 'Z2ON':
                    this.SwitchService.getCharacteristic(Characteristic.On)
                        .updateValue(true, null)
                    break
                case 'Z2OFF':
                    this.SwitchService.getCharacteristic(Characteristic.On)
                        .updateValue(false, null)
                    break
                case 'Z2MUON':
                    this.SpeakerService.getCharacteristic(Characteristic.Mute)
                        .updateValue(true, null)
                    break
                case 'Z2MUOFF':
                    this.SpeakerService.getCharacteristic(Characteristic.Mute)
                        .updateValue(false, null)
                    break
                case /Z2\d{1,3}/g.exec(res[i])[0]:
                    this.SpeakerService.getCharacteristic(Characteristic.Volume)
                        .updateValue(this._normalizeVolume(/\d{1,3}/g.exec(res[i])[0]), null)
            }
        }
    }

    setMute = async (state) => {
        this.log(`set mute state of main zone to ${state}`)
        this.platform.send(`Z2MU${state ? 'ON' : 'OFF'}`)
    }

    setPower = async (state) => {
        this.log(`setting power state of second zone to ${state}`);
        this.platform.send(`Z2${state ? 'ON' : 'OFF'}`);
    }

    setVolume = async (value) => {
        const vol = Math.ceil((value / 100 * this.maxVolume)/5)*5

        this.log(`set volume of second zone to ${value} (${vol/10})`)
        this.platform.send(`Z2${vol}`)
    }

    setInput = async value => {
        this.log(`setting input source of second zone to ${value}`)
        this.platform.send(`Z2${value.toUpperCase()}`)
    }

    _normalizeVolume(vol) {
        vol = vol.length > 2 ? parseInt(vol) / 10 : parseInt(vol)
        return (vol/this.maxVolume) * 100
    }
}