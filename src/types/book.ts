import { Thought } from "./thought";

export type Book = {
    id: string;
    title: string;
    author: string;

    chapters: {
        id: string;
        titre: string;
        introduction: string;

        intents: {
            name: string;
            narration: string;

            effect:
            | { type: "stability"; value: number }
            | { type: "shuffle" }
            | { type: "cancel" }
            | { type: "deny" }
            | { type: "lock" }
            | { type: "hide_intent" };

            weight: number;
        }[];

        reward:
        | { type: "stability"; value: number }
        | { type: "unlock"; thoughtId: Thought['id']; rarity: Thought['rarity'] }
        | { type: "archive"; narration: string };
    }[];

    choices: {
        id: string;
        name: string;
        hidden: boolean;

        reward:
        | { type: "stability"; value: number }
        | { type: "unlock"; thoughtId: Thought['id']; rarity: Thought['rarity'] }
        | { type: "archive"; narration: string };

        weight: number;
    }[];
};