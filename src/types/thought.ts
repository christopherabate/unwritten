export type Thought = {
    id: string;
    name: string;
    narration: string;

    effect:
    | { type: "stability"; value: number }
    | { type: "draw"; value: number }
    | { type: "shuffle" }
    | { type: "reveal_intent" };

    rarity: "starter" | "common" | "rare" | "epic" | "legendary"; // gris, vert, bleu, violet, orange
};