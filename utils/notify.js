export async function notifyCurrentPage({name, value}) {
    const currentPages = getCurrentPages(), length = currentPages.length;
    if (currentPages && length) {
        const page = currentPages[length - 1], {observers} = page;
        if (observers) {
            const observer = observers[name];
            if (typeof observer === "function") {
                const currentResult = await observer.call(page, value);
            }
        }
    }
}

export function notifyAllPage({name, value}) {
    const currentPages = getCurrentPages(), length = currentPages.length;
    if (currentPages && length) {
        for (let page of currentPages.reverse()) {
            const {observers} = page;
            if (observers) {
                const observer = observers[name];
                if (typeof observer === "function") {
                    observer.call(page, value);
                }
            }
        }
    }
}
