window.Pi = {}; Pi.Keyboard = {}

Pi.Keyboard = {
    END: 35,
    HOME: 36,
    DELETE: 46,
    INSERT: 45,
    DEL: 127,
    BACKSPACE: 8,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    KEYUP: 38,
    KEYDOWN: 40,
    KEYLEFT: 37,
    KEYRIGHT: 39,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    TAB: 9
};/**
 * @class Pi.Object
 */
Pi.Object = {};

Pi.Object.extractProperty = function (obj, property) {
    let p = property.split('.');

    if (p.length > 1) {
        for (let i = 0; i < p.length - 1; i++) {
            let m = p[i];
            if (obj[m] == undefined) obj[m] = {};
            obj = obj[m];
        }
    } else {
        return obj[property];
    }

    return obj;
}

Pi.Object.extractValue = function (obj, property) {
    if (property.indexOf('.') > -1) {
        let p = property.split('.');
        for (let i = 0; i < p.length; i++) {
            obj = obj[p[i]]
            if (obj == undefined) break;
        }

        return obj;
    } else {
        return obj[property];
    }
}

/**
 * Verifica se nao ha nenhuma propriedade adicionada ao objeto
 * 
 * @method Pi.Object.isEmpty
 * @param {object} obj 
 * @return {boolean}
 */
Pi.Object.isEmpty = function (obj) {
    if (Pi.Type.isArray(obj) && obj.length == 0) return true;

    if (!Pi.Type.isObject(obj)) return false;

    let c = 0;
    for (let i in obj) {
        c++;
        break;
    }

    if (c == 0) return true;
    else return false;
}

/**
 * Adiciona todas as propriedades e metodos de todos os parametros no primeiro
 * 
 * @method Pi.Object.extend
 * @param {arguments} arg
 * @return {object}
 */
Pi.Object.extend = function () {
    for (let i = 1; i < arguments.length; i++) {
        let obj = arguments[i];
        for (let v in obj) {
            arguments[0][v] = obj[v];
        }
    }

    return arguments[0];
}

Pi.Object.extendAndCall = function () {
    let dst = arguments[0];

    for (let i = arguments.length - 1; i > 0; i--) {
        let obj = arguments[i];

        for (let p in obj) {
            if (typeof dst[p] == 'function') {
                dst[p](obj[p]);
            } else {
                dst[p] = obj[p];
            }
        }
    }

    return dst;
}/**
 * @class Pi.String
 */
Pi.String = {};

Pi.String.insert = function (str, beginIndex, endIndexOrText, text) {
    if (text == undefined) {
        text = endIndexOrText;
        return str.substring(0, beginIndex) + text + str.substring(beginIndex);
    } else {
        return str.substring(0, beginIndex) + text + str.substring(endIndexOrText);
    }
};

Pi.String.indexOfs = function (str, beginWord, endWord) {
    let arr = [];
    let i = -1;

    while (true) {
        i = str.indexOf(beginWord, i + 1);
        let beginIndex = i;

        if (i == -1) break;
        i += beginWord.length;

        let f = str.indexOf(endWord, i + 1);
        if (f == -1) break;
        let endIndex = f;

        let inner = str.substr(i, f - i);
        arr.push({
            beginOuterIndex: beginIndex,
            endOuterIndex: endIndex + 1,

            beginInnerIndex: beginIndex + beginWord.length,
            endInnerIndex: endIndex + endWord.length,

            inner: inner,
            outer: beginWord + inner + endWord
        });

        i = f + 1;
    }

    return arr;
};

Pi.String.clips = function (text, beginWord, endWord) {
    let arr = [];
    let i = -1;

    while (true) {
        i = text.indexOf(beginWord, i + 1);
        if (i == -1) break;
        i += beginWord.length;

        let f = text.indexOf(endWord, i + 1);
        if (f == -1) break;

        arr.push(text.substr(i, f - i));
        i = f + 1;
    }

    return arr;
};

Pi.String.clip = function (text, wordBegin, wordEnd) {
    if (Pi.Type.isNumber(wordBegin)) {
        let i = wordBegin;
        let f = text.indexOf(wordEnd);
        return text.substr(i, f - i);
    }

    if (Pi.Type.isNumber(wordEnd)) {
        let i = text.indexOf(wordBegin);
        let f = wordEnd;
        return text.substr(i, f - i);
    }

    let i = text.indexOf(wordBegin);
    if (i == -1) return "";
    i += wordBegin.length;

    let f = text.indexOf(wordEnd, i + 1);
    if (f == -1) return "";

    return text.substr(i, f - i);
};

Pi.String.format = function (format, ...args) {
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};


/**
 * Remove todos os acentos da string
 * 
 * @method Pi.String.removeAcentos
 * @param {string} str
 * @return {string}
 */
Pi.String.removeAcentos = function (str) {
    let str2 = str.replace(/[èìòùîàâêôûãõáéíóúçüÀÂÊÔÛÃÕÁÉÍÓÚÇÜ]/mgi, function (p) {
        let comAcento = "èìòùî àâêôûãõáéíóúçüÀÂÊÔÛÃÕÁÉÍÓÚÇÜ",
            semAcento = "eioui aaeouaoaeioucuAAEOUAOAEIOUCU";

        return semAcento.charAt(comAcento.indexOf(p));
    });

    return str2;
};

/**
 * Verifica se o objeto event fornecido contém apenas caracteres alphanuméricos
 * 
 * @method Pi.String.isAlphaNumeric
 * @param {event} e 
 * @return {boolean}
 */
Pi.String.isAlphaNumeric = function (e) {
    let charCode = (e.which) ? e.which : e.keyCode;
    if (charCode == 8) return true;

    let keynum;
    let keychar;
    let charcheck = /[a-zA-Z0-9]/;
    if (window.event) // IE
    {
        keynum = e.keyCode;
    }
    else {
        if (e.which) // Netscape/Firefox/Opera
        {
            keynum = e.which;
        }
        else return true;
    }

    keychar = String.fromCharCode(keynum);
    return charcheck.test(keychar);
};

/**
 * Convert todos os espaços para código html &nbsp;
 * 
 * @method Pi.String.space2nbsp
 * @param {string} str 
 * @return {string}
 */
Pi.String.space2nbsp = function (str) {
    if (str == null) return '';
    return str.replace(/\s/gi, '&nbsp;').replace(/\-/gi, '&nbsp;-&nbsp;');
};

/**
 * Adiciona três pontos ao final da string de seu tamanho exceder o limite fornecido
 * 
 * @method Pi.String.reticencias
 * @param {string} str 
 * @param {int} length 
 * @return {string}
 */
Pi.String.reticencias = function (str, length) {
    if (str.length > length) return str.substring(0, length) + '...';
    else return str;
}
    ;
/**
 * Remove todos os espaços da string
 * 
 * @method Pi.String.removeSpace
 * @param {string} str 
 * @return {string}
 */
Pi.String.removeSpace = function (str) {
    return (str || '').replace(/\s*/gi, '');
};

/**
 * Retorna a primeira palavra da string
 * 
 * @method Pi.String.firtWord
 * @param {string} str 
 * @return {string}
 */
Pi.String.firstWord = function (str) {
    if (Pi.Type.isString(str)) {
        return str.split(' ')[0];
    } else {
        return '';
    }
};

/**
 * Retorna a última palavra da string
 * 
 * @method Pi.String.lastWord
 * @param {string} str 
 * @return {string}
 */
Pi.String.lastWord = function (str) {
    if (Pi.Type.isString(str)) {
        let p = str.split(' ');
        return p[p.length - 1];
    } else {
        return '';
    }

};

/**
 * Retorna a primeira e última palavras da string
 * 
 * @method Pi.String.firstAndlastWord
 * @param {string} str 
 * @return {string}
 */
Pi.String.firstAndlastWord = function (str) {
    let p = str.split(' ');
    let first = '';

    if (p.length == 1) return str;

    first = str.split(' ')[0];

    return first + ' ' + p[p.length - 1];
};

/**
 * Converte todas as palavras da string para capital. As palavras podem estar seperadas por espaço ou _
 * 
 * @method Pi.String.capital
 * @param {string} str 
 * @return {string}
 */
Pi.String.capital = function (str) {
    if (!Pi.Type.isString(str)) return '';

    str = str.toLowerCase();

    let p = /(^[\s_\.-]*\w|[\s\._-]\w)+/gi,
        m = str.match(p);

    for (let v in m) {
        str = str.replace(m[v], m[v].toUpperCase());
    }

    return str;
};

Pi.String.replace = function (input, search, replacement) {
    return input.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Reduz um nome em n - 1 palavras iniciais mais a ultima palavra
 * 
 * @method Pi.String.cut
 * @param {string} str 
 * @param {int} total 
 * @return {string}
 */
Pi.String.cut = function (str, total) {
    if (!Pi.Type.isString(str) || total < 0) return str;

    let p = str.split(' '),
        arr = [];

    //adiciona a primeira palavra
    arr.push(p[0]);

    if (total > p.length) total = p.length;

    for (let i = 1; i < total; i++) {
        arr.push(p[i]);
    }

    //adiciona a ultima palavra
    if (p.length > total) {
        arr.push(p[p.length - 1]);
    }

    return arr.join(' ');
};

/**
 * Retorna a primeira a segunda abreviada e a ultima palavra de um nome
 * 
 * @method abbr
 * @param {string} str
 * @return {string}
 */
Pi.String.abbr = function (str) {
    let s = Pi.String.cut(str, 3);
    let p = s.split(' ');

    if (p.length >= 3) return p[0] + ' ' + p[1][0] + '. ' + p[p.length - 1];
    else return p.join(' ');

};/**
 * @class Pi.Array
 */
Pi.Array = {};

/**
 * Inserer propriedade em todo os elementos do array
 * 
 * @method insert
 * @param {array} arr
 * @param {object} obj
 * @return {array}
 */
Pi.Array.insert = function (arr, obj) {
    for (let i = arr.length - 1; i >= 0; i--) {
        arr[i] = $.extend({}, arr[i], obj);
    };
};

/**
 * Remove toda repeticao do array tornado-o array com elementos unicos
 *
 * @method Pi.Array.removeRepeticao
 * @param {array} arr
 * @return {array}
 */
Pi.Array.removeRepeticao = function (arr) {
    if (Pi.Type.isString(arr)) {
        let a = [];
        a.push(arr);
        arr = a;
    }

    if (!Pi.Type.isArray(arr)) return null;

    let _arr = [],
        last = '';

    arr.sort();

    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === last) continue;
        last = arr[i];

        _arr.push(arr[i]);
    }

    return _arr;
};

/**
 * Retorna um subarray de um array ou null se parametro arr nao for do tipo array
 * 
 * @method Pi.Array.sub
 * @param {array} arr 
 * @param {int} inicio zero index
 * @param fim {int}
 * @return {array} array || null
*/
Pi.Array.sub = function (arr, inicio, length) {
    if (!Pi.Type.isArray(arr)) return null;

    let _arr = [];

    inicio = inicio || 0;
    length = length || arr.length - 1;

    if (length < 1) return null;

    for (let i = inicio; i <= length; i++) {
        _arr.push(arr[i]);
    }

    return _arr;
};

/**
 * Remove um item de um array
 *
 * @method Pi.ARray.removeByIndex
 * @param {array} arr 
 * @param {int} position zero index
 * @return {array}
*/
Pi.Array.removeByIndex = function (arr, pos) {
    pos = parseInt(pos);
    if (pos >= 0 && Pi.Type.isNumber(pos)) {
        arr.splice(pos, 1);
    }

    return arr;
};

/**
 * Remove um elemento do array. Se o primeiro parametro for uma function remove o elemento se o retorno for verdadeiro
 *
 * @method Pi.Array.remove
 * @param {array} arr 
 * @param {function} cb  function || index
 * @return array
 */
Pi.Array.remove = function (arr, cb) {
    if (Pi.Type.isFunction(cb)) {
        for (let i in arr) {
            if (cb(arr[i])) {
                Pi.Array.removeByIndex(arr, i);
            }
        }
    } else {
        Pi.Array.removeByIndex(arr, cb);
    }

    return arr;
};

/**
 * Verifica se um array possui um elemento especificado
 *
 * @method Pi.Array.contains
 * @param {array} arr 
 * @param {mix} el
 * @return {boolean}
*/
Pi.Array.contains = function (arr, el) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == el) return true;
    }

    return false;
};

Pi.Array.insert = function (arr, element, index) {
    arr.splice(index, 0, element);
};

/**
 * Verifica se os arrays parametrizados sao iguais
 *
 * @method Pi.Array.equals
 * @param {array} arr1 
 * @param {array} arr2 
 * @return {boolean}
*/
Pi.Array.equals = function (arr1, arr2) {
    if (arr1.length != arr2.length) return false;

    arr1.sort();
    arr2.sort();

    for (let i = arr1.length - 1; i >= 0; i--) {
        if (arr1[i] != arr2[i]) return false;
    }

    return true;
};
Pi.Type = {};

Pi.Type.isUndefined = function (obj) {
    if (obj === null) return false;
    else if (obj == undefined) return true;
    else return false;
};

Pi.Type.typeof = function (obj) {
    let v = null;

    if (obj != undefined && obj != null && !Pi.Type.isNumber(obj)) {
        try {
            v = obj.constructor.name;
            if (v == '') v = 'Object';
        } catch (ex) {

        }
    } else if (Pi.Type.isNumber(obj)) {
        return 'Number';
    } else if (obj === undefined) {
        return 'Undefined'
    } else if (obj === null) {
        return 'Null';
    }

    return v;
};

