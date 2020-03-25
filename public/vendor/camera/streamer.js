yum.define([

], function () {

    class Stream extends Pi.Class {

        instances() {
            super.instances();

            this.status = Camera.StreamerStatus.STOPPED;

            this._promise = new Pi.Promise({
                isOnce: true
            });
        }

        start(audio = true, video = true) {
            let constraints = {}

            if (Pi.Type.isObject(video) && video.id) Pi.Object.extend(constraints, { video: { deviceId: { exact: video.id } } });
            if (Pi.Type.isObject(video) && video.width) Pi.Object.extend(constraints, { video: { width: { exact: video.width } } });
            if (Pi.Type.isObject(video) && video.height) Pi.Object.extend(constraints, { video: { height: { exact: video.height } } });

            if (Pi.Type.isObject(audio) && audio.id) Pi.Object.extend(constraints, { audio: { deviceId: { exact: audio.id } } });

            if (Pi.Type.isBoolean(video)) Pi.Object.extend(constraints, { video: video });
            if (Pi.Type.isBoolean(audio)) Pi.Object.extend(constraints, { audio: audio });

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    this.status = Camera.StreamerStatus.PLAYING;
                    this._promise.resolve(stream);
                })
                .catch((e) => {
                    console.log(e);
                    this.event.trigger('critical', e);
                });

            return this;
        }

        stop() {
            this._promise.onceReady((stream) => {
                stream.getTracks().forEach(track => track.stop());
            })

            this.status = Camera.StreamerStatus.STOPPED;

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