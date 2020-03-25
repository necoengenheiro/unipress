yum.define([

], function () {

    class Devices extends Pi.Class {

        instances() {
            super.instances();

            this.event = new Pi.Event();
            this._devices = [];
        }

        static load() {
            var promise = new Pi.Promise();

            navigator.mediaDevices.enumerateDevices().then((devices) => {
                this._devices = devices;

                promise.resolve(new Devices({ _devices: devices }));
            }).catch((e) => {
                this.event.trigger('critical', e);
            });

            return promise;
        }

        static getStream(constraints) {
            const promise = new Pi.Promise();

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    promise.resolve(stream);
                })
                .catch((e) => {
                    console.log(e);
                    promise.reject(e);
                });
            
            return promise;
        }

        static getDefault() {
            const promise = new Pi.Promise();

            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                const audios = stream.getAudioTracks();
                const videos = stream.getVideoTracks();

                if (audios.length == 0 || videos.length == 0) {
                    promise.resolve();

                    return;
                }

                promise.resolve(audios[0], videos[0]);
            });

            return promise;
        }

        getAudios() {
            return this._getDevicesByType('audioinput');
        }

        getVideos() {
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