Pi.Type.isNumber = function (obj) {
    if (typeof obj == 'number' && isFinite(obj) && !isNaN(obj)) return true;
    else return false;
};

Pi.Type.isNullOrUndefined = function (obj) {
    if (obj == null || obj == undefined) return true;
    else return false;
};

Pi.Type.isFunction = function (obj) {
    if (typeof obj == 'function') return true;
    else return false;
};

Pi.Type.isArray = function (obj) {
    if (Pi.Type.typeof(obj) == 'Array') return true;

    if (Pi.Type.typeof(obj) == 'String') {
        if (/^\[.*\]$/gi.test(obj)) {
            return true;
        }
    }

    return false;
};

Pi.Type.isObject = function (obj) {
    if (Pi.Type.typeof(obj) == 'Object') return true;
    if (typeof obj == 'object') return true;

    if (Pi.Type.typeof(obj) == 'String') {
        if (/^\{.*\}$/gi.test(obj)) {
            return true;
        }
    }

    return false;
};

Pi.Type.isString = function (obj) {
    if (typeof obj == 'string') return true;
    else return false;
};

Pi.Type.isBoolean = function (obj) {
    if (typeof obj == 'boolean') return true;
    else return false;
};

Pi.Type.isClass = function (obj) {
    if (obj.getClassName == undefined) return false;
    else return true;
};/**
 * @class Pi.Util
 */
Pi.Util = {};
Pi.seed = 0;

/**
 * Gera uma string aleatórioa no formato xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 
 * @method Pi.Util.UUID
 * @return {string}
 */
Pi.Util.UUID = function (format) {
    let d = new Date().getTime();
    let uuid = (format || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid + (Pi.seed++);
}; Pi.Namespace = function (ns_string, builder) {
    var parts = ns_string.split('.'),
        s = window,
        i;

    for (i = 0; i < parts.length; i++) {

        if (typeof s[parts[i]] === "undefined") {
            s[parts[i]] = i + 1 == parts.length ? builder : {};
        }

        s = s[parts[i]];
    }

    if (builder.prototype) {
        builder.prototype.getClassName = function () {
            return ns_string;
        }
    }

    return builder;
};

Pi.Define = Pi.Namespace;
Pi.Export = Pi.Namespace;
Pi.Constant = Pi.Namespace; Pi.Namespace('Pi.Class', class Class {

    constructor(...args) {
        this.defaults();
        this.instances();

        if (Pi.Type.isObject(args[0])) {
            Pi.Object.extendAndCall(this, args[0]);
        }

        this.options = args[0] == undefined ? {} : args[0];

        this.init(...args);
    }

    instances() {

    }

    defaults() {

    }

    inject(json) {
        for (var property in json) {
            this[property] = json[property];
        }

        return this;
    }

    init() {

    }

    jsonWillConvert() {

    }

    toJson() {
        this.jsonWillConvert();
        let json = JSON.parse(JSON.stringify(this));
        delete json.options;
        this.jsonDidConvert(json);

        return json;
    }

    jsonDidConvert(json) {
        delete json.options;
    }

    cloneWillLoad() {

    }

    clone() {
        this.cloneWillLoad();
        let json = this.toJson();
        let clone = this.builder().create(json);
        this.cloneDidLoad(clone);

        return clone;
    }

    cloneDidLoad() {

    }

    builder() {
        let p = this.getClassName().split('.');
        let obj = window;

        for (let i = 0; i < p.length; i++) {
            obj = obj[p[i]]
        }

        return obj;
    }

    proxy(fn) {
        const self = this;
        return function () {
            return fn.apply(self, arguments);
        };
    }

    static create(...args) {
        return new this(...args);
    }

}); Pi.Namespace('Pi.Collection', class picallback extends Array {

    remove(i) {
        this.splice(i, 1);
    }

}); Pi.Namespace('Pi.Hook', class picallback extends Pi.Class {

    instances() {
        super.instances();

        this.list = [];
    }

    clear() {
        this.list = [];
    }

    register(name, fn, ctx) {
        this.list[name] = { name: name, fn: fn, ctx: ctx };

        return this;
    }

    unregister(name) {
        delete this.list[name];

        return this;
    }

    exist(name) {
        return this.list[name] != undefined;
    }

    get(name) {
        return this.list[name];
    }

    invoke(name, ...args) {
        if (!this.exist(name)) return null;

        var item = this.list[name];
        return item.fn.apply(item.ctx, args);
    }
}); (function () {

    Pi.Namespace('Pi.Interval', class piinterval extends Pi.Class {

        static wait(time) {
            const promise = new Pi.Promise();
            const hw = setInterval(() => {
                promise.resolve();
            }, time);

            return new Pi.Interval({ _hw: hw, _promise: promise });
        }

        ok(fn, context){
            this._promise.ok(fn, context);

            return this;
        }

        clear() {
            this._promise.clear();

            clearInterval(this._hw);

            return this;
        }

    });

})(); (function () {

    Pi.Namespace('Pi.Timeout', class pitimeout extends Pi.Class {

        static wait(time) {
            const promise = new Pi.Promise();
            const hw = setTimeout(function () {
                promise.resolve();
            }, time);

            return new Pi.Timeout({ _hw: hw, _promise: promise });
        }

        clear() {
            this._promise.clear();

            clearTimeout(this._hw);

            return this;
        }

    });

})(); Pi.Namespace('Pi.Random', class pirandom extends Pi.Class {

    generator() {
        return Pi.Random.range(0, Number.MAX_VALUE);
    }

    range(_min, _max) {
        _min = _min || 0;
        _max = _max || Number.MAX_VALUE;

        let random = Math.floor(Math.random() * (1 + _max - _min)) + _min;

        if (random > _max) return _max;
        else return random;
    }

}); Pi.Namespace('Pi.List', class pilist extends Pi.Class {
    constructor() {
        super();

        this.list = [];
    }

    add(item) {
        item.uuid = Pi.Util.UUID('xxx-xxx');
        this.list.push(item);

        return item.uuid;
    }

    load(list) {
        this.list = list;

        return this;
    }

    exist(cb) {
        let arr = this.list;

        for (let i = arr.length - 1; i >= 0; i--) {
            if (cb(arr[i])) return true;
        };

        return false;
    }

    first() {
        if (this.list.length == 0) return null;
        return this.list[0];
    }

    last() {
        if (this.list.length == 0) return null;
        return this.list[this.list.length - 1];
    }

    clear() {
        this.list = [];
    }

    count() {
        return this.list.length;
    }

    remove(item) {
        let isCallback = Pi.Type.isFunction(item);

        for (let i = 0; i < this.list.length; i++) {
            if ((isCallback && item(this.list[i])) || (this.list[i].uuid === item.uuid)) {
                delete this.list[i].uuid;
                this.list.splice(i, 1);
                i--;
            }
        }
    }

    find(property, value) {
        let b = value == undefined;

        for (let i = 0; i < this.list.length; i++) {
            if (b) {
                if (property(this.list[i])) return this.list[i];
            } else {
                if (this.list[i][property] == value) return this.list[i];
            }
        }

        return null;
    }

    toArray() {
        for (let i = 0; i < this.list.length; i++) {
            delete this.list[i].uuid;
        }

        return this.list;
    }

    destroy() {
        this.list = null;
    }
}); Pi.Namespace('Pi.Dictionary', class pidic extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.list = [];
    }

    add(key, value) {
        this.list[key] = value;

        return this;
    }

    existKey(key) {
        return this.list[key] != undefined;
    }

    existValue(value) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            if (this.list[i] == value) return true;
        }

        return false;
    }

    getValue(key) {
        return this.list[key];
    }

    remove(key) {
        delete this.list[key];

        return this;
    }

    clear() {
        this.list = [];

        return this;
    }

    toArray() {
        return this.list;
    }

}); Pi.Namespace('Pi.As', class pias extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.alias = new Pi.Dictionary();
    }

    add() {
        if (arguments.length < 2) {
            console.log("Pi.As: numero insulficiente de parametros");
            return false;
        }

        if (this.alias.existKey(arguments[0])) {
            console.log("Pi.As: este apelido ja foi definido: " + arguments[0]);
            return false;
        }

        let value = "";
        for (let i = 1; i < arguments.length; i++) {
            let as = arguments[i];

            if (this.alias.existKey(as)) {
                value += this.alias.getValue(as);
            } else {
                value += as;
            }
        }

        this.alias.add(arguments[0], value);

        return true;
    }

    update() {
        if (arguments.length < 2) {
            console.log("Pi.As: numero insulficiente de parametros");
            return false;
        }

        if (this.alias.existKey(arguments[0])) {
            this.remove(arguments[0]);
            return false;
        }

        let value = "";
        for (let i = 1; i < arguments.length; i++) {
            let as = arguments[i];

            if (this.alias.existKey(as)) {
                value += this.alias.getValue(as);
            } else {
                value += as;
            }
        }

        this.alias.add(arguments[0], value);

        return true;
    }

    remove(as) {
        this.alias.remove(as);

        return this;
    }

    exist(as) {
        return this.alias.existKey(as);
    }

    getValue(as) {
        let v = this.alias.getValue(as);

        if (this.exist(as) == false) {
            return null;
        } else if (this.alias.existKey(v)) {
            return this.getValue(v);
        } else {
            return v;
        }
    }

}); Pi.Namespace('Pi.Event', class pievent extends Pi.Class {

    constructor() {
        super();

        this.list = [];
    }

    listen(event, callback, ctx, once = false) {
        callback.id = Pi.Util.UUID('xxx-xx');
        this.list.push({ event: event, cb: callback, ctx: ctx, once: once });

        return this;
    }

    unlisten(event, cb = '*') {
        for (let i = this.list.length - 1; i >= 0; i--) {
            let item = this.list[i];
            if (item.event == event) {
                if (cb == '*' || cb.id == item.cb.id) {
                    this.list.splice(i, 1);
                    i--;
                }
            }
        }

        return this;
    }

    once(event, callback, ctx) {
        this.listen(event, callback, ctx, true);

        return this;
    }

    trigger(event, ...args) {
        let eventsOnce = [];

        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].event == event) {
                let item = this.list[i];
                item.cb.apply(item.ctx, args);

                if (item.once) {
                    eventsOnce.push(item);
                }
            }
        }

        for (let i = eventsOnce.length - 1; i >= 0; i--) {
            this.unlisten(eventsOnce[i].event, eventsOnce[i].cb);
        }

        return this;
    }

    exist(event) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            if (this.list[i].event == event) return true;
        }

        return false;
    }

    count() {
        return this.list;
    }

    clear() {
        this.list = [];

        return this;
    }

});

Pi.Namespace('Pi.PromiseCollection', class picollection extends Pi.Class {

    instances() {
        this.list = [];
    }

    add(p) {
        this.list.push(p);
    }

    wait() {
        return Pi.Promise.wait.apply(Pi.Promise, this.list);
    }

});

