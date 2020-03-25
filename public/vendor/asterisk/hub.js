yum.define([
    Pi.Url.create('Vendor', '/asterisk/signal.js'),
    Pi.Url.create('Vendor', '/asterisk/peer.js'),
], function () {

    class Hub extends Pi.Class {

        instances() {
            super.instances();

            this._localStreammerPromise = new Pi.Promise();
            this._peers = [];
            this._masterId = false;
            this._rootId = false;
            this._hwIntervals = [];
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

            this._setRootNegotiation();
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

            this._rootId = 0;
            this._masterId = 0;
            this._hwIntervals = [];
            this._status = Asterisk.HubStatus.DISCONNECTED;
            this._localStreammerPromise = new Pi.Promise();
        }

        setStreamer(streamer) {
            this._localStreammerPromise.resolve(streamer);
        }

        claimToBeMaster() {
            if (this._rootId) return;

            this.signal.sendTo(this._rootId, {
                type: 'asterisk.claimToBe.newMaster',
                slaverId: this.clientId
            });
        }

        revokeMaster() {
            if (this._masterId) return;

            this.signal.sendTo(this._masterId, {
                type: 'asterisk.revoke.master',
                slaverId: this.clientId
            });
        }

        electedNewMaster(masterId) {
            this._masterId = masterId;

            this.signal.sendTo(this._masterId, {
                type: 'asterisk.elected.newMaster',
                slaverId: this.clientId
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

                this._status = Asterisk.HubStatus.CONNECTED;
            });

            this.signal.event.listen('asterisk.config', (config) => {
                if (config.rootId) this._rootId = config.rootId;
                if (config.masterId) this._masterId = config.masterId;
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
                this.isMaster = false;

                this._localStreammerPromise.once((streamer) => {
                    if (streamer.status == Camera.StreamerStatus.PLAYING) {
                        streamer.stop();
                    }
                });

                this._closePeers();
            });

            this.signal.event.listen('asterisk.elected.newMaster', () => {
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

        _setRootNegotiation() {
            this.signal.event.listen('enter::group', (slaver) => {
                if (this.isRoot) {
                    this._hwIntervals[slaver.id] = Pi.Interval.wait(5000).ok(() => {
                        this.signal.sendTo(slaver.id, {
                            type: 'asterisk.slaver.setroot',
                            rootId: this.clientId
                        });
                    });
                }
            });

            this.signal.event.listen('asterisk.slaver.setroot', (message) => {
                this._rootId = message.rootId;

                this.signal.sendTo(this._rootId, {
                    type: 'asterisk.root.ack',
                    slaverId: this.clientId
                });
            });

            this.signal.event.listen('asterisk.root.ack', (message) => {
                if (this._hwIntervals[message.slaverId] == null) return;

                this._hwIntervals[message.slaverId].clear();
                delete this._hwIntervals[message.slaverId];
            });
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