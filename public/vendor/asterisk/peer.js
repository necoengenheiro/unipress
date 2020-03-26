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
            console.log('createOffer');
            this._peer.createOffer((desc) => {
                var offer = new RTCSessionDescription(desc);
                console.log('setLocalDescription');
                this._peer.setLocalDescription(offer, () => {
                    console.log('send peer.sdp');
                    Asterisk.Hub.signal.sendTo(this.B, {
                        type: 'peer.sdp',
                        id: this.getId(),
                        data: this._peer.localDescription
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
                
                console.log('receive iceCanditates');

                Asterisk.Hub.signal.sendTo(this.B, {
                    type: 'peer.candidate',
                    id: this.getId(),
                    data: evt.candidate
                });
            }

            this._peer.onnegotiationneeded = () => {
                console.log('onNegotiationNeeded');
                this.connect();
            }

            this._peer.oniceconnectionstatechange = (e) => {
                console.log(`IceConnectionStateChange ${this._peer.iceConnectionState}`);
            }

            this._peer.onicegatheringstatechange = (e) => {
                console.log(`IceGatheringStateChange ${this._peer.iceGatheringState}`);
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
                                    console.log(`addIceCandidate ${this._iceCanditates.length}`);

                                    console.log(`-> ConnectionState ${this._peer.connectionState}`);
                                    console.log(`-> IceGatheringState ${this._peer.iceGatheringState}`);
                                    console.log(`-> IceConnectionState ${this._peer.iceConnectionState}`);

                                    for (let i = 0; i < this._iceCanditates.length; i++) {
                                        this._peer.addIceCandidate(new RTCIceCandidate(this._iceCanditates[i])).catch(e => console.error(e));
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
                    console.log('push iceCanditates')
                    this._iceCanditates.push(message.data);
                }
            };

            Asterisk.Hub.signal.receive(this._fnMessages);
        }
    };

    Pi.Export('Asterisk.Peer', Peer);
});