Pi.Namespace('Pi.Promise', class pipromise extends Pi.Class {

    constructor() {
        super();

        this.isOnce = false;

        this.clear();
    }

    static wait() {
        var promise = new Pi.Promise();
        var count = 0;
        var success = true;

        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            arg.done(() => {
                count++;
                if (count == arguments.length) {
                    success ? promise.callDone() : promise.callErr();
                }
            }).error(() => {
                success = false;
            });
        }

        return promise;
    }

    reset() {
        this.cbOk = [];
        this.cbErr = [];
        this.cbDone = [];

        return this;
    }

    clear() {
        this.cbOk = [];
        this.cbErr = [];
        this.cbDone = [];
        this.cbOnce = [];

        this.isOk = false;
        this.isErr = false;
        this.isDone = false;

        this.argOk = [];
        this.argErr = [];

        return this;
    }

    call(arr, args) {
        for (let i = arr.length - 1; i >= 0; i--) {
            arr[i].cb.apply(arr[i].context, args);
        }
    }

    callOnce(){
        this.isOk = true;
        this.call(this.cbOnce, this.argOk);
        this.cbOnce = [];
    }

    callOk() {
        this.isOk = true;
        this.call(this.cbOk, this.argOk);
    }

    callErr() {
        this.isErr = true;
        this.call(this.cbErr, this.argErr);
    }

    callDone() {
        this.isDone = true;
        this.call(this.cbDone, []);
    }

    resolve() {
        this.argOk = arguments;

        this.callOk();
        this.callOnce();
        this.callDone();

        if (this.isOnce) this.reset();

        return this;
    }

    reject() {
        this.argErr = arguments;

        this.callErr();
        this.callDone();

        if (this.isOnce) this.reset();

        return this;
    }

    ok(cb, context) {
        this.cbOk.push({ cb: cb, context: context });

        if (this.isOk) {
            this.callOk();
        }

        return this;
    }

    once(cb, context){
        this.cbOnce.push({ cb: cb, context: context });

        if (this.isOk) {
            this.callOnce();
        }

        return this;
    }

    onceReady(cb, context){
        if (this.isOk) {
            this.cbOnce.push({ cb: cb, context: context });
            this.callOnce();
        }

        return this;
    }

    error(cb, context) {
        this.cbErr.push({ cb: cb, context: context });

        if (this.isErr) {
            this.callErr();
        }

        return this;
    }

    done(cb, context) {
        this.cbDone.push({ cb: cb, context: context });

        if (this.isDone) {
            this.callDone();
        }

        return this;
    }
}); Pi.Export('Pi.RequestError', {
    OFFLINE: 405
}); Pi.Namespace('Pi.Request', class pirequest extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.sending = false;
    }

    abort() {
        if (this.xhr) {
            this.sending = false;
            this.xhr.abort();
            this.xhr = null;
        }
    }

    convertObjectToFormData(obj) {
        let encodedString = '';

        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += prop + '=' + obj[prop];
            }
        }

        return encodedString;
    }

    isSending() {
        return this.sending;
    }

    createRequest(url, config, success, error) {
        var headers = new Headers();
        headers.append('Accept', 'application/json, text/plain, */*');

        this.xhr = new AbortController();
        var settings = config({
            signal: this.xhr.signal,
            mode: 'cors',
            headers: headers
        });

        this.sending = true;
        fetch(url, settings).then((response) => {
            this.sending = false;

            if (response.status == 200) {
                response.text().then((text) => {
                    success(text);
                });
            } else {
                error(response.status);
            }

            this.xhr = null;
        }).catch(function (e) {
            if (e.message == 'Failed to fetch') {
                error(e.message, Pi.RequestError.OFFLINE);
            }
        });
    }

    requestGet(url, success, error) {
        let auth = Pi.getConfig('request.Authorization');

        this.createRequest(url,
            (config) => {
                config.method = 'GET';
                config.headers.append('X-Requested-With', 'XMLHttpRequest');

                if (auth != undefined) {
                    config.headers.append('Authorization', auth);
                }

                return config;
            },
            (response) => {
                success(response);
            },
            (m, e) => {
                error(m, e);
            }
        );
    }

    requestPost(url, formData, config, success, error) {
        let auth = Pi.getConfig('request.Authorization');

        this.createRequest(url,
            (xhr) => {
                xhr.method = 'POST';

                xhr.headers.append('X-Requested-With', 'XMLHttpRequest');

                if (auth != undefined) {
                    xhr.headers.append('Authorization', auth);
                }

                xhr.body = formData;

                return config(xhr);
            },
            (response) => {
                success(response);
            },
            (m, e) => {
                error(m, e);
            }
        );
    }

    existProtocol(json) {
        return json.status;
    }

    get(url, obj) {
        let promise = new Pi.Promise(),
            qs = '';

        if (obj != undefined) qs = '?' + this.convertObjectToFormData(obj);

        this.requestGet(url + qs, (response) => {
            promise.resolve.call(promise, response);
        }, (...args) => {
            promise.reject.apply(promise, args);
        })

        return promise;
    }

    getJson(url, obj) {
        let promise = new Pi.Promise(),
            qs = '';

        if (obj != undefined) qs = '?' + this.convertObjectToFormData(obj);

        this.requestGet(url + qs, (response) => {
            let json = JSON.parse(response);
            if (this.existProtocol(json)) {
                app.event.trigger(`request::response::code::${json.code}`, json, obj);

                if (json.status == 'ok') promise.resolve.call(promise, json.data, json.paging);
                else promise.reject.call(promise, json.message);
            } else {
                promise.resolve.call(promise, json);
            }
        }, (...args) => {
            promise.reject.apply(promise, args);
        })

        return promise;
    }

    post(url, obj) {
        let promise = new Pi.Promise(),
            formData = this.convertObjectToFormData(obj);

        this.requestPost(url, encodeURI(formData),
            (xhr) => {
                xhr.headers.append('Content-Type', 'application/x-www-form-urlencoded');

                return xhr;
            },
            (response) => {
                promise.resolve.call(promise, response);
            }, (...args) => {
                promise.reject.apply(promise, args);
            });

        return promise;
    }

    sendFiles(url, files) {
        let promise = new Pi.Promise();

        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            formData.append(`file${i}`, files[i]);
        };

        this.requestPost(url, formData,
            (xhr) => {
                // xhr.headers.append('Content-Type', 'application/x-www-form-urlencoded');

                return xhr;
            }, (response) => {
                let json = JSON.parse(response);
                if (this.existProtocol(json)) {
                    app.event.trigger(`request::response::code::${json.code}`, json);

                    if (json.status == 'ok') promise.resolve.call(promise, json.data, json.paging);
                    else promise.reject.call(promise, json.message);
                } else {
                    promise.resolve.call(promise, json);
                }
            }, (...args) => {
                promise.reject.apply(promise, args);
            });

        return promise;
    }

    postJson(url, obj) {
        let promise = new Pi.Promise();

        this.requestPost(url, JSON.stringify(obj),
            (xhr) => {
                xhr.headers.append('Content-Type', 'application/json');

                return xhr;
            }, (response) => {
                let json = JSON.parse(response);
                if (this.existProtocol(json)) {
                    app.event.trigger(`request::response::code::${json.code}`, json, obj);

                    if (json.status == 'ok') promise.resolve.call(promise, json.data, json.paging);
                    else promise.reject.call(promise, json.message);
                } else {
                    promise.resolve.call(promise, json);
                }
            }, (...args) => {
                promise.reject.apply(promise, args);
            });

        return promise;
    }

}); Pi.Namespace('Pi.Url', class piurl extends Pi.Class {

    constructor(...args) {
        super(...args);
    }

    init() {
        let arr = arguments,
            url = '';

        for (let i = 0; i < arr.length; i++) {
            let alias = arr[i];

            if (Pi.Url.alias.exist(arr[i])) {
                alias = Pi.Url.alias.getValue(arr[i]);
            }

            if (alias[0] == '/' && url[url.length - 1] == '/') {
                url += alias.substring(1);
            } else {
                url += alias;
            }

        }

        this.setUrl(url);
    }

    setUrl(url) {
        if (Pi.Url.alias.exist(url)) {
            url = Pi.Url.alias.getValue(url);
        }

        if (Pi.Url.isValid(url)) this.url = url;
    }

    scheme() {
        let url = this.getUrl(),
            i = url.indexOf(':');

        if (i < 0) return '';
        return url.substr(0, i);
    }

    host(host) {
        let url = this.getUrl(),
            h = this.parse(url, 'host');

        if (host === undefined) {
            return h;
        } else {
            this.setUrl(url.replace(h, host));
            return this;
        }
    }

    port(port) {
        let url = this.getUrl(),
            p = this.parse(url, 'port') || '';

        if (Pi.Type.isUndefined(port)) {
            return p;
        }

        let pt = this.port() || '',
            href = this.href();

        if (pt.length == 0) {
            url = url.replace(href, href + ':' + port);
        } else {
            url = url.replace(p, port);
        }

        this.setUrl(url);

        return this;
    }

    href(url) {
        let u = this.host(),
            h = u,
            s = this.parse(this.getUrl(), 'scheme');

        if (url === undefined) {
            let p = this.port();

            if (p.length == 0) p = '';
            else p = ':' + p;

            if (s.length > 0) {
                h = s + '://' + u + p;
            } else {
                h = u + p;
            }

            return h;
        }

        this.setUrl(url);

        return this;
    }

    hash(hash) {
        let url = this.getUrl(),
            hh = this.parse(url, 'hash');

        if (hash === undefined) {
            return hh;
        } else {

            if (hh.length == 0) {
                this.setUrl(url + '#' + hash);
            } else {
                this.setUrl(url.replace(hh, hash));
            }

            return this;
        }
    }

    appendPath(path) {
        let url = this.getUrl(),
            p = this.parse(url, 'path');

        if (Pi.Url.alias.exist(path)) {
            path = Pi.Url.alias.getValue(path);
        }

        if (path === undefined) {
            return p;
        } else {
            if (url.substring(url.length - 1) != '/') url += '/';
            this.setUrl(url + path);
            return this;
        }
    }

    path(path) {
        let url = this.getUrl(),
            p = this.parse(url, 'path'),
            pp = '/' + p;

        if (path === undefined) {
            return pp;
        }

        if (Pi.Url.alias.exist(path)) {
            path = Pi.Url.alias.getValue(path);
        }

        if (p.length == 0) {
            if (url.substring(url.length - 1) != '/' && path.charAt(0) != '/') url += '/' + path;
            else url += path;
        } else {
            url = url.replace(pp, path);
        }

        this.setUrl(url);

        return this;
    }

    filename(filename) {
        let url = this.getUrl();

        if (filename === undefined) {
            return url.replace(/\\/g, '/').replace(/.*\//, '').replace(/\?.*/, '') || '';
        } else {
            let u = this.getUrl(),
                f = this.filename();

            this.setUrl(u.replace(f, filename));
            return this;
        }
    }

    query(query) {
        let url = this.getUrl(),
            p = this.parse(url, 'query');

        if (query === undefined) {
            return p;
        } else {
            let q = this.query();
            this.setUrl(url.replace(q, query));
            return this;
        }
    }

    addQuery(key, value) {
        let q = this.query(),
            url = this.getUrl(),
            qs = Pi.String.format('{1}={2}', url, key, encodeURIComponent(value));

        if (q.length == 0) {
            this.setUrl(url + '?' + qs);
        } else {
            this.setUrl(url + '&' + qs);
        }

        return this;
    }

    getQuery(key) {
        let qs = this.query().split('&');

        for (var i = 0; i < qs.length; i++) {
            let q = qs[i].split('=');
            if (q[0] == key) {
                return decodeURIComponent(q[1]);
            }
        }

        return '';
    }

    dirname() {
        return this.getUrl().replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }

    getUrl() {
        var url = this.url;
        var m = this.options;

        if (Pi.Subdomains.exist(m)) {
            var s = Pi.Subdomains.next(m);
            return Pi.String.format(this.url, s);
        }

        return this.url || '';
    }

    toString() {
        return this.getUrl();
    }

    parse(url, parte) {
        let p = { 'url': 0, 'scheme': 1, 'slash': 2, 'host': 3, 'port': 4, 'path': 5, 'query': 6, 'hash': 7 },
            pattern = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
            s = pattern.exec(url || '');

        if (s == null) return '';
        return s[p[parte]] || '';
    }

    static isValid(url) {
        return /(http|https|)(:\/\/|)([\w-]+\.?)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(url || '');
    }

    static add() {
        Pi.Url.alias.add.apply(Pi.Url.alias, arguments);
    }

    static get(name) {
        return Pi.Url.alias.getValue(name);
    }

    static to() {
        let arr = arguments,
            url = '';

        for (let i = 0; i < arguments.length; i++) {
            let alias = arr[i];

            if (Pi.Url.alias.exist(arr[i])) {
                alias = Pi.Url.alias.getValue(arr[i]);
            }

            if (alias[0] == '/' && url[url.length - 1] == '/') {
                url += alias.substring(1);
            } else {
                url += alias;
            }

        }

        window.location = url;
    }

    static query(query) {
        let q = Pi.Url.create(window.location).query(),
            p = q.split('&');

        for (let i in p) {
            let pp = p[i].split('=');
            if (pp[0] == query) return pp[1];
        }
    }

});

Pi.Namespace('Pi.Subdomains', class pisubdomains extends Pi.Class {

    instances() {
        this.list = [];
    }

    next(m) {
        var s = this.get(m);
        s.total++;
        return s.subdomains[s.subdomains.length % s.total];
    }

    exist(m) {
        return this.get(m) == null ? false : true;
    }

    add(m, s) {
        this.list.push({
            index: 0,
            module: m,
            subdomains: s,
            total: 0
        });
    }

    get(m) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].module == m) return this.list[i];
        }

        return null;
    }

});

Pi.Subdomains = new Pi.Subdomains();

