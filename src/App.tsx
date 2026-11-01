import React, { useState, useEffect } from 'react';

// --- TYPES ---
interface Task {
  id: string;
  name: string;
  category: string;
}

interface ValidationInfo {
  date: string;
  chef: string;
}

interface Cub {
  id: string;
  name: string;
  sizain: string;
  progress: Record<string, boolean>;
  validations: Record<string, ValidationInfo>;
}

const DEFAULT_TASKS: Task[] = [
  // Promesse
  { id: 'p1', name: 'Connaître la Loi de la Meute', category: 'Promesse' },
  { id: 'p2', name: 'Connaître le Mowgli / Histoire', category: 'Promesse' },
  { id: 'p3', name: 'Savoir faire un nœud plat', category: 'Promesse' },
  // 1ère Étoile
  { id: 'e1_1', name: 'Grand Howl & Salut', category: '1ère Étoile' },
  { id: 'e1_2', name: 'Observer 4 nœuds de raccord', category: '1ère Étoile' },
  { id: 'e1_3', name: 'Premiers secours de base', category: '1ère Étoile' },
  // 2ème Étoile
  { id: 'e2_1', name: 'Orientation boussole / carte', category: '2ème Étoile' },
  { id: 'e2_2', name: 'Connaissance de la nature', category: '2ème Étoile' },
  { id: 'e2_3', name: 'Service rendu à la sizaine', category: '2ème Étoile' },
];

