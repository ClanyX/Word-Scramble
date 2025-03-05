import { json } from "@sveltejs/kit";
import { generate } from 'random-words';

export async function GET(){
    const word = await generate();

    const def = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const defdata = await def.json();

    const definition = defdata[0]?.meanings[0]?.definitions || "Don't know what it means...";


    return json({word, definition});
}