Pi.Url.alias = new Pi.As(); Pi.Namespace('Pi.Callback', class picallback extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.list = [];
    }

    clear() {
        this.list = [];
    }

    add(name, fn, ctx) {
        if (this.list[name] == null) {
            this.list[name] = [];
        }

        this.list[name].push({ name: name, fn: fn, ctx: ctx });

        return this;
    }

    remove(item) {
        if (!this.exist(item)) return this;

        this.list[name] = [];

        return this;
    }

    exist(name) {
        return this.list[name] != null;
    }

    get(name) {
        if (!this.exist(name)) return [];
        return this.list[name];
    }

    findAll(name) {
        return this.get(name);
    }

    trigger(name, ...args) {
        let arr = this.findAll(name);
        let r = undefined;

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];

            r = item.fn.apply(item.ctx, args);
        }

        return r;
    }
}); Pi.Namespace('Pi.Convert', class piconvert extends Pi.Class {

    static toPercent(n, dec = 2) {
        return new Number(n * 100).toFixed(dec);
    }

    static pixelToNumber(pixel) {
        let s = pixel.toString().replace(/px/gi, '');
        return Pi.Convert.stringToNumber(s);
    }

    static rgbToHex(rgb) {
        var _ = rgb.replace('rgb(', '').replace(')', '').replace(/\s*/, '');
        var p = _.split(',')
        var r = parseInt(p[0]);
        var g = parseInt(p[1]);
        var b = parseInt(p[2]);

        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static numberToPixel(number) {
        if (Pi.Type.isNumber(number)) {
            return number + 'px';
        }

        if (number.toString().toLowerCase().indexOf('px') > -1) {
            return number;
        }

        return number + 'px';
    }

    static stringToNumber(str) {
        let n = Number(str);
        if (Pi.Type.isNumber(n)) return n;
        else return false;
    }

    static stringToBoolean(str) {
        if (str == undefined || str == null) return false;
        str = str.toString().toUpperCase();

        if (str == 'FALSE' || str == '0' || str == 0) return false;
        else return true;
    }

    static realToNumber(real) {
        real = real.toString();
        if (real.length == 0) return 0.00;

        let s = real.replace('R$', '').replace(/\s*/gi, '').replace(/\(/, '-').replace(/\)/, '').replace(/\./, "");
        s = s.replace(/\./, '');
        s = s.replace(/\,/, ".");

        return parseFloat(s);
    }

    static realToInt(real) {
        let n = Pi.Convert.realToNumber(real);
        return new Number(new Number(n).toFixed(0));
    }

    static numberToReal(dolar) {
        if (dolar == undefined) return '';
        if (dolar == null) return '';

        let c = new Number(dolar).toFixed(2),
            h = "",
            f = c.toString().split("."),
            a = f[0].toString().replace("-", ""),
            b = typeof f[1] == "undefined" ? "00" : f[1],
            g = "",
            d = 1;

        if (c.toString().indexOf("-") > -1) {
            h = "-"
        }

        for (var e = a.length - 1; e >= 0; e--) {
            g = a.charAt(e) + g;
            if (d % 3 == 0 && e != 0 && isFinite(a.charAt(e)) == true) {
                g = "." + g
            }
            d++
        }

        if (b.length == 1) {
            b += "0"
        }

        return h + g + "," + b
    }

}); Pi.Namespace('Pi.Download', class pidownload extends Pi.Class {

    constructor() {
        super();

        this.downloaded = [];
        this.callback = new Pi.Callback();

        this.cache = false;
    }

    createUrl(url) {
        if (!this.cache) return url;

        return Pi.String.format('{0}?_', url, Pi.Random.range(1, 100000));
    }

    getHeader() {
        return document.getElementsByTagName('head')[0] || document.documentElement;;
    }

    insertElement(element) {
        this.getHeader().appendChild(element);
    }

    html(url, callback) {
        let request = new Pi.Request();

        request.get(url).ok((html) => {
            callback(url, html);
        });
    }

    json(url, callback) {
        let request = new Pi.Request();

        request.getJson(url).ok((json) => {
            callback(url, json);
        });
    }

    js(url, callback) {
        let cb = callback || function () { };

        if (this.downloaded[url]) {
            cb(url, true);
            return this;
        }

        if (this.callback.exist(url)) {
            this.callback.add(url, cb);
            return this;
        }
        this.callback.add(url, cb);

        let script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = false;
        script.src = this.createUrl(url);
        script.onload = () => {
            this.downloaded[url] = true;
            this.callback.trigger(url, url);
        };

        this.insertElement(script);
    }

    css(url, callback) {
        let cb = callback || function () { };

        if (this.downloaded[url]) {
            cb(url);
            return this;
        }

        if (this.callback.exist(url)) {
            this.callback.add(url, cb);
            return this;
        }
        this.callback.add(url, cb);

        let style = document.createElement('link');

        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.media = 'all';
        style.href = this.createUrl(url);

        style.onload = () => {
            this.downloaded[url] = true;
            this.callback.trigger(url, url);
        };

        this.insertElement(style);
    }

}); Pi.Namespace('Pi.File', class pifile extends Pi.Class {

    static extension(file) {
        file = file || '';

        let i = file.lastIndexOf('.'),
            j = file.indexOf('?', i);

        if (i > 0) {
            if (j > i) {
                return file.substring(i + 1, j);
            } else {
                return file.substring(i + 1);
            }
        } else {
            return '';
        }
    }

    static filename(file) {
        file = file || '';
        let i = file.lastIndexOf('.'),
            s = file.lastIndexOf('?'),
            f = file.lastIndexOf('/');

        if (i > 0) {

            if (s > f) {
                return file.substring(s + 1, i);
            } else {
                return file.substring(f + 1, i);
            }


        } else if (f > 0) {

            if (s > 0) {
                return file.substring(s + 1);
            } else {
                return file.substring(f + 1);
            }

        } else {
            return file;
        }
    }

});/**
 * @class PI.Seek
 */
Pi.Namespace('Pi.Seek', class piseek extends Pi.Class {

    defaults() {
        this._min = 0;
        this._max = 0;
        this._inx = -1;
    }

    /**
     * Construtor
     * 
     * @method init
     * @param {int} min 
     * @param {int} max 
     */
    init(min, max) {
        this.reset(min, max || Number.MAX_VALUE);
    }

    /**
     * Reseta os valores min e maximo bem como o valor atual do ponteiro
     * 
     * @method reset
     * @param {int} min 
     * @param {int} max 
     * @return {this}
     */
    reset(min, max) {
        this.setMin(min || 0);
        this.setMax(max || 0);
        this._inx = -1;

        return this;
    }

    /**
     * Alias para reset
     *
     * @method clear
     * @return {this}
     */
    clear(min, max) {
        this.reset(min, max);

        return this;
    }

    /**
     * Seta valor mínimo que deve ser menor que o máximo fornecido
     * 
     * @method setMin
     * @param {int} min 
     * @return {this}
     */
    setMin(m) {
        if (m <= this._max) this._min = m;
        if (this._inx != -1 && this._inx < this._min) this._inx = this._min;

        return this;
    }

    /**
     * Seta valor máximo que deve ser mario que o mínimo fornecido
     * 
     * @method setMax
     * @param {int} max 
     * @return {this}
     */
    setMax(m) {
        if (m >= this._min) this._max = m;
        if (this._inx != -1 && this._inx > this._max) this._inx = this._max;

        return this;
    }

    /**
     * Incrementa o valor de maximo
     * 
     * @method incMax
     * @return {this}
     */
    incMax() {
        this.setMax(this._max + 1);

        return this;
    }

    /**
     * Decrementa o valor de maximo
     * 
     * @method decMax
     * @return {this}
     */
    decMax() {
        this.setMax(this._max - 1);

        return this;
    }

    /**
     * Retorna o valor máximo
     * 
     * @method getMax
     * @return {int}
     */
    getMax() {
        return this._max
    }

    /**
     * Retorna o valor de minimo
     * 
     * @method getMin
     * @return {int}
     */
    getMin() {
        return this._min
    }

    /**
     * Avanca o valor do pointeiro ou retorna ao minimo caso tenha alcancado o maximo valor definido
     * 
     * @method next
     * @return {pointer}
     */
    next() {
        this._inx++;
        if (this._inx == this._max + 1) this._inx = this._min;
        return this._inx;
    }

    /**
     * Precede o valor do ponteiro ou seta o valor maximo caso tenha alcancado o valor minimo definido
     * 
     * @method prev
     * @return {pointer}
     */
    prev() {
        this._inx--;
        if (this._inx <= this._min - 1) this._inx = this._max;
        return this._inx;
    }

    /**
     * Retorna ou define o valor atual do ponteiro
     * 
     * @method index
     * @param {int} value 
     * @return {pointer}
     */
    index(value) {
        if (value == undefined) {
            return this._inx == -1 ? this._min : this._inx;
        } else {
            var v = parseInt(value);
            if (v >= this._min && v <= this._max) this._inx = v;
        }
    }
});/**
 * @class Pi.Cookie
 */
Pi.Namespace('Pi.Cookie', class pidic extends Pi.Class {
	/**
     * Adiciona um cookie
     * 
     * @method add
     * @param {string} name 
     * @param {string} value 
     * @param {int} days numero dias de validade do cookie | default 365
     * @param {string} path numero dias de validade do cookie | default 365
     */
    static add(name, value, days, path) {
        days = days || 365;

        var d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));

        var expires = "expires=" + d.toGMTString();

        if (path == undefined) {
            path = 'path=/';
        } else {
            path = 'path=' + path;
        }

        document.cookie = name + "=" + value + "; " + expires + ';' + path;
    }

    /**
     * Retorna se existe o cookie
     * 
     * @method exist
     * @param {string} name 
     * @return {string} string || null
     */
    static exist(name) {
        return Pi.Cookie.get(name) != null;
    }

    /**
     * Retorna um valor de cookie
     * 
     * @method get
     * @param {string} name 
     * @return {string} string || null
     */
    static get(name) {
        var n = name + "=",
            ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(n) == 0) return c.substring(n.length, c.length);
        }

        return null;
    }

    /**
     * Verfica se um name de cookie já existe
     * 
     * @method check
     * @param {string} name 
     * @return {boolean}
     */
    static check(name) {
        if (PI.Cookie.get(name) == '') return false;
        else return true;
    }

    /**
     * Remove um cookie
     * 
     * @method remove
     * @param {string} name 
     * @param {string} path  opcional
     */
    static remove(name, path) {
        if (path == undefined) {
            path = 'path=/';
        } else {
            path = 'path=' + path;
        }

        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;' + path + ';domain=.' + window.location.host;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;' + path;
    }
});

Pi.Namespace('Pi.Paging', class pipaging extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.current = 1;
        this.total = 0;
        this.totalPorPage = 0;
    }

    next() {
        this.go(this.current + 1);

        return this;
    }

    prev() {
        this.go(this.current - 1);

        return this;
    }

    go(current) {
        if (current < 0) return this;

        this.current = current;

        return this;
    }

    reset() {
        this.current = 1;

        return this;
    }
}); Pi.Namespace('Pi.Network', class pinetwork extends Pi.Class {

    static isOnline() {
        return !Pi.Network.isOffline();
    }

    static isOffline() {
        if (navigator.network == null) return false;
        return navigator.network.connection.type == 'none';
    }

}); Pi.Namespace('Pi.Localdb', class pilocaldb extends Pi.Class {

    static set(key, value) {
        if (Pi.Type.isObject(value) || Pi.Type.isArray(value)) {
            window.localStorage.setItem(key, JSON.stringify(value));
        } else {
            window.localStorage.setItem(key, value);
        }
    }

    static get(key) {
        var value = window.localStorage.getItem(key);
        if (value == null) return null;
        if (Pi.Type.isObject(value) || Pi.Type.isArray(value)) return JSON.parse(value);
        return value;
    }

    static remove(key) {
        window.localStorage.removeItem(key);
    }

}); Pi.Namespace('Pi.Runtime', class piruntime extends Pi.Class {
    static eval(obj, str) {
        if (str.indexOf('(') > -1) {
            let p = Pi.String.clip(str, '(', ')');
            let args = [];

            if (p.length > 0) args = p.split(',');

            for (let i = 0; i < args.length; i++) {
                args[i] = args[i].replace('"', '').replace('"', '').replace("'", '').replace("'", '').trim();
            }

            let s = Pi.String.clip(str, 0, '(').split('.'),
                n = s[s.length - 1],
                v = obj;

            for (let i = 0; i < s.length - 1; i++) {
                let e = s[i];
                if (e == 'this') continue;
                v = v[e];

                if (v == undefined) {
                    v = window[e];
                }
            }

            return v[n].apply(v, args);
        } else if (str.indexOf('?') > -1) {
            var r = (function (str) {
                var r = eval(str);
                return r
            }).call(obj, str);

            return r;
        }
        else if (str.indexOf('.') > -1) {
            let s = str.split('.');
            let v = obj;

            for (let i = 0; i < s.length; i++) {
                let e = s[i];

                if (e == 'app' && i == 0) v = app;
                else if (e == 'window' && i == 0) v = window;
                else if (e == 'this') continue;
                else if (v == undefined) break;
                else v = v[e];
            }

            return v;
        } else {
            return obj[str];
        }
    }
}); Pi.Namespace('Pi.Package', class piyum extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.downloadFile = new Pi.Download();
        this.pkgs = [];
        this.loaded = [];
        this.version = ''
        this.__enabled = true;
    }

    submit(url, params) {
        var form = document.createElement('form');

        form.setAttribute('method', 'POST');
        form.setAttribute('action', url);
        form.setAttribute('target', '_blank');

        form._submit_function_ = form.submit;

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', params[key]);

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form._submit_function_();
    }

    minify(url, type = 'js') {
        this.submit(url, { urls: this.listUrls(type) });
    }

    listUrls(type = 'js') {
        var pkgs = yum.pkgs;
        var urls = [];

        for (let i = pkgs.length - 1; i >= 0; i--) {
            var files = pkgs[i].files;
            for (let j = files.length - 1; j >= 0; j--) {
                var url = files[j].toString();
                if (Pi.File.extension(url) == type) {
                    urls.push(url);
                }
            }
        }

        return urls.join(',');
    }

    enable(b = null) {
        this.__enabled = b;

        return this;
    }

    isEnabled() {
        return this.__enabled;
    }

    setVersion(v) {
        if (v.length == 0) return this;

        this.version = '?v' + v;

        return this;
    }

    addPackage(files, callback) {
        this.pkgs.push({ files: files, cb: callback });

        return this;
    }

    getLastPackage() {
        if (this.pkgs.length == 0) return null;
        else return this.pkgs[this.pkgs.length - 1];
    }

    define(files, callback) {
        var __callback = null;
        var __files = null;

        if (Pi.Type.isFunction(files)) {
            __files = [];
            __callback = files;
        } else {
            __files = files;
            __callback = callback;
        }

        this.addPackage(__files, __callback);

        if (!this.isEnabled()) {
            __callback();
        }

        return this;
    }

    download(files, callback, context) {
        if (!this.isEnabled()) {
            (callback || function () { }).call(context);
            return;
        }

        if (files.length == 0) {
            if (callback == undefined) return;
            callback.call(context);
            return;
        }

        this.load(files, () => {
            setTimeout(function () {
                if (callback == undefined) return;
                callback.apply(context, arguments);
            }, 1);
        });

        return this;
    }

    load(files, callback) {
        let total = files.length;
        let counter = new Pi.Callback();
        let args = [];

        if (Pi.Type.isFunction(files)) {
            callback();
            return;
        }

        if (total == 0) {
            callback();
            return;
        }

        counter.add('downloaded', () => {
            total--;
            if (total == 0) {
                callback.apply(null, args);
            }
        });

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file == undefined) {

            }
            let url = file.getUrl();
            let extension = Pi.File.extension(url);

            if (extension == 'js') {
                this.downloadFile.js(url + this.version, (url, cache) => {
                    if (cache) {
                        this.load(this.loaded[url].files, () => {
                            counter.trigger('downloaded');
                        });
                        return;
                    }

                    let pkg = this.getLastPackage();
                    this.loaded[url] = pkg;

                    if (pkg == null) {
                        counter.trigger('downloaded');
                    } else if (pkg.files.length == 0) {
                        pkg.cb();
                        counter.trigger('downloaded');
                    } else {
                        this.load(pkg.files, (...args) => {
                            pkg.cb(...args);
                            counter.trigger('downloaded');
                        });
                    }
                });
            } else if (extension == 'css') {

                if (Pi.getConfig('yum.sync') === false) {
                    counter.trigger('downloaded');
                    this.downloadFile.css(url + this.version, (url) => {

                    });
                } else {
                    this.downloadFile.css(url + this.version, (url) => {
                        counter.trigger('downloaded');
                    });
                }

            } else if (extension == 'html') {
                this.downloadFile.html(url + this.version, (_, html) => {
                    args[this.findIndex(files, url)] = html;
                    counter.trigger('downloaded');
                });
            } else if (extension == 'json') {
                this.downloadFile.json(url + this.version, (_, json) => {
                    args[this.findIndex(files, url)] = json;
                    counter.trigger('downloaded');
                });
            } else {
                counter.trigger('downloaded');
            }
        }

        return this;
    }

    findIndex(files, url) {
        for (var i = 0; i < files.length; i++) {
            if (files[i].getUrl() == url) return i;
        }

        return -1;
    }

});

