yum.define([

], function () {

    class Devices extends Pi.Class {

        instances() {
            super.instances();

            this.event = new Pi.Event();
            this._devices = [];
        }

        load() {
            var promise = new Pi.Promise();

            navigator.mediaDevices.enumerateDevices().then((devices) => {
                this._devices = devices;

                promise.resolve(devices);
            }).catch((e) => {
                this.event.trigger('critical', e);
            });

            return promise;
        }

        getAudioDevices() {
            return this._getDevicesByType('audioinput');
        }

        getVideoDevices() {
            return this._getDevicesByType('videoinput');
        }

        _getDevicesByType(type) {
            var arr = [];

            for (let i = 0; i < this._devices.length; i++) {
                const device = this._devices[i];

                if (device.kind === type) {
                    arr.push(device);
                }
            }

            return arr;
        }
    };

    Pi.Export('Camera.Devices', Devices);

});