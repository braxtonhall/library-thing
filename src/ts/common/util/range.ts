const range = (low: number, until: number): number[] => [...Array(until - low).keys()].map((i) => i + low);

export {range};
