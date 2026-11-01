import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { missingTasksSummary } = JSON.parse(event.body || '{}');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY est manquante dans les variables Netlify.");
      return { statusCode: 500, body: JSON.stringify({ error: "Clé API manquante sur le serveur." }) };
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Tu es un chef scout expert et créatif dans la méthode de la Jungle (Mowgli / Louveteaux).
      Voici les 6 points de progression prioritaires qui manquent à ma meute :
      ${missingTasksSummary}

      Génère exactement 6 jeux scouts originaux, ludiques et rapides (5 minutes maximum par jeu), 
      adaptés pour faire progresser les enfants sur ces points précis lors d'une sortie.
      
      Réponds STRICTEMENT sous un format JSON valide (un tableau d'objets) sans texte markdown autour, avec cette structure exacte :
      [
        {
          "pointName": "Nom de l'épreuve ciblée",
          "gameTitle": "Nom original du jeu scout",
          "description": "Règle du jeu simple et rapide en 2 phrases max."
        }
      ]
    `;

    // Utilisation de gemini-2.0-flash pour éviter l'erreur 404
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let textResponse = response.text || '[]';
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: textResponse,
    };
  } catch (error: any) {
    console.error("Erreur détaillée Netlify Function Gemini:", error?.message || error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error?.message || "Erreur interne" }) 
    };
  }
};

export { handler };