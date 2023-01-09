export function tryMutilTimes(callback: (...args: any[]) => void, tickInterval: number, timeoute: number) {
    const timerId = setInterval(callback, tickInterval);
    setTimeout(() => {
        clearInterval(timerId);
    }, timeoute);
    return () => clearInterval(timerId);
}