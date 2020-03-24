yum.define([
    Pi.Url.create('Vendor', '/camera/devices.js')
], function () {

    class Allower extends Pi.Class {

        instances() {
            this.event = new Pi.Event();

            super.instances();
        }

        static requestPermission() {
            var promise = new Pi.Promise();

            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            }).then((stream) => {
                stream.getTracks().forEach(track => track.stop());

                promise.resolve();
            }).catch((e) => {
                promise.reject(e);
                // this.event.trigger('critical', e);
            });

            return promise;
        }

    };

    Pi.Export('Camera.Allower', Allower);

});