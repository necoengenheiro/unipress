yum.define([
    Pi.Url.create('Vendor', '/camera/allower.js')
], function () {

    class Stream extends Pi.Class {

        instances() {
            super.instances();

            this._status = Camera.StreamerStatus.STOPPED;

            this._promise = new Pi.Promise();
        }

        get status(){
            return this._status;
        }

        start(audio = true, video = true) {
            let constraints = {}

            if (Pi.Type.isObject(video) && video.id) Pi.Object.extend(constraints, { video: { deviceId: { exact: video.id } } });
            if (Pi.Type.isObject(video) && video.width) Pi.Object.extend(constraints, { video: { width: { exact: video.width } } });
            if (Pi.Type.isObject(video) && video.height) Pi.Object.extend(constraints, { video: { height: { exact: video.height } } });

            if (Pi.Type.isObject(audio) && audio.id) Pi.Object.extend(constraints, { audio: { deviceId: { exact: audio.id } } });

            if (Pi.Type.isBoolean(video)) Pi.Object.extend(constraints, { video: video });
            if (Pi.Type.isBoolean(audio)) Pi.Object.extend(constraints, { audio: audio });

            Camera.Devices.getStream(constraints)
                .once((stream) => {
                    this._status = Camera.StreamerStatus.PLAYING;
                    this._promise.resolve(stream);
                })
                .error((e) => {
                    console.log(e);
                    this._promise.reject(e);
                });

            return this;
        }

        stop() {
            this._promise.onceReady((stream) => {
                stream.getTracks().forEach(track => track.stop());
            });

            this._promise = new Pi.Promise();

            this._status = Camera.StreamerStatus.STOPPED;

            return this;
        }

        getStream() {
            return this._promise;
        }
    };

    Pi.Export('Camera.Streamer', Stream);
    Pi.Export('Camera.StreamerStatus', {
        PLAYING: 0,
        STOPPED: 1
    });
});