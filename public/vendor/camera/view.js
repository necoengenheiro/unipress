yum.define([

], function () {

    class Control extends Pi.Component {

        instances() {
            this.view = new Pi.View(`<div></div>`);

            this.muted = true;
            this.autoplay = true;
            this.loop = true;
        }

        viewDidLoad(){
            this._createVideoElement();

            super.viewDidLoad();
        }

        _createVideoElement() {
            if (this._video) {
                this._video.remove();
            }

            this._video = document.createElement('video');
            if (this.muted) {
                this._video.setAttribute('muted', '1');
            }

            if (this.autoplay) {
                this._video.setAttribute('autoplay', '');
            }
            
            if (this.loop) {
                this._video.setAttribute('loop', '');
            }

            this.view.element.appendChild(this._video);
        }

        setStreamer(streamer) {
            streamer.getStream().once((stream) => {
                this._createVideoElement();

                this._video.srcObject = stream;
                this._video.pause();
                var promise = this._video.play();

                if (promise != undefined) {
                    promise.then(() => {

                    }).catch((e) => {
                        console.log(e);
                        this.event.trigger('critial', e);
                    });
                }
            });
        }

    };

    Pi.Export('Camera.View', Control);
});