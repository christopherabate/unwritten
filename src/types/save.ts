import { Book } from "./book";
import { Thought } from "./thought";

export type Save = {
    id: string;
    runs: number; // nombre de runs effectués
    state: "idle" | "setup" | "run" | "choice";
    thoughts: Record<Thought['id'], boolean> // pour savoir quels pensées ont été débloquées
    books: Record<Book['id'], boolean> // pour savoir quels livres ont été lus
    chapters: Record<Book['chapters'][number]['id'], boolean> // pour savoir quels chapitres ont été lus
    choices: Record<Book["choices"][number]["id"], boolean> // pour savoir quelles options ont été choisies
};