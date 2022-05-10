'use strict'

export async function loadJSON(url) {
    let res = await fetch(url)
    return res.json()
}

export function objectFilter(obj, predicate) {
    return Object.keys(obj)
        .filter(key => predicate(key))
        .reduce((res, key) => (res[key] = obj[key], res), {})
}

function findId(fencers, entry, i) {
    for (let f in fencers) {
        if (fencers[f].surname == entry[0]) {
            return f;
        }
    }
    return entry
}