window.yum = new Pi.Package(); Pi.Namespace('Pi.Url.Hash', class pihash extends Pi.Class {

    static to(hash) {
        let h = Pi.Url.Hash.get();
        let q = h.indexOf('?');

        if (q > -1) {
            q = h.substr(q);
            h = h.substr(0, q);
        } else {
            q = '';
        }

        if ('!' + h == hash || '!' + hash == h) return this;

        if (q.length > 0) hash += q;

        window.location.hash = hash;

        return this;
    }

    static getQueryString(key) {
        let h = Pi.Url.Hash.get();
        let ps = h.split('?');

        if (ps.length < 2) return '';
        let kv = ps[1].split('&');
        for (let i = 0; i < kv.length; i++) {
            var k = kv[i].split('=');
            if (k[0] == key) return k[1];
        }

        return '';
    }

    static removeQueryString(key) {
        let h = Pi.Url.Hash.get();
        let ps = h.split('?');
        let p = [];
        let map = [];

        if (ps.length > 1) {
            p = ps[1].split('&');
            for (let i = 0; i < p.length; i++) {
                if (p[i].length == 0) continue;

                let _ps = p[i].split('=');
                map[_ps[0]] = _ps[1];
            }
        }

        delete map[key];

        var arr = [];
        for (const key in map) {
            arr.push(`${key}=${map[key]}`);
        }

        window.location.hash = `${ps[0]}?${arr.join('&')}`;

        return this;
    }

    static addQueryString(key, value = '') {
        let h = Pi.Url.Hash.get();
        let ps = h.split('?');
        let p = [];
        let map = [];

        if (ps.length > 1) {
            p = ps[1].split('&');
            for (let i = 0; i < p.length; i++) {
                if (p[i].length == 0) continue;

                let _ps = p[i].split('=');
                map[_ps[0]] = _ps[1];
            }
        }

        map[key] = value || '';
        var arr = [];
        for (const key in map) {
            arr.push(`${key}=${map[key]}`);
        }

        window.location.hash = `${ps[0]}?${arr.join('&')}`;

        return this;
    }

    static get() {
        let h = window.location.hash;
        h = h.length == 0 ? h : h.substr(1);

        return h;
    }

    static add(...args) {
        let h = Pi.Url.Hash.get();

        if (h.length > 0) {
            Pi.Url.Hash.to(h + '/' + args.join('/'));
        } else {
            Pi.Url.Hash.to(args.join('/'));
        }

        return this;
    }

    static remove(hash) {
        window.location.hash = window.location.hash.replace(hash, '');

        return this;
    }

    constructor(...args) {
        super(...args);

        this.hashId = 0;
        this.listen();
    }

    listen() {
        this.hashId = Pi.Url.Hash.callbacks.length;

        Pi.Url.Hash.callbacks.push(() => {
            this.hashDidChange(Pi.Url.Hash.get());
        });

        return this;
    }

    unlisten() {
        Pi.Url.Hash.callbacks.splice(this.hashId, 1);
    }

});

Pi.Url.Hash.callbacks = [];

