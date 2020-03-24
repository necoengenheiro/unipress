yum.define([
    Pi.Url.create('Vendor', '/asterisk/signal.js'),
    Pi.Url.create('Vendor', '/asterisk/peer.js'),
], function () {

    class Hub extends Pi.Class {

        instances() {
            super.instances();

            this._localStreammer = new Pi.Promise();

            this.event = new Pi.Event();
            this.groupName = 'unknow';
            this.isMaster = false;
        }

        init() {
            this.signal = new Asterisk.Signal(Pi.App.getConfig('asterisk.signal.url'));

            this._config();
            this._connectSlaverNegotiation();
            this._reconnectMasterNegociation();
            this._reconnectSlaverNegociation();
            this._setNewMasterNegociation();
        }

        setStreamer(streamer){
            this._localStreammer.resolve(streamer);
        }

        setNewMaster(masterId){
            this._changeMaster(masterId);
        }

        _config() {
            this.signal.event.listen('connected', () => {
                this.clientId = this.signal.id;
                this.signal.enterGroup(this.groupName);
            });
        }

        _changeMaster(newMasterId) {
            this.isMaster = false;

            this.signal.sendTo(newMasterId, {
                type: 'asterisk.slaver.set.newMaster'
            });
        }

        _reconnectMasterNegociation() {
            
        }

        _reconnectSlaverNegociation() {
            
        }

        _setNewMasterNegociation() {
            this.signal.event.listen('asterisk.slaver.set.newMaster', () => {
                this.isMaster = true;

                this.signal.onecast(this.groupName, {
                    type: 'asterisk.slaver.change.master.init',
                    masterId: this.clientId
                });
            });

            this.signal.event.listen('asterisk.slaver.change.master.init', (message) => {
                this.peer = new Asterisk.Peer(message.masterId, this.clientId);

                this.signal.sendTo(message.masterId, {
                    type: 'asterisk.master.pairing.init',
                    slaverId: this.clientId
                });
            });

            this.signal.event.listen('asterisk.master.pairing.init', (message) => {
                this.peer = new Asterisk.Peer(this.clientId, message.slaverId);

                this.signal.sendTo(message.slaverId, {
                    type: 'asterisk.slaver.pairing.init',
                    masterId: this.clientId
                });
            })
        }

        _connectSlaverNegotiation() {
            this.signal.event.listen('enter::group', (slaver) => {
                if (!this.isMaster) return;

                this.peer = new Asterisk.Peer(this.clientId, slaver.id);

                this._localStreammer.once((streamer) => {
                    this.peer.setStreamer(streamer);

                    this.signal.sendTo(slaver.id, {
                        type: 'asterisk.slaver.pairing.init',
                        masterId: this.clientId
                    });
                });
            });

            this.signal.event.listen('asterisk.slaver.pairing.init', (message) => {
                this.peer = new Asterisk.Peer(message.masterId, this.clientId);
                this.signal.sendTo(message.masterId, {
                    type: 'asterisk.master.connect'
                });
                
                // LOAD STREAMMING
                this.event.trigger('new::streamming', this.peer.getStreamer());
            });

            this.signal.event.listen('asterisk.master.connect', () => {
                // this.peer.connect();
            });
        }
    };

    Pi.Export('Asterisk.Hub', new Hub());
});