import asyncHooks from 'async_hooks';
// import fs from 'fs';

const contexts: any = {};
// const log = str => fs.writeSync(1, `${str}\n`);

asyncHooks.createHook({
  init: (asyncId, type, triggerAsyncId) => {
    // A new resource was created
    // If our parent asyncId already had a context object
    // We assign it to our resource asyncId
    if (contexts[triggerAsyncId]) {
      contexts[asyncId] = contexts[triggerAsyncId];
    }
  },
  destroy: asyncId => {
    // Some cleaning to prevent memory leaks
    delete contexts[asyncId];
  }
}).enable();

function getContext(): any {
  const asyncId = asyncHooks.executionAsyncId();
  // We try to get the context object linked to our current asyncId
  // If there is none, we return an empty object
  return contexts[asyncId] || {};
}

export { contexts, getContext };
