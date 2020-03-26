yum.define([

], function () {

    class Streamer extends Pi.Class {
        instances() {
            super.instances();
        }

        getStream() {
            return this._promise;
        }

    }

    class Peer extends Pi.Class {

        instances() {
            super.instances();

            this.event = new Pi.Event();

            this._iceCanditates = [];
            this._promise = new Pi.Promise();
            this._promiseConnect = new Pi.Promise();
            this._promiseIceGathering = new Pi.Promise();
            this._promiseIceCanditatesReceived = new Pi.Promise();

            this.config = {
                servers: [
                    { 'url': 'stun:stun.l.google.com:19302' }
                ]
            };
        }

        init(A, B, servers = null) {
            this.A = A;
            this.B = B;

            this._initConnection(servers);
            this._listenPeers();
            this._listenMessages();
        }

        getId() {
            return this.A + '-' + this.B;
        }

        connect() {
            this._peer.createOffer((desc) => {
                var offer = new RTCSessionDescription(desc);
                console.log('setLocalDescription');
                this._peer.setLocalDescription(offer, () => {
                    this._promiseIceCanditatesReceived.once(() => {
                        console.log('send peer.sdp');
                        Asterisk.Hub.signal.sendTo(this.B, {
                            type: 'peer.sdp',
                            id: this.getId(),
                            data: this._peer.localDescription
                        });
                    });
                });
            }, (msg) => {
                console.log(msg);
                this.event.trigger('critical', msg);
            })

            return this._promiseConnect;
        }

        close() {
            if (this._peer == null) return;

            this._peer.close();

            this._promise.clear();
            this._promiseConnect.clear();
            this._promiseIceGathering.clear();
            this._promiseIceCanditatesReceived.clear();

            this.event.clear();

            Asterisk.Hub.signal.unreceive(this._fnMessages);

            this._peer = null;
            this.event.trigger('closed');
        }

        setStreamer(streamer) {
            streamer.getStream().once((stream) => {
                stream.getTracks().forEach((track) => {
                    console.log('addTrack');
                    this._peer.addTrack(track, stream);
                })
            });
        }

        getStreamer() {
            return new Streamer({
                _promise: this._promise
            });
        }

        _initConnection(servers) {
            if (servers == null) servers = this.config.servers;
            this._peer = new RTCPeerConnection({ 'iceServers': servers });
        }

        _listenPeers() {
            this._peer.onicecandidate = (evt) => {
                if (!evt || !evt.candidate) return;

                this._iceCanditates.push(evt.candidate);

                console.log('receive new iceCanditates');
            }

            this._peer.onnegotiationneeded = () => {
                console.log('onNegotiationNeeded');
                this.connect();
            }

            this._peer.oniceconnectionstatechange = () => {
                console.log(`IceConnectionStateChange ${this._peer.iceConnectionState}`);
            }

            this._peer.onicegatheringstatechange = () => {
                console.log(`IceGatheringStateChange ${this._peer.iceGatheringState}`);

                if (this._peer.iceGatheringState == 'new') {
                    this._promiseIceGathering.resolve();
                }

                if (this._peer.iceGatheringState == 'complete') {
                    Asterisk.Hub.signal.sendTo(this.B, {
                        type: 'peer.candidate',
                        id: this.getId(),
                        canditates: this._iceCanditates
                    });

                    this._promiseIceCanditatesReceived.resolve(this._iceCanditates);
                }
            }

            this._peer.onconnectionstatechange = (e) => {
                console.log(`ConnectionStateChange ${this._peer.connectionState}`);

                if (e.type == 'connectionstatechange') {
                    if (this._peer.connectionState == 'disconnected') {
                        this.close();
                    }
                }
            }

            this._peer.ontrack = (evt) => {
                console.log('onTrack');
                this._promise.resolve(evt.streams[0]);
            }
        }

        _listenMessages() {
            this._fnMessages = (message) => {
                if (message.type == 'peer.sdp' && message.id == this.getId()) {
                    console.log('setRemoteDescription');
                    this._peer.setRemoteDescription(new RTCSessionDescription(message.data), () => {
                        if (this._peer.remoteDescription.type === 'offer') {
                            console.log('createAnswser');
                            this._peer.createAnswer().then((answer) => {
                                console.log('setLocalDescription');
                                this._peer.setLocalDescription(answer, () => {
                                    console.log('add IceCanditates');
                                    for (let i = 0; i < this._iceCanditates.length; i++) {
                                        this._peer.addIceCandidate(new RTCIceCandidate(this._iceCanditates[i]));
                                    }
                                    
                                    Asterisk.Hub.signal.sendTo(this.A, {
                                        type: 'peer.sdp',
                                        id: this.getId(),
                                        data: this._peer.localDescription
                                    });
                                });
                            }).catch((e) => {
                                console.log(e);
                                this.event.trigger('critical', e);
                            });
                        } else if (this._peer.remoteDescription.type == 'answer') {
                            this._promiseConnect.resolve();
                            this.event.trigger('connected');
                        }
                    }, () => {

                    });
                } else if (message.type == 'peer.candidate') {
                    console.log('set iceCanditates array');
                    this._iceCanditates = message.canditates;

                    this._promiseIceGathering.once(() => {

                    });
                }
            };

            Asterisk.Hub.signal.receive(this._fnMessages);
        }
    };

    Pi.Export('Asterisk.Peer', Peer);
});