const SIZAINES = ['Blancs', 'Gris', 'Noirs'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'cubs' | 'matrix' | 'config'>('cubs');
  const [packCode, setPackCode] = useState<string>('MEUTE-DEFAUT');
  const [currentChef, setCurrentChef] = useState<string>('Akela');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [cubs, setCubs] = useState<Cub[]>([
    { 
      id: '1', 
      name: 'Augustin', 
      sizain: 'Blancs', 
      progress: { p1: true }, 
      validations: { p1: { date: '12/10', chef: 'Akela' } } 
    },
    { 
      id: '2', 
      name: 'Mayeul', 
      sizain: 'Gris', 
      progress: {}, 
      validations: {} 
    },
    { 
      id: '3', 
      name: 'Thibault', 
      sizain: 'Noirs', 
      progress: { p1: true, p2: true }, 
      validations: { p1: { date: '05/10', chef: 'Baloo' }, p2: { date: '12/10', chef: 'Akela' } } 
    },
  ]);

  const [tasks] = useState<Task[]>(DEFAULT_TASKS);
  const [selectedCubId, setSelectedCubId] = useState<string | null>(null);
  
  const [newCubName, setNewCubName] = useState('');
  const [newCubSizain, setNewCubSizain] = useState('Blancs');
  const [filterSizain, setFilterSizain] = useState('Tous');

  // Chargement des données et écouteur de synchronisation automatique entre téléphones
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem(`meute_${packCode}`);
      if (savedData) {
        try { 
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) setCubs(parsed);
        } catch (e) { 
          console.error(e); 
        }
      }
    };

    loadData();

    // Vérification automatique toutes les 2 secondes pour synchroniser les autres téléphones
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [packCode]);

  const saveToStorage = (updatedCubs: Cub[]) => {
    setCubs(updatedCubs);
    localStorage.setItem(`meute_${packCode}`, JSON.stringify(updatedCubs));
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const toggleTask = (cubId: string, taskId: string) => {
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const updated = cubs.map(cub => {
      if (cub.id === cubId) {
        const progress = cub.progress || {};
        const validations = cub.validations || {};
        const currentStatus = !!progress[taskId];
        
        const newProgress = { ...progress, [taskId]: !currentStatus };
        const newValidations = { ...validations };
        
        if (!currentStatus) {
          newValidations[taskId] = { date: today, chef: currentChef };
        } else {
          delete newValidations[taskId];
        }
        return { ...cub, progress: newProgress, validations: newValidations };
      }
      return cub;
    });
    saveToStorage(updated);
  };

  const addCub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCubName.trim()) return;
    const newCub: Cub = {
      id: Date.now().toString(),
      name: newCubName,
      sizain: newCubSizain,
      progress: {},
      validations: {}
    };
    saveToStorage([...cubs, newCub]);
    setNewCubName('');
  };

  const deleteCub = (id: string) => {
    if (confirm("Supprimer ce louveteau ?")) {
      saveToStorage(cubs.filter(c => c.id !== id));
      if (selectedCubId === id) setSelectedCubId(null);
    }
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)));
  const selectedCub = cubs.find(c => c.id === selectedCubId);
  const filteredCubs = filterSizain === 'Tous' ? cubs : cubs.filter(c => c.sizain === filterSizain);

  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' },
    header: { background: '#065f46', borderBottom: '1px solid #047857', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 30 },
    main: { maxWidth: '480px', margin: '0 auto', padding: '16px' },
    card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '16px', marginBottom: '12px' },
    button: { background: '#f59e0b', color: '#0f172a', border: 'none', fontWeight: 'bold', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' },
    input: { background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '10px', width: '100%', boxSizing: 'border-box' as const, fontSize: '14px' },
    nav: { background: '#1e293b', borderTop: '1px solid #334155', position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0', zIndex: 30, maxWidth: '480px', margin: '0 auto' }
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>⚜️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Carnet Mowgli {isSyncing && '🔄'}
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#a7f3d0' }}>Signé par : <b>{currentChef}</b></p>
          </div>
        </div>
        <button 
          onClick={() => { setActiveTab('config'); setSelectedCubId(null); }}
          style={{ background: '#047857', color: '#fde047', border: '1px solid #059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔗 {packCode}
        </button>
      </header>

      {/* CONTENU */}
      <main style={styles.main}>
        
        {/* VUE LOUVETEAUX (LISTE) */}
        {activeTab === 'cubs' && !selectedCub && (
          <div>
            {/* Filtres sizaines */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px' }}>
              <button 
                onClick={() => setFilterSizain('Tous')}
                style={{ ...styles.button, background: filterSizain === 'Tous' ? '#f59e0b' : '#334155', color: filterSizain === 'Tous' ? '#0f172a' : '#cbd5e1', fontSize: '12px', padding: '6px 12px' }}
              >
                Tous ({cubs.length})
              </button>
              {SIZAINES.map(s => (
                <button 
                  key={s}
                  onClick={() => setFilterSizain(s)}
                  style={{ ...styles.button, background: filterSizain === s ? '#f59e0b' : '#334155', color: filterSizain === s ? '#0f172a' : '#cbd5e1', fontSize: '12px', padding: '6px 12px' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Liste louveteaux */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredCubs.map(cub => {
                const progress = cub.progress || {};
                const validated = Object.values(progress).filter(Boolean).length;
                const percent = Math.round((validated / tasks.length) * 100);
                return (
                  <div 
                    key={cub.id}
                    onClick={() => setSelectedCubId(cub.id)}
                    style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', margin: 0, marginBottom: '8px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', background: '#065f46', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fde047' }}>
                        {cub.name ? cub.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>{cub.name}</span>
                          <span style={{ fontSize: '10px', background: '#334155', padding: '2px 6px', borderRadius: '6px', color: '#cbd5e1' }}>Sizaine {cub.sizain}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fde047' }}>{validated}/{tasks.length}</span>
                      <div style={{ width: '50px', height: '6px', background: '#334155', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, background: '#f59e0b', height: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ajout rapide */}
            <div style={{ ...styles.card, marginTop: '16px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fde047' }}>➕ Ajouter un louveteau</h3>
              <form onSubmit={addCub} style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Prénom Nom" value={newCubName} onChange={e => setNewCubName(e.target.value)} style={{ ...styles.input, flex: 2 }} />
                <select value={newCubSizain} onChange={e => setNewCubSizain(e.target.value)} style={{ ...styles.input, flex: 1 }}>
                  {SIZAINES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" style={styles.button}>Ajouter</button>
              </form>
            </div>
          </div>
        )}

        {/* CARNET INDIVIDUEL ET SIGNATURES */}
        {activeTab === 'cubs' && selectedCub && (
          <div>
            <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button onClick={() => setSelectedCubId(null)} style={{ background: 'none', border: 'none', color: '#fde047', padding: 0, cursor: 'pointer', fontSize: '12px', marginBottom: '4px' }}>
                  ← Retour à la liste
                </button>
                <h2 style={{ margin: 0, fontSize: '16px' }}>{selectedCub.name}</h2>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sizaine {selectedCub.sizain}</span>
              </div>
              <button onClick={() => deleteCub(selectedCub.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>🗑️</button>
            </div>

            {categories.map(cat => (
              <div key={cat} style={styles.card}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#fde047', textTransform: 'uppercase', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>{cat}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {tasks.filter(t => t.category === cat).map(task => {
                    const progress = selectedCub.progress || {};
                    const validations = selectedCub.validations || {};
                    const isChecked = !!progress[task.id];
                    const valInfo = validations[task.id];

                    return (
                      <div 
                        key={task.id}
                        onClick={() => toggleTask(selectedCub.id, task.id)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: isChecked ? '#064e3b' : '#0f172a', border: '1px solid', borderColor: isChecked ? '#047857' : '#334155', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <span>{isChecked ? '✅' : '⚪'}</span>
                          <span>{task.name}</span>
                        </div>
                        {valInfo && (
                          <span style={{ fontSize: '10px', background: '#065f46', padding: '2px 6px', borderRadius: '4px', color: '#a7f3d0', textAlign: 'right' }}>
                            {valInfo.date} • <b>{valInfo.chef}</b>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MATRICE */}
        {activeTab === 'matrix' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fde047' }}>Matrice de Validation</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Signature rapide par <b>{currentChef}</b></p>
            </div>
            <div style={{ ...styles.card, overflowX: 'auto', padding: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '8px' }}>Louveteau</th>
                    {tasks.map(t => <th key={t.id} style={{ padding: '8px', textAlign: 'center' }} title={t.name}>{t.name.substring(0, 4)}..</th>)}
                  </tr>
                </thead>
                <tbody>
                  {cubs.map(cub => (
                    <tr key={cub.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{cub.name}</td>
                      {tasks.map(t => {
                        const progress = cub.progress || {};
                        const isChecked = !!progress[t.id];
                        return (
                          <td key={t.id} style={{ padding: '8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => toggleTask(cub.id, t.id)}
                              style={{ width: '24px', height: '24px', background: isChecked ? '#10b981' : '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              {isChecked ? '✓' : ''}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONFIG ET NOM DU CHEF */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fde047' }}>Votre identité (Chef)</h2>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Qui valide les épreuves sur ce téléphone ?</label>
              <select 
                value={currentChef} 
                onChange={e => setCurrentChef(e.target.value)}
                style={{ ...styles.input, fontWeight: 'bold', color: '#fde047' }}
              >
                <option value="Akela">Akela</option>
                <option value="Baloo">Baloo</option>
                <option value="Bagheera">Bagheera</option>
                <option value="Kaa">Kaa</option>
                <option value="Chil">Chil</option>
              </select>
            </div>

            <div style={styles.card}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fde047' }}>Partage entre Chefs</h2>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Code secret de la Meute :</label>
              <input 
                type="text" 
                value={packCode} 
                onChange={e => setPackCode(e.target.value.toUpperCase())}
                style={{ ...styles.input, fontWeight: 'bold', color: '#fde047', textTransform: 'uppercase' }}
              />
            </div>
          </div>
        )}

      </main>

      {/* NAVIGATION BAS */}
      <nav style={styles.nav}>
        <button onClick={() => { setActiveTab('cubs'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'cubs' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>👥</div>
          <div style={{ fontSize: '10px' }}>Louveteaux</div>
        </button>
        <button onClick={() => { setActiveTab('matrix'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'matrix' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>📋</div>
          <div style={{ fontSize: '10px' }}>Matrice</div>
        </button>
        <button onClick={() => { setActiveTab('config'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'config' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>⚙️</div>
          <div style={{ fontSize: '10px' }}>Partage / Chef</div>
        </button>
      </nav>

    </div>
  );
}