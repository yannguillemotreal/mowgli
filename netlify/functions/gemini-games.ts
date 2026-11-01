import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { missingTasksSummary } = JSON.parse(event.body || '{}');

    // Initialisation de Gemini avec la clé secrète du serveur Netlify
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      Tu es un chef scout du mouvement des Scouts d'Europe, expert et créatif dans la méthode de la Jungle (Mowgli / Louveteaux, 8-12 ans).
      Voici les 6 points de progression prioritaires qui manquent à ma meute selon le Mowgli :
      ${missingTasksSummary}

      Génère exactement 6 jeux scouts originaux, ludiques et rapides (5 minutes maximum par jeu), 
      adaptés pour faire progresser les enfants sur ces points précis lors d'une sortie.
      
      Réponds STRICTEMENT sous un format JSON valide (un tableau d'objets) sans texte autour, avec cette structure exacte :
      [
        {
          "pointName": "Nom de l'épreuve ciblée",
          "gameTitle": "Nom original du jeu scout",
          "description": "Règle du jeu simple et rapide en 2 phrases max."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text || '[]';
    // Nettoyage au cas où Gemini rajoute des balises markdown ```json ... ```
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: textResponse,
    };
  } catch (error) {
    console.error("Erreur Netlify Function Gemini:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur lors de la génération des jeux par l'IA." }) };
  }
};

export { handler };