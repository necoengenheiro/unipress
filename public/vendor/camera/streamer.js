yum.define([

], function () {

    class Stream extends Pi.Class {

        instances() {
            super.instances();

            this._promise = new Pi.Promise({
                isOnce: true
            });
        }

        create(audio = true, video = true) {
            let constraints = {}

            if (Pi.Type.isObject(video) && video.id) Pi.Object.extend(constraints, { video: { deviceId: { exact: video.id } } });
            if (Pi.Type.isObject(video) && video.width) Pi.Object.extend(constraints, { video: { width: { exact: video.width } } });
            if (Pi.Type.isObject(video) && video.height) Pi.Object.extend(constraints, { video: { height: { exact: video.height } } });

            if (Pi.Type.isObject(audio) && audio.id) Pi.Object.extend(constraints, { audio: { deviceId: { exact: audio.id } } });

            if (Pi.Type.isBoolean(video)) Pi.Object.extend(constraints, { video: video });
            if (Pi.Type.isBoolean(audio)) Pi.Object.extend(constraints, { audio: audio });

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    this._promise.resolve(stream);
                })
                .catch((e) => {
                    this.event.trigger('critical', e);
                });

            return this._promise;
        }

        get() {
            return this._promise;
        }
    };

    Pi.Export('Camera.Streamer', Stream);

});