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

        getId(){
            return this.A + '-' + this.B;
        }

        connect() {
            this._peer.createOffer((desc) => {
                var offer = new RTCSessionDescription(desc);
                this._peer.setLocalDescription(offer, () => {
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
                Asterisk.Hub.signal.sendTo(this.B, {
                    type: 'peer.candidate',
                    id: this.getId(),
                    data: evt.candidate
                });
            }

            this._peer.onnegotiationneeded = () => {
                this.connect();
            }

            this._peer.onconnectionstatechange = (e) => {
                if (e.type == 'connectionstatechange') {
                    if (this._peer.connectionState == 'disconnected') {
                        this.close();
                    }
                }
            }

            this._peer.ontrack = (evt) => {
                this._promise.resolve(evt.streams[0]);
            }
        }

        _listenMessages() {
            this._fnMessages = (message) => {
                if (message.type == 'peer.sdp' && message.id == this.getId()) {
                    this._peer.setRemoteDescription(new RTCSessionDescription(message.data), () => {
                        if (this._peer.remoteDescription.type === 'offer') {
                            this._peer.createAnswer().then((answer) => {
                                this._peer.setLocalDescription(answer, () => {
                                    setTimeout(() => {
                                        for (let i = 0; i < this._iceCanditates.length; i++) {
                                            this._peer.addIceCandidate(new RTCIceCandidate(this._iceCanditates[i]));
                                        }

                                        Asterisk.Hub.signal.sendTo(this.A, {
                                            type: 'peer.sdp',
                                            id: this.getId(),
                                            data: this._peer.localDescription
                                        });
                                    }, 1000);
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
                    this._iceCanditates.push(message.data);
                }
            };

            Asterisk.Hub.signal.receive(this._fnMessages);
        }
    };

    Pi.Export('Asterisk.Peer', Peer);
});