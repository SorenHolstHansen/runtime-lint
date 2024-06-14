module.exports = function objectStats(inner) {
  if (typeof inner !== "object") return inner;
  const counter = {};

  for (const key of Object.keys(inner)) {
    inner[key] = objectStats(inner[key])
  }

  const stats = () => {
    const stats = {};
    for (const key of Object.keys(counter)) {
      stats[key] = { count: counter[key] };
    }
    for (const key of Object.keys(inner)) {
      const s = inner[key].__stats;
      if (stats[key]) {
        stats[key].inner = s
      } else {
        stats[key] = {
          inner: s
        };
      }
    }
    return stats;
  }

  const handler = {
    get(target, prop, receiver) {
      if (prop === "__stats") {
        return stats()
      }
      counter[prop] = (counter[prop] ?? 0) + 1;
      return Reflect.get(...arguments);
    },
    set(target, prop, value) {
      counter[prop] = (counter[prop] ?? 0) + 1;
      return Reflect.set(...arguments);

    }
  };

  const proxy = new Proxy(inner, handler);

  return proxy
}


