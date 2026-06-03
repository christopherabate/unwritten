import { Thought } from "./thought";

export type Event =
    | { type: "DRAW"; count: number }
    | { type: "SELECT_INTENT" }
    | { type: "PLAY_THOUGHT"; id: Thought['id'] }
    | { type: "PLAY_INTENT" }
    | { type: "CHECK_STABILITY" };