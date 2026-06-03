import { Book } from "./book";
import { Thought } from "./thought";
import { Event } from "./event";

export type Run = {
    bookId: Book['id']; // pour pouvoir récupérer les données du livre
    chapterId: Book['chapters'][number]['id']; // pour pouvoir récupérer les données du chapitre
    intent?: Book["chapters"][number]["intents"][number]; // pour savoir quelle intention a été choisie
    cycle: number; // 1 cycle = draw setup + intent + thought choice + thought effect + intent effect + check victory/defeat
    queue: Event[];
    stability: number; // niveau de stabilité actuel
    draw: Thought['id'][]; // id des pensées en pioche
    hand: Thought['id'][]; // id des pensées en main
    discard: Thought['id'][]; // id des pensées défaussées
};