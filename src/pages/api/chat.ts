import type { APIRoute } from "astro";
import OpenAI from "openai";

export const prerender = false;

const client = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Ets l'assistent virtual de la consulta de fisioteràpia d'en Pau Muñoz (PMF) a Mataró.
Respon sempre en català, de forma propera i concisa. Si l'usuari parla en castellà, respon en castellà.

INFORMACIÓ DE LA CONSULTA:
- Nom: Pau Muñoz Fisioteràpia (PMF)
- Fisioterapeuta: en Pau Muñoz (home)
- Adreça: Camí de la Geganta, 93, 08302 Mataró
- Telèfon: 600 07 36 29
- Instagram: @paumfisioterapia
- Aparcament: Paurking a 50 metres

HORARI:
- Dilluns a Divendres: 15:45 – 21:45
- Dissabte: 09:00 – 14:00
- Diumenge: Tancat

SERVEIS:
1. Fisioteràpia Integral i Esportiva – lesions musculoesquelètiques agudes i cròniques
2. Fisio Neurogeriàtrica – atenció a persones grans amb patologies neurològiques
3. Prevenció de Lesions – avaluació i treball preventiu per a esportistes
4. Pressoteràpia – drenatge i millora de la circulació
5. Posturologia – anàlisi i correcció de desequilibris posturals
6. Atenció a Domicili – per a qui no pot desplaçar-se

ESPECIALITAT: Treballa amb esportistes d'elit professionals.

NORMES:
- No confirmis cites (el Pau les confirma directament per telèfon)
- Per demanar cita, deriva sempre a trucar al 600 07 36 29 o omplir el formulari de contacte
- No inventis preus (en Pau els dona personalment)
- Sigues breu i directe, màxim 3 frases per resposta`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missatge invàlid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const text =
      response.choices[0]?.message?.content ||
      "Ho sento, hi ha hagut un error. Truca'ns si us plau.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Error intern" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
