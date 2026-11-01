import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Clé API manquante sur le serveur." }) };
    }

    // Un prompt ultra-court et simple pour tester la réponse immédiate
    const simplePrompt = "Réponds uniquement en JSON valide sous cette forme : [{\"pointName\": \"Test\", \"gameTitle\": \"Jeu Test\", \"description\": \"Fonctionne parfaitement.\"}]";

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: simplePrompt }] }]
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("Erreur API Gemini:", errText);
      return { statusCode: 500, body: JSON.stringify({ error: "Erreur de l'API Gemini : " + errText }) };
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