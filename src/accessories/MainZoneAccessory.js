require('@babel/polyfill')
import callbackify from '../util/callbackify'

let Characteristic, Service

export default function (homebridge: Object) {
    Characteristic = homebridge.hap.Characteristic
    Service = homebridge.hap.Service

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
        this.platform = platform
        this.log = platform.log

        this.name = `${platform.config['name']} Main Zone`
        this.maxVolume = platform.config['maxVolume'] || 100
        this.defaultVolume = platform.config['defaultVolume'] || 40
        this.defaultInput = platform.config['defaultInput'] || 'DVD'

        platform.denon.on('data', data =>
            this.handleResponse(data.toString('utf8').replace(/\r?\n|\r/gm, ''))
        )

        platform.send('PW?')
        platform.send('MU?')
        platform.send('MV?')
    }

    getServices() {
        this.informationService = new Service.AccessoryInformation()
        this.informationService
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'Denon/Marantz')

        this.SwitchService = new Service.Switch(this.name)
        this.SwitchService.getCharacteristic(Characteristic.On).on('set', callbackify(this.setPower)
        )

        return [this.informationService, this.SwitchService]
    }

    handleResponse(res) {
        const regExp = /MUON|MUOFF|PWON|PWSTANDBY|MV\d{1,3}/gm
        res = res.match(regExp)

        if (!Array.isArray(res)) return

        for (let i = 0; i < res.length; i++) {
            this.log.debug(`received response: ${res[i]}`)

            switch (res[i]) {
                case 'PWON':
                case 'ZMON':
                    this.SwitchService.getCharacteristic(Characteristic.On).updateValue(true, null)
                    break
                case 'PWSTANDBY':
                case 'ZMOFF':
                    this.SwitchService.getCharacteristic(Characteristic.On).updateValue(
                        false,
                        null
                    )
                    break
                case 'MUON':
                    break
                case 'MUOFF':
                    break
                case /MV\d{1,3}/g.exec(res[i])[0]:
                    break
            }
        }
    }

    setMute = async state => {
        this.log(`set mute state of main zone to ${state}`)
        await this.platform.send(`MU${state ? 'ON' : 'OFF'}`)
    }

    setPower = async state => {
        this.log(`setting power state of main zone to ${state}`)
        await this.platform.send(`PW${state ? 'ON' : 'STANDBY'}`)
        if (state) {
            await this.setVolume(this.defaultVolume)
            await this.setInput(this.defaultInput)
        }
    }

    setVolume = async value => {
        const vol = Math.ceil(((value / 100) * this.maxVolume) / 5) * 5

        this.log(`set volume of main zone to ${value} (${vol / 10})`)
        await this.platform.send(`MV${vol}`)
    }

    setInput = async value => {
        this.log(`setting input source of main zone to ${value}`)
        await this.platform.send(`SI${value.toUpperCase()}`)
    }

    _normalizeVolume(vol) {
        vol = vol.length > 2 ? parseInt(vol) / 10 : parseInt(vol)
        return (vol / this.maxVolume) * 100
    }
}
