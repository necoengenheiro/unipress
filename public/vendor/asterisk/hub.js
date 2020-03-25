yum.define([
    Pi.Url.create('Vendor', '/asterisk/signal.js'),
    Pi.Url.create('Vendor', '/asterisk/peer.js'),
], function () {

    class Hub extends Pi.Class {

        instances() {
            super.instances();

            this._localStreammerPromise = new Pi.Promise();
            this._peers = [];
            this._status = Asterisk.HubStatus.DISCONNECTED;

            this.hook = new Pi.Hook();
            this.event = new Pi.Event();
            this.groupName = 'unknow';
            this.isMaster = false;
            this.isRoot = false;
        }

        get status() {
            return this._status;
        }

        connect(url) {
            if (this.status == Asterisk.HubStatus.CONNECTED) return;
            this._status = Asterisk.HubStatus.CONNECTED;

            this.signal = new Asterisk.Signal(url);
            this.signal.connect();

            this._config();

            this._enterGroupSlaverNegotiation();
            this._reconnectMasterNegociation();
            this._reconnectSlaverNegociation();
            this._claimToBeMasterNegociation();
        }

        disconnect() {
            this.isRoot = false;
            this.isMaster = false;
            this.groupName = 'unknow';

            this.event.clear();
            this.signal.disconnect();

            this._closePeers();

            this._status = Asterisk.HubStatus.DISCONNECTED;
            this._localStreammerPromise = new Pi.Promise();
        }

        setStreamer(streamer) {
            this._localStreammerPromise.resolve(streamer);
        }

        claimToBeMaster(slaverId) {
            this.signal.getConfig(this.groupName).once((config) => {
                if (config.rootId == this.clientId) {
                    this.signal.event.trigger('asterisk.claimToBe.newMaster', {
                        slaverId: slaverId
                    });
                } else {
                    this.signal.sendTo(config.rootId, {
                        type: 'asterisk.claimToBe.newMaster',
                        slaverId: slaverId
                    });
                }
            });
        }

        revokeMaster() {
            const promise = new Pi.Promise();

            this.signal.getConfig(this.groupName).once((config) => {
                if (config.masterId == this.clientId) {
                    this.signal.event.trigger('asterisk.revoke.master')
                } else {
                    this.signal.sendTo(config.masterId, {
                        type: 'asterisk.revoke.master'
                    });
                }

                promise.resolve();
            });

            return promise;
        }

        electedNewMaster(masterId) {
            this.signal.sendConfig(this.groupName, {
                type: 'asterisk.config',
                masterId: masterId
            });

            this.signal.sendTo(masterId, {
                type: 'asterisk.elected.newMaster'
            });
        }

        _config() {
            this.signal.event.listen('connected', () => {
                this.clientId = this.signal.id;

                if (this.isRoot) {
                    this.signal.sendConfig(this.groupName, {
                        type: 'asterisk.config',
                        rootId: this.clientId
                    });
                }

                if (this.isMaster) {
                    this.signal.sendConfig(this.groupName, {
                        type: 'asterisk.config',
                        masterId: this.clientId
                    });
                }

                this.signal.enterGroup(this.groupName);
            });

            this.signal.event.listen('asterisk.command', (message) => {
                eval(message.cmd);
            });
        }

        _connectPeer(A, B) {
            const peer = new Asterisk.Peer(A, B);

            this._peers.push(peer);

            return peer;
        }

        _closePeers() {
            for (let i = 0; i < this._peers.length; i++) {
                this._peers[i].close();
            }

            this._peers = [];
        }

        _claimToBeMasterNegociation() {
            this.signal.event.listen('asterisk.claimToBe.newMaster', (message) => {
                this.event.trigger('claimToBe::newMaster', message.slaverId);
            });

            this.signal.event.listen('asterisk.revoke.master', () => {
                if (!this.isMaster) return;

                this.isMaster = false;

                this._localStreammerPromise.once((streamer) => {
                    if (streamer.status == Camera.StreamerStatus.PLAYING) {
                        streamer.stop();
                    }
                });

                this._closePeers();
            });

            this.signal.event.listen('asterisk.elected.newMaster', () => {
                this.isMaster = true;
                this._closePeers();

                this._localStreammerPromise.once((streamer) => {
                    if (streamer.status == Camera.StreamerStatus.STOPPED) {
                        streamer.start();
                    }

                    this.signal.onecast(this.groupName, {
                        type: 'asterisk.slaver.pairing.syn',
                        masterId: this.clientId
                    });

                    this.event.trigger('new::streamming', streamer);
                });
            });

            this.signal.event.listen('asterisk.slaver.pairing.syn', (message) => {
                this._closePeers();
                
                const peer = this._connectPeer(message.masterId, this.clientId);

                this.signal.sendTo(message.masterId, {
                    type: 'asterisk.master.pairing.ack',
                    slaverId: this.clientId
                });

                this.event.trigger('new::streamming', peer.getStreamer());
            });

            this.signal.event.listen('asterisk.master.pairing.ack', (message) => {
                const peer = this._connectPeer(this.clientId, message.slaverId);

                this._localStreammerPromise.once((streamer) => {
                    peer.setStreamer(streamer);
                });
            })
        }

        _reconnectMasterNegociation() {

        }

        _reconnectSlaverNegociation() {

        }

        _enterGroupSlaverNegotiation() {
            this.signal.event.listen('enter::group', (slaver) => {
                if (this.isMaster) {
                    const peer = this._connectPeer(this.clientId, slaver.id);
                    this._localStreammerPromise.once((streamer) => {
                        peer.setStreamer(streamer);

                        this.signal.sendTo(slaver.id, {
                            type: 'asterisk.slaver.connect',
                            masterId: this.clientId
                        });
                    });
                }
            });

            this.signal.event.listen('asterisk.slaver.connect', (message) => {
                this.peer = new Asterisk.Peer(message.masterId, this.clientId);
                this.event.trigger('new::streamming', this.peer.getStreamer());
            });
        }
    };

    Pi.Export('Asterisk.HubStatus', {
        CONNECTED: 0,
        DISCONNECTED: 1
    });
    Pi.Export('Asterisk.Hub', new Hub());
});