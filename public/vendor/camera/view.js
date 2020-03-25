yum.define([

], function () {

    class Control extends Pi.Component {

        instances() {
            this.view = new Pi.View(`<div></div>`);

            this.muted = true;
            this.autoplay = true;
            this.loop = true;
        }

        viewDidLoad() {
            this._createVideoElement();

            super.viewDidLoad();
        }

        _createVideoElement() {
            if (this._video) {
                this._video.remove();
            }
            
            this._video = document.createElement('video');
            this.view.element.appendChild(this._video);

            if (this.muted) {
                this._video.muted = true;
            }

            if (this.autoplay) {
                this._video.autoplay = true;
            }

            if (this.loop) {
                this._video.loop = true;
            }

            this._video.onloadedmetadata = () => {
                this._video.play();
            }
        }

        setStreamer(streamer) {
            streamer.getStream().once((stream) => {
                this._createVideoElement();

                if ('srcObject' in this._video) {
                    this._video.srcObject = stream;
                } else {
                    this._video.src = URL.createObjectURL(mediaStream);
                }

                // this._video.pause();
                // var promise = this._video.play();

                // if (promise != undefined) {
                //     promise.then(() => {

                //     }).catch((e) => {
                //         console.log(e);
                //         this.event.trigger('critial', e);
                //     });
                // }
            });
        }

    };

    Pi.Export('Camera.View', Control);
});