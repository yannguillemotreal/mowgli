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
      Tu es un chef scout expert du mouvement des Scouts d'Europe et créatif dans la méthode de la Jungle (Mowgli). Tu es Akela d'une meute de louveateaux de 8 à 12 ans.
      Voici les 6 points de progression prioritaires qui manquent à ma meute et qu'il faut absolument faire valider :
      ${missingTasksSummary}

      Conçois UN SEUL grand jeu immersif de type "Jungle" d'environ 20 minutes. 
      Ce jeu doit permettre aux louveteaux de valider simultanément ces 6 points précis au cours de son déroulement.

      Réponds STRICTEMENT sous un format JSON valide (un objet unique, pas un tableau) sans texte markdown autour, avec cette structure exacte :
      {
        "gameTitle": "Nom original et immersif du grand jeu",
        "duration": "20 minutes",
        "overview": "Résumé de l'histoire et du pitch du jeu en 2 phrases.",
        "rules": "Règles détaillées du jeu pas à pas (comment on y joue, rôles, déroulement).",
        "objectiveMappings": [
          {
            "pointName": "Nom exact du 1er point manquant",
            "validationMechanic": "Explique précisément quelle action dans le jeu permet de valider ce point."
          },
          {
            "pointName": "Nom exact du 2ème point manquant",
            "validationMechanic": "Explique précisément quelle action dans le jeu permet de valider ce point."
          },
          {
            "pointName": "Nom exact du 3ème point manquant",
            "validationMechanic": "Explique précisément quelle action dans le jeu permet de valider ce point."
          },
          {
            "pointName": "Nom exact du 4ème point manquant",
            "validationMechanic": "Explique précisément quelle action dans le jeu permet de valider ce point."
          },
          {
            "pointName": "Nom exact du 5ème point manquant",
            "validationMechanic": "Explique précisément quelle action dans leజి jeu permet de valider ce point."
          },
          {
            "pointName": "Nom exact du 6ème point manquant",
            "validationMechanic": "Explique précisément quelle action dans le jeu permet de valider ce point."
          }
        ]
      }
    `;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
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
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
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