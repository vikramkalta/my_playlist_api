const safePromise = promise => promise.then(res => [null, res]).catch(err => [err]);
export { safePromise };