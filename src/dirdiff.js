// Generated by CoffeeScript 1.8.0
var fs;

fs = require('fs');

module.exports = function(dir, current, callback) {
  var a, d, e, item, items, key, m, path, pool, stat, u, value, _i, _len;
  a = {};
  d = {};
  m = {};
  u = {};
  pool = {};
  for (key in current) {
    value = current[key];
    pool[key] = value;
  }
  try {
    items = fs.readdirSync(dir);
  } catch (_error) {
    e = _error;
    console.error("Could not open directory " + dir);
    return callback(a, d, m, pool);
  }
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    item = items[_i];
    if (!item.match(/\.js$/)) {
      continue;
    }
    path = "" + dir + "/" + item;
    stat = fs.statSync(path);
    if (pool[item] != null) {
      if (pool[item].changed < stat.mtime.getTime()) {
        m[item] = {
          path: path,
          changed: stat.mtime.getTime()
        };
      } else {
        u[item] = {
          path: path,
          changed: stat.mtime.getTime()
        };
      }
      delete pool[item];
    } else {
      a[item] = {
        path: path,
        changed: stat.mtime.getTime()
      };
    }
  }
  for (key in pool) {
    value = pool[key];
    d[key] = value;
  }
  return callback(a, d, m, u);
};