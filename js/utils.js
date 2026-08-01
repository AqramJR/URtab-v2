// Firefox Polyfill for storage
if (typeof globalThis.chrome === 'undefined' || !globalThis.chrome.storage) {
    globalThis.chrome = {
        storage: {
            local: {
                get: (k, cb) => {
                    const keys = typeof k === 'string' ? [k] : Array.isArray(k) ? k : Object.keys(k);
                    Promise.all(keys.map(key => browser.storage.local.get(key).then(r => r))).then(results => {
                        const merged = Object.assign({}, ...results);
                        if (cb) cb(merged);
                    });
                },
                set: (obj, cb) => browser.storage.local.set(obj).then(() => { if (cb) cb(); }),
                remove: (k, cb) => browser.storage.local.remove(k).then(() => { if (cb) cb(); }),
                clear: (cb) => browser.storage.local.clear().then(() => { if (cb) cb(); }),
            }
        }
    };
}

export function $(id) {
    return document.getElementById(id);
}

export function safeHTML(el, html) {
    const doc = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html');
    el.replaceChildren(...Array.from(doc.body.childNodes));
}

export function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

export function storageGet(k) {
    return new Promise(r => chrome.storage.local.get(k, res => r(res[k] ?? null)));
}

export function storageSet(k, v) {
    return new Promise(r => chrome.storage.local.set({ [k]: v }, r));
}

let _idb = null;
export function idbOpen() {
    if (_idb) return Promise.resolve(_idb);
    return new Promise((res, rej) => {
        const req = indexedDB.open('urtab_blobs', 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('blobs');
        req.onsuccess = e => { _idb = e.target.result; res(_idb); };
        req.onerror = rej;
    });
}

export function idbSet(key, value) {
    return idbOpen().then(db => new Promise((res, rej) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').put(value, key);
        tx.oncomplete = res;
        tx.onerror = rej;
    }));
}

export function idbGet(key) {
    return idbOpen().then(db => new Promise((res, rej) => {
        const tx = db.transaction('blobs', 'readonly');
        const req = tx.objectStore('blobs').get(key);
        req.onsuccess = e => res(e.target.result ?? null);
        req.onerror = rej;
    }));
}

export function idbDel(key) {
    return idbOpen().then(db => new Promise((res, rej) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').delete(key);
        tx.oncomplete = res;
        tx.onerror = rej;
    }));
}

export function idbClear() {
    return idbOpen().then(db => new Promise((res, rej) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').clear();
        tx.oncomplete = res;
        tx.onerror = rej;
    }));
}