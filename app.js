yum.define([
    Pi.Url.create('Vendor', '/camera/allower.js'),
    Pi.Url.create('Vendor', '/camera/streamer.js'),
    Pi.Url.create('Vendor', '/camera/view.js'),

    Pi.Url.create('Vendor', '/asterisk/hub.js'),
], function () {

    class App extends Pi.App {

        instances() {
            super.instances();

            this.hub = Asterisk.Hub;

            this.isAdmin = Pi.Url.Hash.get() == 'admin';
        }

        viewDidLoad() {
            this.streamer = new Camera.Streamer();

            this.camera = new Camera.View({
                className: 'app-center-video'
            });

            this.camera.render(this.view.body);

            this.hub.setStreamer(this.streamer);
            this.hub.event.listen('new::streamming', (streamer) => {
                this.camera.setStreamer(streamer);
            });

            if (this.isAdmin) {
                this.hub.isRoot = true;
                this.hub.isMaster = true;

                this.streamer.start();

                this.camera.setStreamer(this.streamer);
            }

            this.hub.connect(Pi.App.getConfig('asterisk.signal.url'));
            this.hub.event.listen('claimToBe::newMaster', (slaverId) => {
                this.hub.revokeMaster().once(() => {
                    this.hub.electedNewMaster(slaverId);
                });
            });

            super.viewDidLoad();
        }

        events(listen) {
            super.events(listen);

            listen({
                '#btnleft click'() {
                    this.view.front.removeClass().addClass('cube-face cube-front cube-front-to-right');
                    this.view.left.removeClass().addClass('cube-face cube-left cube-left-to-front');
                },

                '#btnright click'() {
                    this.view.front.removeClass().addClass('cube-face cube-front cube-front-to-left');
                    this.view.right.removeClass().addClass('cube-face cube-right cube-right-to-front');
                },

                '#btnrightToFront click'() {
                    this.view.front.removeClass().addClass('cube-face cube-front');
                    this.view.right.removeClass().addClass('cube-face cube-right');
                    this.view.right.removeClass().addClass('cube-face cube-right');
                },

                '#btnleftToFront click'() {
                    this.view.front.removeClass().addClass('cube-face cube-front');
                    this.view.left.removeClass().addClass('cube-face cube-left');
                    this.view.right.removeClass().addClass('cube-face cube-right');
                }
            });
        }


        // viewDidLoad() {
        //     this.initDeviceDefault();

        //     this.camera = new Camera.View();
        //     this.camera.render(this.view.element);

        //     this.streamer = new Camera.Streamer();
        //     this.streamer.start();

        //     this.camera.setStreamer(this.streamer);

        //     super.viewDidLoad();
        // }

        // initDeviceDefault() {
        //     Camera.Devices.getDefault().once((audio, video) => {
        //         this.currentAudio = audio;
        //         this.currentVideo = video;
        //     });

        //     Camera.Devices.load().once((devices) => {
        //         this._videoDevices = devices.getVideos();
        //     });
        // }

        // toggleVideoDevice() {
        //     var video = null;

        //     for (let i = 0; i < this._videoDevices.length; i++) {
        //         if (this.currentVideo.label == this._videoDevices[i].label) {
        //             continue;
        //         }

        //         video = this._videoDevices[i];
        //     }

        //     this.currentVideo = video || this.currentVideo;
        // }

        // events(listen) {
        //     super.events(listen);

        //     listen({
        //         '#changeCamera click': function () {
        //             this.toggleVideoDevice();
        //             this.streamer.stop();
        //             this.streamer = new Camera.Streamer();
        //             this.camera.setStreamer(this.streamer);

        //             this.streamer.start(true, { id: this.currentVideo.deviceId });
        //         }
        //     });
        // }

        /**
         * TEST SIGNAL
         * */
        // viewDidLoad() {
        //     this.signal = new Asterisk.Signal('ws://localhost:775');

        //     this.signal.event.listen('connected', () => {
        //         console.log('conectado');
        //     });

        //     this.signal.event.listen('disconnected', () => {
        //         console.log('desconectado');
        //     });

        //     this.signal.event.listen('client.disconnected', (client) => {
        //         console.log(client);
        //     })
        //     super.viewDidLoad();
        // }

        /**
         * TEST CAMERA AND STREAM
         * */
        // viewDidLoad() {
        // this.camera = new Camera.View();
        // this.camera.render(this.view.element);

        // var streamer = new Camera.Streamer();
        // this.camera.setStreamer(streamer);
        // streamer.create();

        // super.viewDidLoad();
        // }
    }

    Pi.Export('App', App);
});