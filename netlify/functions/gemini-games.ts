import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { missingTasksSummary } = JSON.parse(event.body || '{}');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Clé API manquante sur le serveur." }) };
    }

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

// Appel direct avec le modèle de dernière génération supporté sur v1beta
const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("Erreur API Gemini:", errText);
      return { statusCode: 500, body: JSON.stringify({ error: "Erreur de communication avec l'API Gemini" }) };
    }

    const data = await apiResponse.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Nettoyage des balises Markdown
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: textResponse,
    };
  } catch (error: any) {
    console.error("Erreur Netlify Function:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error?.message || "Erreur interne" }) };
  }
};

export { handler };