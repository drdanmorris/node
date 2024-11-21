export function getTimestampFrom(report) {
    const ts = report.t
    if (ts) {
        const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/.exec(ts)
        if (m) {
            const dt = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}:${m[6].padStart(2, '0')}.000Z`
            return Date.parse(dt)
        }
    }
}

export function getTimestampDeltaFor(report, refTs) {
    const ts = getTimestampFrom(report)
    const delta = ts - refTs
    return delta === 0 ? 0 : delta/1000
}


