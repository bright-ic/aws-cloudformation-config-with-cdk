import updateNoteById from "./updateNote";
import addNote from "./createNote";
import getNotes from "./listNotes";
import getNote from "./getNoteById";

type Note = {
    id: string;
    email: string;
    name: string;
    completed: boolean;
}

type AppSyncEvent = {
    info: {
      fieldName: string
   },
    arguments: {
      id: string,
      note: Note,
      limit: number
   }
}

exports.handler = async (event:AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "getNote":
            return await getNote(event.arguments.id);
        case "addNote":
            return await addNote(event.arguments.note);
        case "updateNoteById":
            return await updateNoteById(event.arguments.note);
        case "getNotes":
            return await getNotes(event.arguments.limit);
        default:
            return "Handler Function not found";
    }
}