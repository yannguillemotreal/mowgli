const [aiGames, setAiGames] = useState<any[]>([]);
const [isLoadingAi, setIsLoadingAi] = useState(false);

const fetchAiGamesFromNetlify = async () => {
  setIsLoadingAi(true);
  try {
    // On extrait les 6 épreuves prioritaires calculées par l'algo
    const summary = aiData.selectedTasks.map(t => `- ${t.step}: ${t.name}`).join('\n');

    const res = await fetch('/.netlify/functions/gemini-games', {
      method: 'POST',
      body: JSON.stringify({ missingTasksSummary: summary }),
    });

    const data = await res.json();
    if (Array.isArray(data)) {
      setAiGames(data);
    }
  } catch (e) {
    console.error("Erreur d'appel à la fonction:", e);
    alert("Impossible de joindre l'assistant IA pour le moment.");
  } finally {
    setIsLoadingAi(false);
  }
};