window.onhashchange = function () {
    var arr = Pi.Url.Hash.callbacks;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i]() == false) return true;
    }
}; Pi.Namespace('Pi.Route', class piroute extends Pi.Url.Hash {

    constructor(options) {
        super(options);

        this.routes = [];
    }

    init(routes = []) {
        this.addList(routes);
    }

    start() {
        Pi.History.event.listen('change', this.hashDidChange, this);
    }

    stop() {
        Pi.History.event.unlisten('change', this.hashDidChange);
    }

    parse() {
        this.hashDidChange(Pi.Url.Hash.get());
    }

    addList(routes, ctx) {
        this.routes = [];

        for (let route in routes) {
            this.add(route, routes[route], ctx);
        }
    }

    add(route, callback, ctx) {
        this.routes.push({ name: route, cb: callback, ctx: ctx, pattern: route.replace(/\:(\w*)/gi, "([^&/#?]*)") });

        return this;
    }

    remove(route) {
        for (let i = this.routes.length - 1; i >= 0; i--) {
            if (this.routes[i].name = route) {
                this.routes[i].splice(i, 1);
                i--;
            }
        }

        return this;
    }

    removeQueryString(hash) {
        let p = hash.split('?');
        return p[0];
    }

    to(hash) {
        this.hashDidChange(hash);
    }

    hashDidChange(hash) {
        var hash = this.removeQueryString(hash);

        for (let i = 0; i < this.routes.length; i++) {
            let route = this.routes[i],
                regex = new RegExp(route.pattern, 'mgi'),
                matchs = hash.match(regex);

            if (matchs == null) continue;

            let patchs = route.name.split('/'),
                parameters = [],
                variables = [];

            for (let j = 0; j < patchs.length; j++) {
                if (patchs[j][0] == ':') {
                    variables.push(j);
                }
            }

            patchs = hash.split('/');
            for (let j = 0; j < variables.length; j++) {
                parameters.push(patchs[variables[j]]);
            }

            route.cb.apply(route.ctx, parameters);
            break;
        }
    }

}); Pi.Namespace('Pi.Navigator', class pinav extends Pi.Class {

    static isChrome() {
        return navigator.userAgent.indexOf('Chrome') > -1 ? true : false
    }

    static isCordova() {
        return document.URL.indexOf('file://') == 0
    }

    static isFirefox() {
        return navigator.userAgent.indexOf('Firefox') > -1 ? true : false
    }

    static isSafari() {
        return navigator.userAgent.indexOf('Safari') > -1 ? true : false
    }

    static isInternet() {
        return navigator.userAgent.indexOf('MSIE') > -1 ? true : false
    }

    static isOpera() {
        return navigator.userAgent.indexOf('Opera') > -1 ? true : false
    }

    static isMobile() {
        if (Pi.Navigator.isCordova()) return true;
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

}); Pi.Namespace('Pi.Service', class piservice extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.route = new Pi.Route();
    }

    start() {
        this.route.addList(this.routes(), this);
        this.route.parse();
        this.route.start();
    }

    stop() {
        this.route.stop();
    }
}); (function () {

    let globals = [];

    Pi.Namespace('Pi.EventListener', class piel extends Pi.Class {

        static removeEventsGlobal() {
            for (var i = globals.length - 1; i >= 0; i--) {
                let token = globals[i];
                if (document.getElementById(token.viewId) == null) {
                    token.destroy();
                    globals.splice(i, 1);
                    i--;
                    continue;
                }

            }
        }

        constructor(component) {
            super();

            this.component = component;

            this.listing = [];
            this.tokens = [];
            this.events = [];
        }

        add(stmt, callback) {
            this.events[stmt] = callback;

            return this;
        }

        listen() {
            for (let stmt in this.events) {
                if (this.listing[stmt]) continue;
                this.listing[stmt] = true;

                let token = this.convertToToken(stmt);
                this.processToken(token, this.events[stmt]);
                this.tokens.push(token);
            }

            return this;
        }

        unlisten() {
            for (let i = this.tokens.length - 1; i >= 0; i--) {
                this.tokens[i].destroy();
            }

            this.tokens = [];

            return this;
        }

        extractComponent(propery, context) {
            var p = propery.split('.');

            for (let i = 0; i < p.length; i++) {
                context = context[p[i]];
            }

            return context;
        }

        processToken(token, cb) {
            let self = this;

            if (token.event == 'touchstart' && !Pi.Navigator.isMobile()) {
                token.event = 'click';
            }

            if (Pi.Navigator.isMobile() && token.event == 'scroll') {
                token.event = 'touchmove';
            }

            if (token.type == 'app') {
                let tag = app.event;

                token.cb = function () {
                    cb.call(self.component, arguments[0], self.component);
                };

                token.destroy = function () {
                    tag.unlisten(token.event, token.cb);
                };

                tag.listen(token.event, token.cb);
                return;
            }

            if (token.type == 'object') {
                let p = this.extractComponent(token.property, this.component);
                let tag = p.event;

                token.cb = function () {
                    var arr = [].slice.call(arguments);
                    arr.push(p);
                    cb.apply(self.component, arr);
                };

                token.destroy = function () {
                    tag.unlisten(token.event, token.cb);
                };

                tag.listen(token.event, token.cb);
                return;
            }

            if (token.type == 'at') {
                let tag = this.component.view.element;

                token.cb = function (e, element) {
                    cb.call(self.component, e, element);
                };

                token.destroy = function () {
                    tag.off(token.property, token.event);
                };

                tag.on(token.property, token.event, token.cb);
                return;
            }

            if (token.type == 'global') {
                let p = Pi.Object.extractProperty(window, token.property);
                let tag = p.event;

                token.cb = function () {
                    var arr = [].slice.call(arguments);
                    arr.push(p);
                    cb.apply(self.component, arr);
                };

                token.destroy = function () {
                    tag.unlisten(token.event, token.cb);
                };

                tag.listen(token.event, token.cb);
                return;
            }

            if (token.type == 'window') {
                let tag = window;

                token.viewId = this.component.view.id;
                globals.push(token);

                token.cb = function () {
                    var arr = [].slice.call(arguments);
                    arr.push(self);
                    cb.apply(self.component, arr);
                };

                token.destroy = function () {
                    tag.removeEventListener(token.event, token.cb);
                };

                tag.addEventListener(token.event, token.cb);
                return;
            }

            if (token.type == 'document') {
                let tag = document;

                token.viewId = this.component.view.id;
                globals.push(token);

                token.cb = function () {
                    var arr = [].slice.call(arguments);
                    arr.push(tag);
                    cb.apply(self.component, arr);
                };

                token.destroy = function () {
                    tag.removeEventListener(token.event, token.cb);
                };

                tag.addEventListener(token.event, token.cb);
                return;
            }

            // if (token.type == 'body') {
            //     let tag = document.querySelector('body');

            //     token.viewId = this.component.view.id;
            //     globals.body.push(token);

            //     token.cb = function() {
            //         cb.call(self.component, arguments[0], tag);
            //     };

            //     token.destroy = function() {
            //         tag.removeEventListener(token.event, token.cb);
            //     };

            //     tag.addEventListener(token.event, token.cb);
            //     return;
            // }

            if (token.type == 'id') {
                let tag = this.component.view.element.findElementById(token.property);

                token.cb = function () {
                    var arr = [].slice.call(arguments);
                    arr.push(tag);
                    cb.apply(self.component, arr);
                };

                token.destroy = function () {
                    tag.removeEventListener(token.event, token.cb);
                };

                tag.addEventListener(token.event, token.cb);
                return;
            }

            if (token.type == 'this') {
                let tag = this.component.event;

                token.cb = function () {
                    cb.call(self.component, arguments[0], self.component);
                };

                token.destroy = function () {
                    tag.unlisten(token.event, token.cb);
                };

                tag.listen(token.event, token.cb);
                return;
            }

            if (token.type == 'element') {
                let tag = this.component.view.element;

                token.cb = function () {
                    cb.call(self.component, arguments[0], tag);
                };

                token.destroy = function () {
                    tag.removeEventListener(token.event, token.cb);
                };

                tag.addEventListener(token.event, token.cb);
                return;
            }

            if (token.type == 'selector') {
                let tags = this.component.view.element.querySelectorAll(token.stmt);

                token.cb = function () {
                    cb.call(self.component, arguments[0], arguments[0].target);
                };

                for (let i = tags.length - 1; i >= 0; i--) {
                    (function (token, tag) {
                        tag.addEventListener(token.event, token.cb);
                    })(token, tags[i]);
                }

                token.destroy = function () {
                    for (let i = tags.length - 1; i >= 0; i--) {
                        tags[i].removeEventListener(token.event, token.cb);
                    }
                };

                return;
            }
        }

        convertToToken(stmt) {
            let p = stmt.split(' '),
                token = {
                    event: p.pop(),
                    stmt: p.join(' ')
                };

            if (token.stmt.indexOf('@') > -1) {
                token.type = 'at';
                token.property = token.stmt.replace('@', '');
            } else if (token.stmt.indexOf('(') > -1) {
                token.type = 'global';
                token.property = Pi.String.clip(stmt, '(', ')');
            } else if (token.stmt.indexOf('{window}') > -1) {
                token.type = 'window';
                token.property = 'window'
            } else if (token.stmt.indexOf('{document}') > -1) {
                token.type = 'document';
                token.property = 'document'
            } else if (token.stmt.indexOf('{body}') > -1) {
                token.type = 'body';
                token.property = 'body'
            } else if (token.stmt.indexOf('{this}') > -1) {
                token.type = 'this';
                token.property = 'this'
            } else if (token.stmt.indexOf('{app}') > -1) {
                token.type = 'app';
                token.property = 'app'
            } else if (token.stmt.indexOf('{element}') > -1) {
                token.type = 'element';
                token.property = 'element'
            } else if (token.stmt.indexOf('{') > -1) {
                token.type = 'object';
                token.property = Pi.String.clip(stmt, '{', '}');
            } else if (token.stmt.indexOf('#') > -1) {
                token.type = 'id';
                token.property = token.stmt.replace('#', '');
            } else {
                token.type = 'selector';
                token.property = 'selector'
            }

            return token;
        }

    });
})(); Pi.Namespace('Pi.Tpl', class pitpl extends Pi.Class {

    static render(data, tpl, helpers = {}, patterns = ['@{', '}']) {
        var view = '';
        var tokens = Pi.String.indexOfs(tpl, patterns[0] || '@{', patterns[1] || '}');

        if (Pi.Type.isArray(data)) {
            for (var j = 0; j < data.length; j++) {
                var tpl1 = tpl.slice(0);

                for (var i = tokens.length - 1; i >= 0; i--) {
                    data[j].index = j;
                    data[j].helper = helpers;
                    data[j].helper.model = data[j];
                    tpl1 = Pi.String.insert(tpl1, tokens[i].beginOuterIndex, tokens[i].endOuterIndex, Pi.Runtime.eval(data[j], tokens[i].inner));
                    delete data[j].helper;
                    delete data[j].index;
                }

                view += tpl1;
            }
        } else {
            for (var i = tokens.length - 1; i >= 0; i--) {
                tpl = Pi.String.insert(tpl, tokens[i].beginOuterIndex, tokens[i].endOuterIndex, Pi.Runtime.eval(data, tokens[i].inner));
            }

            view = tpl;
        }

        return view;
    }

    static list(list, classe) {
        if (Pi.Type.isString(list)) list = Array(list);

        let view = Pi.String.format('<ol class="{0}">', classe || '');
        for (var i = 0; i < list.length; i++) {
            let item = list[i];

            view += '<li>' + item + ';</li>';
        }
        view += '</ol>'

        return view;
    }

    // static render(data, tpl){
    // 	var arr = Pi.String.clips(tpl, "@{", "}");
    //        var tokens = [];

    //        for (var i = arr.length - 1; i >= 0; i--) {
    //            tokens.push({
    //                token: "@{" + arr[i] + "}",
    //                name: arr[i],
    //                value: Pi.Runtime.eval(data, arr[i])
    //            });
    //        }

    //        for (var i = tokens.length - 1; i >= 0; i--) {
    //            tpl = tpl.replace(tokens[i].token, tokens[i].value);
    //        }

    //        return tpl;
    // }

}); (function () {
    let set = function (v) {
        let onlyRead = this.getAttribute('only-read');
        if (onlyRead == 'true') return undefined;

        if (this instanceof HTMLImageElement) {
            this.setAttribute('src', v);
            return;
        }

        if (this instanceof HTMLLinkElement) {
            this.setAttribute('href', v);
            return;
        }

        if (this instanceof HTMLInputElement) {
            let type = this.getAttribute('type');

            if (type == 'checkbox') {
                this.checked = v;
            } else if (type == 'radio') {
                this.checked = v;
            } else {
                this.value = v;
            }

            return;
        }

        if (this instanceof HTMLSelectElement) {
            this.value = v;
            return;
        }

        if (this instanceof HTMLTextAreaElement) {
            this.value = v;
            return;
        }

        this.innerHTML = v;
    };

    let get = function () {
        let onlyWrite = this.getAttribute('only-write');
        if (onlyWrite == 'true') return undefined;

        if (this instanceof HTMLImageElement) {
            return this.getAttribute('src');
        }

        if (this instanceof HTMLLinkElement) {
            return this.getAttribute('href');
        }

        if (this instanceof HTMLInputElement) {
            let type = this.getAttribute('type');

            if (type == 'checkbox') {
                return this.checked;
            } else if (type == 'radio') {
                return this.checked;
            } else {
                return this.value;
            }
        }

        if (this instanceof HTMLSelectElement) {
            return this.value;
        }

        if (this instanceof HTMLTextAreaElement) {
            return this.value
        }

        return this.innerHTML;
    };

    let validate = function (b) {
        if (b) {
            this.removeClass('app-invalid-input');
        } else {
            this.addClass('app-invalid-input');
        }
    };

    // set methods
    HTMLInputElement.prototype.set = set;
    HTMLSelectElement.prototype.set = set;
    HTMLDivElement.prototype.set = set;
    HTMLSpanElement.prototype.set = set;
    HTMLTextAreaElement.prototype.set = set;
    HTMLLinkElement.prototype.set = set;

    HTMLTableCellElement.prototype.set = set;
    HTMLTableColElement.prototype.set = set;
    HTMLTableElement.prototype.set = set;
    HTMLTableRowElement.prototype.set = set;
    HTMLLIElement.prototype.set = set;
    HTMLElement.prototype.set = set;

    // get methods
    HTMLLIElement.prototype.get = get;
    HTMLTableCellElement.prototype.get = get;
    HTMLTableColElement.prototype.get = get;
    HTMLTableElement.prototype.get = get;
    HTMLTableRowElement.prototype.get = get;

    HTMLInputElement.prototype.get = get;
    HTMLSelectElement.prototype.get = get;
    HTMLDivElement.prototype.get = get;
    HTMLSpanElement.prototype.get = get;
    HTMLTextAreaElement.prototype.get = get;
    HTMLLinkElement.prototype.get = get;
    HTMLElement.prototype.get = get;

    // validate methods
    HTMLInputElement.prototype.validate = validate;
    HTMLSelectElement.prototype.validate = validate;
    HTMLDivElement.prototype.validate = validate;
    HTMLSpanElement.prototype.validate = validate;
    HTMLTextAreaElement.prototype.validate = validate;
    HTMLLinkElement.prototype.validate = validate;
    HTMLElement.prototype.validate = validate;

    // jquery
    HTMLElement.prototype.query = function () {
        if (this.jq) return this.jq;
        this.jq = $(this);
        return this.jq;
    }

    HTMLElement.prototype.destroy = function () {
        this.query().remove();
    }

    HTMLElement.prototype.addClass = function (name) {
        let list = name.split(' ');

        for (let i = list.length - 1; i >= 0; i--) {
            this.classList.add(list[i]);
        }

        return this;
    };

    HTMLElement.prototype.hasClass = function (name) {
        return this.existClass(name);
    };

    HTMLElement.prototype.removeClass = function (name) {
        let list = name.split(' ');

        for (let i = list.length - 1; i >= 0; i--) {
            this.classList.remove(list[i]);
        }

        return this;
    };

    HTMLElement.prototype.existClass = function (name) {
        return this.className.indexOf(name) > -1;
    };

    HTMLElement.prototype.hide = function () {
        this.displayOld = this.style.display;
        this.css('display', 'none');

        return this;
    };

    HTMLElement.prototype.positionLeft = function (left) {
        if (left == undefined) {
            return this.offsetLeft;
        } else {
            this.css('left', Pi.Convert.numberToPixel(left));
        }

        return this;
    };

    HTMLElement.prototype.positionTop = function (top) {
        if (top == undefined) {
            return this.offsetTop;
        } else {
            this.css('top', Pi.Convert.numberToPixel(top));
        }

        return this;
    };

    HTMLElement.prototype.offset = function () {
        let parent = this.parentElement;
        let top = this.positionTop();
        let left = this.positionLeft();

        while (parent != null) {
            let position = parent.css('position');
            if (position == 'relative' || position == 'absolute' || position == 'fixed') {
                top += parent.positionTop();
                left += parent.positionLeft();
            }

            parent = parent.parent();
        }

        return {
            top: top,
            left: left
        };
    };

    HTMLElement.prototype.position = function (top, left) {
        if (top == undefined) {
            return {
                top: this.positionTop(),
                left: this.positionLeft()
            }
        } else {
            if (top) {
                this.css('top', Pi.Convert.numberToPixel(top));
            }

            if (left) {
                this.css('left', Pi.Convert.numberToPixel(left));
            }
        }

        return this;
    };

    HTMLElement.prototype.css = function (property, value) {
        if (value == undefined) {
            return this.style[property];
        } else {
            this.style[property] = value;
        }

        return this;
    };

    HTMLElement.prototype.width = function (w) {
        if (w == undefined) {
            return this.offsetWidth;
        } else {
            this.css('width', Pi.Convert.numberToPixel(w));
        }

        return this;
    };

    HTMLElement.prototype.height = function (h) {
        if (h == undefined) {
            return this.offsetHeight;
        } else {
            this.css('height', Pi.Convert.numberToPixel(h));
        }

        return this;
    };

    HTMLElement.prototype.show = function () {
        if (this.displayOld == 'none' || this.displayOld == undefined || this.displayOld == "") {
            this.css('display', 'block');
        } else {
            this.css('display', this.displayOld);
        }

        return this;
    };

    HTMLElement.prototype.empty = function () {
        let node = this,
            last;

        while (last = node.lastChild) {
            node.removeChild(last);
        }

        return this;
    };

    function appendElementData(element) {
        if (element.data == null) {
            element.data = {};
            for (let i = 0; i < element.attributes.length; i++) {
                const name = element.attributes[i].name;
                if (name.indexOf('data-') > -1) {
                    element.data[name.replace('data-', '')] = element.getAttribute(name);
                }
            }
        }
    }

    HTMLElement.prototype.on = function (at, event, cb) {
        let key = Pi.String.format('{0}:{1}', at, event);

        this.callback = this.callback || [];
        this.listeners = this.listeners || new Pi.Dictionary();
        this.listeners.add(key, cb);

        if (this.callback[event] == undefined) {
            let container = this;
            let listeners = this.listeners,
                fnEvent = function (e) {
                    let element = e.target;
                    while (container.contains(element)) {
                        let at = element.getAttribute('at'),
                            key = Pi.String.format('{0}:{1}', at, event);

                        if (listeners.existKey(key)) {
                            appendElementData(element);

                            listeners.getValue(key)(e, element);
                            return;
                        }

                        element = element.parentElement;
                    }
                };

            this.callback[event] = {
                total: 1,
                cb: fnEvent
            };

            this.addEventListener(event, fnEvent, true);
        } else {
            this.callback[event].total++;
        }

        return this;
    }

    HTMLElement.prototype.off = function (at, event) {
        let key = Pi.String.format('{0}:{1}', at, event),
            obj = this.callback[event];

        this.listeners.remove(key);

        if (obj) {
            obj.total--;
            if (obj.total <= 0) {
                this.removeEventListener(event, obj.cb);
            }
        }

        return this;
    }

    HTMLElement.prototype.listen = function (event, cb) {
        let fn = (e) => {
            appendElementData(this);
            cb(e, this);
        };

        this.listenEvent = this.listenEvent || [];
        this.listenEvent[event] = fn;

        this.addEventListener(event, fn);

        return this;
    }

    HTMLElement.prototype.unlisten = function (event) {
        this.removeEventListener(event, this.listenEvent[event]);

        return this;
    }

    HTMLElement.prototype.html = function (html) {
        if (html == undefined) {
            return this.innerHTML;
        }

        // this.innerHTML = null;
        this.empty();

        if (Pi.Type.isString(html)) {
            this.innerHTML = html;
        } else {
            this.appendChild(html);
        }

        return this;
    };

    HTMLElement.prototype.appendBefore = function (element) {
        element.parentNode.insertBefore(this, element);
    };

    HTMLElement.prototype.appendAfter = function (element) {
        element.parentNode.insertBefore(this, element.nextSibling);
    };

    let defaultElement = document.createElement('div');
    HTMLElement.prototype.append = function (element) {
        if (Pi.Type.isString(element)) {
            // defaultElement.innerHTML = element;
            // element = defaultElement.firstChild;
            this.insertAdjacentHTML('beforeend', element)
        } else {
            this.appendChild(element);
        }

        return this;
    };

    HTMLElement.prototype.next = function () {
        return this.nextElementSibling;
    };

    HTMLElement.prototype.preview = function () {
        return this.previousElementSibling;
    };

    HTMLElement.prototype.parent = function () {
        return this.parentElement;
    };

    HTMLElement.prototype.at = function (name) {
        return this.querySelector('[at="' + name + '"]');
    }

    HTMLElement.prototype.findElementById = function (id) {
        return this.querySelector('[id="' + id + '"]');
    }

    HTMLElement.prototype.dataModel = function (name) {
        return this.querySelector('[name="' + name + '"]');
    }

    HTMLElement.prototype.val = function (value) {
        if (value == undefined) return this.value;
        this.value = value;
    }

    HTMLButtonElement.prototype.lock = function () {
        var label = this.getAttribute('data-label') || 'Aguarde ...';
        this.label = this.innerHTML;
        this.innerHTML = label;
        this.islocked = true;
    };

    HTMLButtonElement.prototype.unlock = function () {
        this.innerHTML = this.label;
        this.islocked = false;
    };

})(); Pi.Namespace('Pi.Action', class piactions extends Pi.Class {

    constructor(options) {
        super(options)

        this.paging = new Pi.Paging();
        this.request = new Pi.Request();
        this.promise = new Pi.Promise();

        this.isPaging = false;
        this.isCache = false;

        this.load();
    }

    getPromise() {
        return this.promise;
    }

    setPaging(current, total) {
        this.paging.current = current;
        this.paging.totalPorPage = total;

        this.isPaging = true;

        return this;
    }

    setTotalPorPage(total) {
        this.paging.totalPorPage = total;

        return this;
    }

    load() {
        this.parseStmt(this.actionStmt);
        this.addModelMethod();
    }

    addModelMethod() {
        var self = this;
        this.model[this.actionName] = function () {
            return self.invoke.apply(self, arguments);
        };
    }

    invoke() {
        return this.callModelMethod.apply(this, arguments);
    }

    call(...args) {
        this.callModelMethod(...args);

        return this;
    }

    callModelMethod(...args) {
        this.promise = new Pi.Promise();
        let cmd = args.length == 0 ? '' : args[args.length - 1];

        if (Pi.Type.isObject(args[0])) {
            this.model.inject(args[0]);
        }

        if (cmd == 'paging:enable') {
            args.pop();
            this.parameters = args;
            this.paging.reset();
            this.isPaging = true;
        } else if (cmd == 'paging:reset') {
            this.paging.reset();
            this.isPaging = true;
        } else if (cmd == 'paging:next') {
            this.paging.next();
            this.isPaging = true;
        } else if (cmd == 'paging:set') {
            this.paging.go(args[1]);
            this.isPaging = true;
        } else if (cmd == 'paging:disable') {
            // this.promise = new Pi.Promise();
            this.isPaging = false;
        } else if (!this.isPaging) {
            this.parameters = args;
        }

        if (this.method == 'GET') {
            this.createRequestGet.apply(this, this.parameters);
        }

        if (this.method == 'POST') {
            this.createRequestPost.apply(this, this.parameters);
        }

        return this.promise;
    }

    createRequestGet(...args) {
        let url = this.createUrl(...args);

        if (this.request.isSending()) {
            this.request.abort();
        }

        this.model.willRequestGet(url);
        this.request.getJson(url).ok(function (...args) {
            args.splice(0, 0, this);
            args.splice(1, 0, url);
            this.model.willSuccessResponse.apply(this.model, args);
        }, this).error(function (...args) {
            args.splice(0, 0, this);
            args.splice(1, 0, url);
            this.model.willErrorResponse.apply(this.model, args);
        }, this);
        this.model.didRequestGet(url);
    }

    createRequestPost(...args) {
        let url = this.createUrl(...args);
        let json = this.model.toJson();

        if (this.request.isSending()) {
            this.request.abort();
        }

        this.model.willRequestPost(json, url);
        this.request.postJson(url, json).ok(function (...args) {
            args.splice(0, 0, this);
            args.splice(1, 0, url);
            this.model.willSuccessResponse.apply(this.model, args);
        }, this).error(function (...args) {
            args.splice(0, 0, this);
            args.splice(1, 0, url);
            this.model.willErrorResponse.apply(this.model, args);
        }, this);
        this.model.didRequestPost(json, url);
    }

    createUrl(...args) {
        let action = this.getAction(...args);
        let url = '';

        if (this.model.baseUrl instanceof Pi.Url) {
            url = Pi.Url.create(this.model.baseUrl).path(action);
        } else {
            url = Pi.Url.create(this.model.baseUrl + action);
        }

        if (this.isPaging) {
            url.addQuery('page', this.paging.current);
            url.addQuery('totalPorPage', this.paging.totalPorPage);
        }

        return url;
    }

    getAction(...args) {
        let count = 0;
        return this.url.replace(/\:\w+[\(\w*\)]*/gi, (pattern) => {
            let property = pattern.substring(1);
            let modelValue = this.model[property] || '';

            if (args.length == 0) {
                return modelValue;
            } else {
                return (args[count++] || modelValue).toString();
            }
        });
    }

    processErrorResponse() {
        this.promise.reject.apply(this.promise, arguments);
    }

    processSuccessResponse(data, paging) {
        if (Pi.Type.isArray(data)) {
            let arr = [];
            let builder = this.model.builder();

            for (let i = 0; i < data.length; i++) {
                arr.push(builder.create().initWithJson(data[i]));
            }

            data = arr;
        } else {
            data = this.model.builder().create().initWithJson(data);
        }

        this.promise.resolve.call(this.promise, data, paging);
    }

    parseStmt(stmt) {
        let p = stmt.split(':/');

        if (p.length == 1) {
            this.url = '/' + p[0];
        } else {
            this.url = '/' + p[1];
        }

        if (stmt.toUpperCase().indexOf('GET') > -1) {
            this.method = 'GET';
        } else if (stmt.toUpperCase().indexOf('POST') > -1) {
            this.method = 'POST';
        } else if (this.url.indexOf('?') > -1) {
            this.method = 'GET';
        } else {
            this.method = 'POST';
        }
    }

}); Pi.Namespace('Pi.Validator.Abstract', class pivalidator extends Pi.Class {

    constructor(label) {
        super();

        this.label = label;
        this.value = null;
        this.model = null;
        this.field = null;
    }

});

