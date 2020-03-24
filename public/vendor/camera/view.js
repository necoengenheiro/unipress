yum.define([

], function () {

    class Control extends Pi.Component {

        instances() {
            this.view = new Pi.View(`<div></div>`);

            this.muted = true;
            this.autoplay = false;
        }

        _createVideoElement() {
            if (this._video) {
                this._video.remove();
            }

            this._video = document.createElement('video');
            if (this.muted) {
                this._video.setAttribute('muted', 'muted');
            }

            if (this.autoplay) {
                this._video.setAttribute('autoplay', true);
            }

            this.view.element.appendChild(this._video);
        }

        setStreamer(streamer) {
            streamer.get().once((stream) => {
                this._createVideoElement();

                this._video.srcObject = stream;
                var promise = this._video.play();

                if (promise != undefined) {
                    promise.then(() => {

                    }).catch((e) => {
                        this.event.trigger('critial', e);
                    });
                }
            });
        }

    };

    Pi.Export('Camera.View', Control);
});