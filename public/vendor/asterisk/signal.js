yum.define([

], function () {

    class Signal extends Pi.Class {

        instances() {
            super.instances();

            this.event = new Pi.Event();
            this.isConnected = false;
            
            this._fnMessages = [];
            this._promise = new Pi.Promise();
        }

        init(url) {
            this.url = url;

            this._configure();
        }
        
        connect(){
            this._connect();
        }

        disconnect(){
            this.event.clear();
            this.isConnected = false;

            this._ws.close();
            this._promise.clear();
            
            this._unlisten();
        }

        waitConnection() {
            return this._promise;
        }

        enterGroup(group) {
            this._send(-1, {}, {
                type: 'asterisk.entergroup',
                groupName: group
            });
        }

        leaveGroup() {
            this._send(-1, {}, {
                type: 'asterisk.leavegroup'
            });
        }

        sendTo(id, message) {
            this._send(id, message, {
                type: 'asterisk.unicast'
            });
        }

        sendConfig(group, config) {
            config.group = group;
            this._send(-1, {}, config);
        }

        getConfig(name) {
            const promise = new Pi.Promise();
            const url = Pi.Url.create(this.url);
            const request = new Pi.Request();

            request.getJson(`https://${url.host()}:8080/group/config/get?name=${name}`).ok((config) => {
                promise.resolve(config);
            })

            return promise;
        }

        broadcast(message) {
            this._send('*', message, {
                type: 'asterisk.broadcast',
                from: this.id,
            });
        }

        onecast(group, message) {
            this._send(`*`, message, {
                type: 'asterisk.onecast',
                from: this.id,
                group: group
            });
        }

        receive(fn) {
            let cb = (evt) => {
                var message = JSON.parse(evt.data);

                if (message.data) {
                    fn(message.data, message.from);
                }
            };

            cb._id = fn._id = this._fnMessages.length + 1;
            this._fnMessages.push(cb);
            this._ws.addEventListener('message', cb);
        }

        unreceive(fn) {
            if (fn == null) return;

            for (let i = 0; i < this._fnMessages.length; i++) {
                if (fn._id == this._fnMessages[i]._id) {
                    this._ws.removeEventListener('message', this._fnMessages[i]);
                    this._fnMessages.splice(i, 1);
                    break;
                }
            }
        }

        _configure() {
            this._onMessage();
        }

        _connect() {
            this._tryConnect(this.url);
        }

        _tryConnect(url) {
            this._unlisten();
            this._ws = null;
            this._ws = new WebSocket(url);
            this._listen();
        }

        _listen() {
            this._onOpen = () => {

            };

            this._onClose = () => {
                if (this.isConnected) {
                    this.event.trigger('disconnected');
                } else {
                    return;
                }

                this.isConnected = false;
                this._hw = setTimeout(() => {
                    this._connect();
                }, 3000);
            };

            this._onError = () => {
                this._hw = setTimeout(() => {
                    this._connect();
                }, 3000);
            };

            this._ws.addEventListener('open', this._onOpen);
            this._ws.addEventListener('close', this._onClose);
            this._ws.addEventListener('error', this._onError);

            this._restoreOnMessage();
        }

        _unlisten() {
            if (this._ws == null) return;
            
            if (this._onOpen) this._ws.removeEventListener('open', this._onOpen);
            if (this._onClose) this._ws.removeEventListener('close', this._onClose);
            if (this._onError) this._ws.removeEventListener('error', this._onError);

            for (let i = 0; i < this._fnMessages.length; i++) {
                this._ws.removeEventListener('message', this._fnMessages[i]);
            }
        }

        _restoreOnMessage() {
            for (let i = 0; i < this._fnMessages.length; i++) {
                this._ws.addEventListener('message', this._fnMessages[i]);
            }
        }

        _send(id, message, params = {}) {
            params.to = id;
            params.from = this.id
            params.data = message

            if (this._ws.readyState == this._ws.OPEN) {
                this._ws.send(JSON.stringify(params));
            }
        }

        _onMessage() {
            const cb = (evt) => {
                var message = JSON.parse(evt.data);

                if (message.type == 'asterisk.initialize' && !this.isConnected) {
                    this.id = message.clientId;

                    this.isConnected = true;
                    this._promise.resolve();

                    this.event.trigger('connected');
                    return;
                } else if (message.type == 'asterisk.config') { 
                    this.event.trigger('asterisk.config', message);
                } else if (message.type == 'asterisk.client.disconnected') {
                    this.event.trigger('client.disconnected', {
                        id: message.from
                    });
                } else if (message.type == 'asterisk.entergroup') {
                    this.event.trigger('enter::group', {
                        id: message.from
                    })
                } else if (message.type == 'asterisk.leavegroup') {
                    this.event.trigger('leave::group', {
                        id: message.from
                    })
                } else if (Pi.Object.extractValue(message, 'data.type')) {
                    this.event.trigger(message.data.type, message.data, message.from);
                }
            };

            this._fnMessages.push(cb);
        }
    };

    Pi.Export('Asterisk.Signal', Signal);
});