Pi.Namespace('Pi.Validator.Require', class pirequire extends Pi.Validator.Abstract {

    constructor(label) {
        super(label);
    }

    isValid() {
        let v = this.value,
            t = Pi.Type.typeof(v),
            b = true;

        if (t == "Boolean" && v === false) return false;
        if (t == 'String' && v.length == 0) b = false
        if (v == undefined) return false;
        if (v == false && v != 0) return false;
        else if (t == 'Array' && v.length == 0) b = false;
        else if (t == 'Object' && Pi.Object.isEmpty(v)) b = false;

        return b;
    }

});

Pi.Namespace('Pi.Validator.Callback', class picallback extends Pi.Validator.Abstract {

    constructor(label, callback) {
        super(label);

        this.cb = callback;
    }

    isValid() {
        return this.cb.call(this.model, this.value);
    }

}); Pi.Namespace('Pi.Model.Abstract', class pimodel extends Pi.Class {

    constructor(...args) {
        super(...args);
    }

    init(url) {
        this.actionList = [];
        this.validatorList = [];

        this.loadActions();
        this.loadValidations();

        this.configUrl(url || this.options.url);
    }

    initWithJson(json) {
        this.inject(json);

        return this;
    }

    configUrl(url) {
        if (url instanceof Pi.Url) {
            this.setBaseUrl(url.toString());
        } else if (Pi.getConfig('model.url') == undefined) {
            this.setBaseUrl(url);
        } else {
            this.setBaseUrl(Pi.getConfig('model.url') + url);
        }
    }

    setBaseUrl(url) {
        if (url == undefined) {
            this.baseUrl = Pi.Url.create('localhost').href();
        } else {
            this.baseUrl = url;
        }

        return this;
    }

    loadActions() {
        this.actions((actions) => {
            for (let name in actions) {
                this.addAction(name, actions[name]);
            }
        });
    }

    addAction(name, stmt) {
        let action = new Pi.Action({
            actionName: name,
            actionStmt: stmt,
            model: this
        });

        this.actionList[name] = action;

        return this;
    }

    willRequestGet(json) {

    }

    didRequestGet(json) {

    }

    willRequestPost(json) {

    }

    didRequestPost(json) {

    }

    willSuccessResponse(action, url, data) {
        if (action.isCache && Pi.getConfig('model.cacheResponse') == true) {
            Pi.Localdb.set(url, data);
        }

        this.successResponse.apply(this, arguments);
    }

    successResponse(action, url, ...args) {
        action.processSuccessResponse.apply(action, args);
        this.didSuccessResponse.apply(this, arguments);
    }

    didSuccessResponse() {

    }

    willErrorResponse(action, url, data) {
        if (action.isCache && Pi.getConfig('model.cacheResponse') == true) {
            var data = Pi.Localdb.get(url);
            if (data != undefined) {
                this.successResponse.apply(this, arguments);
                return;
            }
        }

        this.errorResponse.apply(this, arguments);
    }

    errorResponse(action, url, ...args) {
        action.processErrorResponse.apply(action, args);
        this.didErrorResponse.apply(this, arguments);
    }

    didErrorResponse() {

    }

    getAction(name) {
        return this.actionList[name];
    }

    loadValidations() {
        this.validators((validators) => {
            for (var v in validators) {
                this.addValidator(v, validators[v]);
            }
        });
    }

    addValidator(name, rule) {
        this.validatorList[name] = rule;

        return this;
    }

    validators(middle) {
        middle({})
    }

    actions(middle) {
        middle({
            'insert': 'POST:/insert',
            'update': 'POST:/update',
            'remove': 'GET:/remove?id=:id',
            'get': 'GET:/get?id=:id',
            'all': 'GET:/all'
        });
    }

    jsonDidConvert(json) {
        super.jsonDidConvert(json);

        delete json.baseUrl;
        delete json.actionList;
        delete json.validatorList;
    }

    setProperty(key, value) {
        let isComposed = key.split('.').length > 1,
            rule = this.validatorList[key];

        if (isComposed) {
            let names = key.split('.'),
                last = names[names.length - 1],
                lastOne = names[names.length - 2],
                property = Pi.Object.extractProperty(this, key);

            if (property instanceof Pi.Model.Abstract) {
                property.setProperty(last, value);
            } else {
                property[last] = value;
            }
        } else {
            if (rule == undefined) {
                this[key] = value;
            } else {
                rule.model = this;
                rule.field = key;
                rule.value = value;

                if (rule.isValid()) {
                    this[key] = value;
                } else {
                    throw rule.label;
                }
            }
        }

        return this;
    }

    save() {
        if (this.id == undefined) return this.insert()
        else if (this.id == 0) return this.insert();
        else return this.update();
    }
}); Pi.Namespace('Pi.View', class piview extends Pi.Class {

    constructor(html) {
        super();

        this.event = new Pi.Event();
        this.id = Pi.Util.UUID('xxxx-xxxx');
        this.element = null;
        this.html = html;
        this.raw = html;

        this.rendered = false;
    }

    compose(view) {
        this.html = Pi.Tpl.render(Pi.Object.extend({}, this, view), this.html, {}, ['${', '}']).trim();

        return this;
    }

    resize(w, h) {
        w = Pi.Convert.pixelToNumber(w);
        h = Pi.Convert.pixelToNumber(h);

        this.setWidth(w);
        this.setHeight(h);

        this.event.trigger('resize', w, h);

        return this;
    }

    setWidth(w) {
        w = Pi.Convert.pixelToNumber(w);
        this.element.css('width', w + 'px');
    }

    setHeight(h) {
        h = Pi.Convert.pixelToNumber(h);
        this.element.css('height', h + 'px');

        this.event.trigger('height', h);
    }

    get height() {
        return Pi.Convert.pixelToNumber(this.element.css('height'));
    }

    isRender() {
        return this.rendered;
    }

    render(obj = {}) {
        this.html = Pi.Tpl.render(obj, this.html).trim();

        return this;
    }

    injectId() {
        let i = this.html.indexOf('>');
        if (i == -1) {
            return;
        }

        this.html = Pi.String.insert(this.html, i, ' id="' + this.id + '"');
    }

    insert(parent, options) {
        if (parent == null) return false;

        this.injectId();

        if (options.insertType == 'first') {
            if (parent.childNodes.length > 0) {
                const element = document.createElement('div');
                element.innerHTML = this.html;
                element.firstChild.appendBefore(parent.childNodes[0]);
            } else {
                parent.html(this.html);
            }
        } else if (options.insertType == 'before') {
            const element = document.createElement('div');
            element.innerHTML = this.html;
            element.firstChild.appendBefore(parent);
        } else if (options.insertType == 'after') {
            const element = document.createElement('div');
            element.innerHTML = this.html;
            element.firstChild.appendAfter(parent);
        } else if (options.insertType == 'html') {
            parent.html(this.html);
        } else {
            parent.append(this.html);
        }

        this.element = document.getElementById(this.id);
        if (this.element == null) {
            return false;
        }

        this.loadAtElements();

        this.rendered = true;
        this.event.trigger('render', this);

        return true;
    }

    inject(model) {
        let names = this.getDataModels();

        this.model = model;

        for (let i = names.length - 1; i >= 0; i--) {
            let property = names[i],
                value = Pi.Object.extractValue(model, property);

            if (value) {
                let element = this.dataModel(property)
                if (element.firstChild && element.firstChild.control) {
                    element.firstChild.control.set(value);
                } else {
                    element.set(value);
                }
            }
        }

        return this;
    }

    reverse(model = null) {
        model = model || this.model;
        if (model == null) return;

        let names = this.getDataModels(),
            errors = [],
            isSuccess = true,
            promise = new Pi.Promise();


        for (let i = 0; i < names.length; i++) {
            let property = names[i],
                element = this.dataModel(property),
                value = undefined;

            if (element.firstChild && element.firstChild.control) {
                element = element.firstChild.control;
            }

            var nextElement = element.nextElementSibling;
            var elementMessage = null;
            if (nextElement && nextElement.getAttribute('validate-message') == 'true') {
                elementMessage = nextElement;
                elementMessage.html('');
            }

            element.validate(true);
            value = element.get();

            if (model instanceof Pi.Model.Abstract) {
                try {
                    model.setProperty(property, value);
                } catch (e) {
                    if (elementMessage) {
                        elementMessage.html(e);
                    }
                    element.validate(false);
                    isSuccess = false;
                    errors.push(e);
                }
            } else {
                model[property] = value;
            }
        }

        isSuccess ? promise.resolve.call(promise, model) : promise.reject.call(promise, errors, model);

        return promise;
    }

    loadAtElements() {
        let ats = this.getAts(),
            ids = this.getIds();

        for (var i = ats.length - 1; i >= 0; i--) {
            this[ats[i]] = this.at(ats[i]);
        }

        for (let i = ids.length - 1; i >= 0; i--) {
            this[ids[i]] = this.findById(ids[i]);
        }
    }

    getAtElements() {
        let elements = [],
            ats = this.getAts();

        for (let i = ats.length - 1; i >= 0; i--) {
            elements.push(this.at(ats[i]));
        }

        return elements;
    }

    getDataModels() {
        return Pi.String.clips(this.html, 'name="', '"');
    }

    getAts() {
        return Pi.String.clips(this.html, 'at="', '"');
    }

    getIds() {
        return Pi.String.clips(this.html, 'id="', '"');
    }

    findById(id) {
        return this.element.findElementById(id);
    }

    at(name) {
        return this.element.at(name);
    }

    dataModel(name) {
        return this.element.dataModel(name);
    }

    $() {
        var $ = this.element.query();
        return $.find.apply($, arguments);
    }

    destroy() {
        this.element.remove();
        this.event.clear();

        return this;
    }

}); Pi.Namespace('Pi.Component', class picomp extends Pi.Class {

    constructor(...args) {
        super(...args);

        this.event = new Pi.Event();
        this.eventListener = new Pi.EventListener(this);

        this.classDisable = 'disabled';

        this.setPrepare();
    }

    render(element, options) {
        this.viewWillRender();
        this.viewRender(this);
        this.viewDidRender();

        this.viewWillLoad();
        this.viewLoad(element, options || {});
        if (!this.view.isRender()) {
            return;
        }

        this.viewWillRenderControls();
        this.viewRenderControls();
        this.viewDidRenderControls();

        this.viewDidLoad();

        this.setWillLoad();
    }

    setPrepare() {
        var self = this;
        this.setMetaInfo = {
            method: this.set,
            parameters: [],
            invoked: false
        }

        this.set = function () {
            self.setMetaInfo.parameters = arguments;
            self.setMetaInfo.invoked = true;
        };
    }

    setLoad() {
        if (this.setMetaInfo == undefined) {
            return;
        }

        this.set = this.setMetaInfo.method;

        if (this.setMetaInfo.invoked) {
            this.set.apply(this, this.setMetaInfo.parameters);
        }

        delete this.setMetaInfo;

        this.setDidLoad();
    }

    setDidLoad() {

    }

    setWillLoad() {
        this.setLoad();
    }

    viewWillRender() {

    }

    viewRender(obj) {
        this.view.render(obj);
    }

    viewDidRender() {
        this.events((events) => {
            for (let stmt in events) {
                this.addEventListen(stmt, events[stmt])
            }
        });
    }

    addEventListen(stmt, callback) {
        this.eventListener.add(stmt, callback);

        return this;
    }

    viewWillLoad() {

    }

    viewLoad(element, options) {
        if (this.view.insert(element, options)) {
            this.view.element.control = this;
        }
    }

    viewDidLoad() {
        this.eventListener.listen();
    }

    viewWillRenderControls() {

    }

    viewRenderControls() {
        this.renderControls();
    }

    viewDidRenderControls() {

    }

    events(middle) {
        middle({});
    }

    destroy() {
        this.destroyControls();
        this.eventListener.unlisten();
        this.view.destroy();
        this.event.clear();

        Pi.EventListener.removeEventsGlobal();
    }

    set(value) {

    }

    get() {
        return null;
    }

    hide() {
        this.view.element.hide();

        return this;
    }

    show(inline = false) {
        if (inline) {
            this.view.element.css('display', 'inline-block');
        } else {
            this.view.element.show();
        }

        return this;
    }

    visibility(v) {
        v ? this.show() : this.hide();
    }

    isVisible() {
        return this.view.element.query().is(':visible');
    }

    validate(b) {
        this.view.element.validate(b);

        return this;
    }

    setEnable(b) {
        if (b) {
            this.view.element.removeClass(this.classDisable);
        } else {
            this.view.element.addClass(this.classDisable);
        }

        return this;
    }

    isEnabled() {
        return !this.view.element.existClass(this.classDisable);
    }

    isEqual(c) {
        return this.view.id == c.view.id;
    }

    destroyControls() {
        let ats = this.view.getAts();

        for (let i = ats.length - 1; i >= 0; i--) {
            let name = ats[i],
                p = this[name];

            if (p instanceof Pi.Component) {
                p.destroy();
            }
        }
    }

    renderControls() {
        let ats = this.view.getAts();

        for (let i = ats.length - 1; i >= 0; i--) {
            let name = ats[i],
                p = this[name];

            if (p instanceof Pi.Component) {
                p.render(this.view.at(name));
            }
        }
    }

}); Pi.Namespace('Pi.Services', class piapp extends Pi.Class {

    instances() {
        this.services = [];
        this.names = [];
    }

    load(services) {
        for (var i = services.length - 1; i >= 0; i--) {
            let name = services[i];
            this.services[name] = Service[name].create();
            this.names.push(name);
        }
    }

    start(services) {
        var services = services || this.names;

        for (var i = services.length - 1; i >= 0; i--) {
            this.services[services[i]].start();
        }

        Pi.History.reload(Pi.Url.create(window.location).path());
    }

    stop(services) {
        var services = services || this.services;

        for (var name in services) {
            services[name].stop();
        }
    }

    reload() {
        Pi.History.reload(Pi.Url.create(window.location).path());
    }
}); (function () {
    var params = {
        settings: {}
    };

    function loadLocalhost() {
        if (Pi.Navigator.isCordova()) {
            Pi.Url.add('localhost', 'file:///android_asset/www');
        } else {
            Pi.Url.add('localhost', Pi.Url.create(window.location.toString()).href());
        }
    }

    loadLocalhost();

    function loadModules() {
        let modules = params.settings.modules || {};

        for (let nome in modules) {
            let module = modules[nome];

            if (module.url == undefined) {
                Pi.Url.add(nome, module.base);
            } else if (module.base == undefined) {
                Pi.Url.add(nome, module.url);
            } else {
                Pi.Url.add(nome, module.base, module.url);
            }

            if (module.subdomains != undefined) {
                Pi.Subdomains.add(nome, module.subdomains);
            }
        }
    }

    Pi.config = function (settings) {
        params.settings = settings;

        loadModules();

        // yum config
        if (params.settings.yum) {
            if (params.settings.yum.cache) {
                yum.download.cache = params.settings.yum.cache;
            }

            if (params.settings.yum.sync) {
                yum.cache = params.settings.yum.sync;
            }

            if (params.settings.yum.version != undefined) {
                yum.setVersion(params.settings.yum.version);
            }
        }
    };

    Pi.addConfig = function (key, value) {
        params.settings[key] = value;
    }

    Pi.setConfig = function (settings, value = false) {
        if (value == false) return params.settings = Pi.Object.extend({}, params.settings, settings);
        else return params.settings = Pi.Object.extend({}, params.settings, { settings: value });
    };

    Pi.getConfig = function (config) {
        let p = (config || '').split('.'),
            settings = params.settings;

        for (let i in p) {
            settings = settings[p[i]];
            if (settings == undefined) return null;
        }

        return settings;
    };

    Pi.ready = function (callback) {

        if (window.jQuery) {
            $(function () {
                callback();
            });
        } else {
            if (/in/.test(document.readyState)) {
                setTimeout(() => {
                    Pi.ready(callback);
                }, 9);
            } else {
                callback();
            }
        }
    };
})(); Pi.Namespace('Pi.History', class pihistory extends Pi.Class {

    instances() {
        super.instances();

        this.event = new Pi.Event()
    }

    add(href, title) {
        if (href == null) return;

        try {
            if (Pi.getConfig('history.prefixHashtag') === true) {
                Pi.Url.Hash.to(`#${href}`);
            } else {
                history.pushState({
                    title: title,
                    href: href
                }, title, href);

                this.event.trigger('change', href);
            }
        } catch (e) { }
    }

    reload(href) {
        this.event.trigger('change', href);
    }

    listen() {
        var popstate = Pi.getConfig('history.popstate');
        if (popstate == undefined || popstate == false) return;

        $('html').on('click', 'a', (e) => {
            try {
                var baseUrl = Pi.Url.create('localhost').getUrl();
                var el = e.currentTarget;
                var ignore = el.getAttribute('data-history-ignore');

                if (ignore == 'true') return;
                if (el.href.indexOf(baseUrl) < 0) return;

                var title = el.getAttribute('data-title') || document.title || '';
                var href = el.href.replace(baseUrl, '');

                this.add('#' + href.split('#')[1], title);
            } catch (e) {
                console.log(e);
            }

            return e.preventDefault();
        });

        window.onpopstate = (event) => {
            this.event.trigger('change', Pi.Url.create(window.location).path());
        }
    }
});

