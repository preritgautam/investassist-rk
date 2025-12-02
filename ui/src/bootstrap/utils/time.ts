export function runAfter(handler: Function, ms: number = 0, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const ret = handler(...args);
        // If handler is async, ret will be a promise and we resolve with promise which may resolve or reject
        // If handler is sync, we either resolve it with return value or reject with an error.
        resolve(ret);
      } catch (e) {
        reject(e);
      }
    }, ms);
  });
}
