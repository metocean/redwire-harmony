// Generated by CoffeeScript 1.8.0
var Harmony, Redwire, copy, dirdiff, require_raw, series,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

dirdiff = require('./dirdiff');

require_raw = require('./require_raw');

Redwire = require('redwire');

series = require('./series');

copy = function(source, target) {
  var key, value, _results;
  _results = [];
  for (key in source) {
    value = source[key];
    if (typeof value === 'object') {
      if ((target[key] == null) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      _results.push(copy(value, target[key]));
    } else {
      _results.push(target[key] = value);
    }
  }
  return _results;
};

module.exports = Harmony = (function() {
  function Harmony(options) {
    this.close = __bind(this.close, this);
    this.unload = __bind(this.unload, this);
    this.transfer = __bind(this.transfer, this);
    this.load = __bind(this.load, this);
    this.bind = __bind(this.bind, this);
    this.create = __bind(this.create, this);
    this.update = __bind(this.update, this);
    this.tick = __bind(this.tick, this);
    this.error = __bind(this.error, this);
    var noop;
    this._options = {
      configdir: process.cwd(),
      refresh: false
    };
    copy(options, this._options);
    this.config = {};
    this.redwires = {};
    this.tick();
    noop = function() {};
    this._interval = this._options.refresh ? setInterval(this.tick, this._options.refresh) : setInterval(noop, 60000);
  }

  Harmony.prototype.error = function(error) {
    if (error.stack != null) {
      return console.error(error.stack);
    } else {
      return console.error(error);
    }
  };

  Harmony.prototype.tick = function() {
    return dirdiff(this._options.configdir, this.config, this.update);
  };

  Harmony.prototype.update = function(added, removed, modified, unchanged) {
    var key, value, _results;
    for (key in removed) {
      value = removed[key];
      delete this.config[key];
      this.unload(key);
    }
    for (key in modified) {
      value = modified[key];
      this.config[key] = value;
      this.transfer(key);
    }
    _results = [];
    for (key in added) {
      value = added[key];
      this.config[key] = value;
      _results.push(this.load(key));
    }
    return _results;
  };

  Harmony.prototype.create = function(key) {
    var item, redwire;
    console.log("Creating " + key + "...");
    item = this.redwires[key].item;
    if (item.config.log == null) {
      item.config.log = {};
    }
    item.config.log.notice = function(message) {
      return console.log(message);
    };
    redwire = new Redwire(item.config);
    this.redwires[key].redwire = redwire;
    return this.bind(key);
  };

  Harmony.prototype.bind = function(key) {
    var bindings, item, redwire, _ref;
    console.log("Binding " + key + "...");
    _ref = this.redwires[key], item = _ref.item, redwire = _ref.redwire;
    bindings = redwire.createNewBindings();
    item.bind(redwire, bindings);
    return redwire.setBindings(bindings);
  };

  Harmony.prototype.load = function(key) {
    var e, item;
    console.log("Loading " + key + "...");
    try {
      item = require_raw("" + this._options.configdir + "/" + key);
      this.redwires[key] = {
        item: item
      };
      return this.create(key);
    } catch (_error) {
      e = _error;
      delete this.config[key];
      return this.error(e);
    }
  };

  Harmony.prototype.transfer = function(key) {
    var e, item;
    try {
      item = require_raw("" + this._options.configdir + "/" + key);
    } catch (_error) {
      e = _error;
      return this.error(e);
    }
    if (JSON.stringify(this.redwires[key].item.config) !== JSON.stringify(item.config)) {
      console.log("Reloading " + key + "...");
      this.unload(key);
      this.redwires[key] = {
        item: item
      };
      this.create(key);
      return;
    }
    console.log("Migrating " + key + "...");
    if (this.redwires[key].item.end != null) {
      this.redwires[key].item.end();
    }
    this.redwires[key].item = item;
    return this.bind(key);
  };

  Harmony.prototype.unload = function(key) {
    var item, redwire, _ref;
    console.log("Unloading " + key + "...");
    _ref = this.redwires[key], item = _ref.item, redwire = _ref.redwire;
    if (item.end != null) {
      item.end();
    }
    redwire.close();
    return delete this.redwires[key];
  };

  Harmony.prototype.close = function() {
    var item, _, _ref, _results;
    clearInterval(this._interval);
    _ref = this.redwires;
    _results = [];
    for (_ in _ref) {
      item = _ref[_];
      if (item.item.end != null) {
        item.item.end();
      }
      _results.push(item.redwire.close());
    }
    return _results;
  };

  return Harmony;

})();