Pi.History = new Pi.History();
Pi.History.listen();

Pi.Namespace('Pi.App', class piapp extends Pi.Component {

    constructor(...args) {
        super(...args);

        this.services = new Pi.Services();
    }

    static config(param) {
        Pi.config(param);
    }

    static getConfig(param) {
        return Pi.getConfig(param);
    }

    servicesWillDownload() {

    }

    servicesDidDownload() {

    }

    servicesWillLoad() {
        this.services.load(Pi.getConfig('services'));
        this.servicesDidLoad();
    }

    servicesDidLoad() {
        this.servicesWillStart();
    }

    servicesWillStart() {
        this.services.start();
        this.servicesDidStart();
    }

    servicesDidStart() {

    }

});/*! Copyright (C) 2015 - 2019 Manoel Neco. Todos Direitos Reservados */
Pi.ready(function () {
    console.log(';p');

    window.onerror = function (errorMsg, url, lineNumber) {
        if (Pi.getConfig('log.save') === true) {
            var request = new Pi.Request()
            request.get(Pi.String.format('/set-error-js?no={0}&description={1} {2}', url, errorMsg, lineNumber));
        }
    }

    let element = getElementScript();
    let body = document.querySelector('body');

    yum.setVersion(getVersion());

    yum.download([
        getAppCssUrl(),
        getConfigUrl(),
        getAppUrl()
    ], function () {
        var servicesUrl = [];
        var services = Pi.getConfig('services') || [];

        if (window.settings != null && Pi.Type.isObject(window.settings)) {
            Pi.setConfig(window.settings);
        }

        if (Pi.getConfig('yum.enable') === false) {
            yum.enable(false);
        }

        for (let i = services.length - 1; i >= 0; i--) {
            let name = services[services.length - i - 1];
            servicesUrl.push(Pi.Url.create(name, '/service.js'));
        }

        // if (window['App']) {
        //     window.app.servicesWillDownload();
        // }

        yum.download(servicesUrl, function () {
            if (window.appWillLaunch != undefined) window.appWillLaunch();

            if (window['App']) {
                // window.app.servicesDidDownload();

                var appElement = document.getElementById('app');
                if (appElement == null) {
                    appElement = document.querySelector('body');
                }

                window.app = new App({
                    view: new Pi.View(Pi.String.format('<div>{0}</div>', appElement.innerHTML))
                });

                window.app.version = getVersion();
                window.app.render(appElement, { insertType: 'html' });
                window.app.servicesWillLoad();

                if (window.app.didFinishLaunch != undefined) window.app.didFinishLaunch();
            }

            if (window.appDidLaunch != undefined) window.appDidLaunch();
        });
    });

    function getAppCssUrl() {
        return Pi.Url.create(Pi.Url.create(element.src).dirname(), '/app.css');
    }

    function getVersion() {
        return element.getAttribute('version') || '';
    }

    function getConfigUrl() {
        return convertToUrl(element.getAttribute('config') || '');
    }

    function getAppUrl() {
        return convertToUrl(element.getAttribute('app') || '');
    }

    function convertToUrl(url) {
        if (Pi.Navigator.isCordova()) {
            return Pi.Url.create(`file:///android_asset/www${url}`);
        }

        if (url != undefined && url[0] == '/') {
            let s = Pi.Url.create('localhost').scheme(),
                h = Pi.Url.create('localhost').host(),
                p = Pi.Url.create('localhost').port();

            if (p.length > 0) p = ':' + p
            return Pi.Url.create(Pi.String.format('{0}://{1}{2}/{3}', s, h, p, url.substr(1)));
        } else {
            return Pi.Url.create('localhost', url);
        }
    }

    function getElementScript() {
        let scripts = document.getElementsByTagName('script');

        for (let i in scripts) {
            let src = scripts[i].src;

            if (src == undefined) {
                continue;
            }

            if ((src.indexOf('pillar.js') != -1) || (src.indexOf('develop.js') != -1)) {
                return scripts[i];
            }
        }
    }
});