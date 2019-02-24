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

        this.name = `${platform.config['name']} Main Zone`;
        this.maxVolume = platform.config['maxVolume'] || 70;

        platform.denon.on('data', data => this.handleResponse(
            data.toString('utf8').replace(/\r?\n|\r/gm, ''))
        )

        platform.send('PW?')
        platform.send('MU?')
        platform.send('MV?')
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
        const regExp = /MUON|MUOFF|PWON|PWSTANDBY|MV\d{1,3}/gm
        res = res.match(regExp)

        if (!Array.isArray(res)) return

        for (let i=0; i<res.length; i++) {
            this.log.debug(`received response: ${res[i]}`)

            switch (res[i]) {
                case 'PWON':
                    this.SwitchService.getCharacteristic(Characteristic.On)
                        .updateValue(true, null)
                    break
                case 'PWSTANDBY':
                    this.SwitchService.getCharacteristic(Characteristic.On)
                        .updateValue(false, null)
                    break
                case 'MUON':
                    this.SpeakerService.getCharacteristic(Characteristic.Mute)
                        .updateValue(true, null)
                    break
                case 'MUOFF':
                    this.SpeakerService.getCharacteristic(Characteristic.Mute)
                        .updateValue(false, null)
                    break
                case /MV\d{1,3}/g.exec(res[i])[0]:
                    this.SpeakerService.getCharacteristic(Characteristic.Volume)
                        .updateValue(this._normalizeVolume(/\d{1,3}/g.exec(res[i])[0]), null)
            }
        }
    }

    setMute = async (state) => {
        this.log(`set mute state of main zone to ${state}`)
        this.platform.send(`MU${state ? 'ON' : 'OFF'}`)
    }

    setPower = async (state) => {
        this.log(`setting power state of main zone to ${state}`);
        this.platform.send(`PW${state ? 'ON' : 'STANDBY'}`);
    }

    setVolume = async (value) => {
        const vol = Math.ceil((value / 100 * this.maxVolume)/5)*5

        this.log(`set volume of main zone to ${value} (${vol/10})`)
        this.platform.send(`MV${vol}`)
    }

    setInput = async value => {
        this.log(`setting input source of main zone to ${value}`)
        this.platform.send(`SI${value.toUpperCase()}`)
    }

    _normalizeVolume(vol) {
        vol = vol.length > 2 ? parseInt(vol) / 10 : parseInt(vol)
        return (vol/this.maxVolume) * 100
    }
}