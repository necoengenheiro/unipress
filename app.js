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
            
            this.camera = new Camera.View();
            this.camera.render(this.view.element);

            this.hub.setStreamer(this.streamer);
            this.hub.event.listen('new::streamming', (streamer) => {
                this.camera.setStreamer(streamer);
            });

            if (this.isAdmin) {
                this.hub.isMaster = true;

                this.streamer.start();
                
                this.camera.setStreamer(this.streamer);
            }

            super.viewDidLoad();
        }

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