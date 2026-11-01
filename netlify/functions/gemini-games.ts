import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { missingTasksSummary } = JSON.parse(event.body || '{}');

    // Initialisation du SDK avec la clé d'environnement Netlify
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Tu es un chef scout expert et créatif dans la méthode de la Jungle (Mowgli / Louveteaux).
      Voici les 6 points de progression prioritaires qui manquent à ma meute :
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

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text() || '[]';

    // Nettoyage au cas où Gemini ajoute des blocs markdown
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: textResponse,
    };
  } catch (error) {
    console.error("Erreur Netlify Function Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur lors de la génération des jeux par l'IA." }),
    };
  }
};

export { handler };