export function shuffle<T>(items: T[]) {
    if (items.length === 0) return [];

    const shuffled = [...items];

    for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

        [shuffled[currentIndex], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
}

export const pick = <T extends { weight: number }>(items: T[]) => {
    if (items.length === 0) {
        throw new Error("pick: cannot pick from an empty array");
    }

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight <= 0) {
        throw new Error("pick: total weight must be > 0");
    }

    let cursor = Math.random() * totalWeight;

    for (const item of items) {
        cursor -= item.weight;

        if (cursor < 0) {
            return item;
        }
    }

    throw new Error("pick: unexpected fallback (check weights integrity)");
};