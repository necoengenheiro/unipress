yum.define([
    Pi.Url.create('Vendor', '/camera/devices.js')
], function () {

    class Allower extends Pi.Class {

        static requestPermission() {
            var promise = new Pi.Promise();

            Camera.Devices.getStream({
                audio: true,
                video: true
            }).once((stream) => {
                stream.getTracks().forEach(track => track.stop());

                promise.resolve();
            }).error(() => {
                promise.reject(e);
            })
            
            return promise;
        }
    };

    Pi.Export('Camera.Allower', Allower);

});