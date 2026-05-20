export default async function processWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    handler: (item: T, index: number) => Promise<R>,
    onProgress: (completed: number) => void,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let currentIndex = 0;
    let completed = 0;

    async function worker() {
        while (currentIndex < items.length) {
            const i = currentIndex++;
            results[i] = await handler(items[i], i);
            completed++;
            onProgress(completed);
        }
    }

    const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        () => worker(),
    );
    await Promise.all(workers);
    return results;
}