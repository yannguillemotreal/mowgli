import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// ============================================================================
// CONFIGURATION FIREBASE (Mowgli1ne)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDYoxnvjZixRJ5k3kYa23Pxzd54YhSOAc8",
  authDomain: "mowgli1ne.firebaseapp.com",
  projectId: "mowgli1ne",
  storageBucket: "mowgli1ne.firebasestorage.app",
  messagingSenderId: "796868956194",
  appId: "1:796868956194:web:35808c1fe6c4854796fa7b",
  measurementId: "G-EX31C7TMQN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- TYPES ---
interface Task {
  id: string;
  name: string;
  category: string;
  step: string;
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

// ARBORESCENCE COMPLÈTE DES ÉPREUVES
const ALL_TASKS: Task[] = [
  // --- PATTE TENDRE ---
  { id: 'pt_1', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Uniforme' },
  { id: 'pt_2', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Amis/Ennemis de Mowgli' },
  { id: 'pt_3', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Dessin ou mime de jungle' },
  { id: 'pt_4', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Rocher du conseil' },
  { id: 'pt_5', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Cinq objets' },
  { id: 'pt_6', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Toujours propre' },
  { id: 'pt_7', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Noeuds de foulard, plat, rosette' },
  { id: 'pt_8', step: 'Patte tendre', category: 'Être louveteau/louvette', name: 'Semaphore (1er cycle)' },
  { id: 'pt_9', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Tenue de priere' },
  { id: 'pt_10', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Notre Père, Je vous Salue Marie' },
  { id: 'pt_11', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Priere des loups' },
  { id: 'pt_12', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Signe de croix' },
  { id: 'pt_13', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Bapteme' },
  { id: 'pt_14', step: 'Patte tendre', category: 'Fidèle à Dieu', name: 'Tenue dans l\'église' },
  { id: 'pt_15', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: 'Ranger sa chambre' },
  { id: 'pt_16', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: 'Obeir à ses parents' },
  { id: 'pt_17', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: 'Preparer son sac' },
  { id: 'pt_18', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: 'Bon camarade à l\'ecole' },
  { id: 'pt_19', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: 'Politesse' },
  { id: 'pt_20', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: '5 arbres, 5 fleurs' },
  { id: 'pt_21', step: 'Patte tendre', category: 'A mes parents, à ma patrie', name: '5 animaux de la region' },
  { id: 'pt_22', step: 'Patte tendre', category: 'Loi', name: 'Loi, devise, maitre-mot, maximes' },
  { id: 'pt_23', step: 'Patte tendre', category: 'BA', name: 'BA' },
  { id: 'pt_24', step: 'Patte tendre', category: 'Frère/ Soeur', name: 'Salut' },
  { id: 'pt_25', step: 'Patte tendre', category: 'Frère/ Soeur', name: 'Grand hurlement' },

  // --- 1ÈRE ÉTOILE ---
  { id: 'e1_1', step: '1ère étoile', category: 'Jungle', name: 'Rocher du conseil' },
  { id: 'e1_2', step: '1ère étoile', category: 'Jungle', name: '5 chants jungle' },
  { id: 'e1_3', step: '1ère étoile', category: 'Jungle', name: 'Danses de Jungle' },
  { id: 'e1_4', step: '1ère étoile', category: 'Jungle', name: 'Franc-jeu' },
  { id: 'e1_5', step: '1ère étoile', category: 'FSE', name: 'Drapeau de ton pays' },
  { id: 'e1_6', step: '1ère étoile', category: 'FSE', name: 'Drapeau européen et Baussant' },
  { id: 'e1_7', step: '1ère étoile', category: 'FSE', name: 'Montee des couleurs' },
  { id: 'e1_8', step: '1ère étoile', category: 'FSE', name: 'Priere du matin et du soir' },
  { id: 'e1_9', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Je crois en Dieu' },
  { id: 'e1_10', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Dizainier' },
  { id: 'e1_11', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Parties de la messe' },
  { id: 'e1_12', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Attitude de priere' },
  { id: 'e1_13', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Parabole de Jesus' },
  { id: 'e1_14', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Saint François' },
  { id: 'e1_15', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Quatre evangelistes' },
  { id: 'e1_16', step: '1ère étoile', category: 'Fils ou fille de Dieu', name: 'Communion' },
  { id: 'e1_17', step: '1ère étoile', category: 'Habile pour servir', name: 'Faire les courses' },
  { id: 'e1_18', step: '1ère étoile', category: 'Habile pour servir', name: 'Message d\'Akela' },
  { id: 'e1_19', step: '1ère étoile', category: 'Habile pour servir', name: 'Respect du materiel' },
  { id: 'e1_20', step: '1ère étoile', category: 'Habile pour servir', name: 'Faire son lit et ranger' },
  { id: 'e1_21', step: '1ère étoile', category: 'Habile pour servir', name: 'Telephone' },
  { id: 'e1_22', step: '1ère étoile', category: 'Habile pour servir', name: 'Noeuds batelier, pêcheur, tisserand' },
  { id: 'e1_23', step: '1ère étoile', category: 'Habile pour servir', name: 'Regles de circulation' },
  { id: 'e1_24', step: '1ère étoile', category: 'Habile pour servir', name: 'Joli paquet' },
  { id: 'e1_25', step: '1ère étoile', category: 'Habile pour servir', name: 'Plan de ville' },
  { id: 'e1_26', step: '1ère étoile', category: 'Habile pour servir', name: 'Semaphore (3 premiers cycles)' },
  { id: 'e1_27', step: '1ère étoile', category: 'Développe ton corps', name: 'Kim' },
  { id: 'e1_28', step: '1ère étoile', category: 'Développe ton corps', name: 'Marche en equilibre' },
  { id: 'e1_29', step: '1ère étoile', category: 'Développe ton corps', name: 'Courir' },
  { id: 'e1_30', step: '1ère étoile', category: 'Développe ton corps', name: 'Franchir un obstacle' },
  { id: 'e1_31', step: '1ère étoile', category: 'Développe ton corps', name: 'Sauter' },
  { id: 'e1_32', step: '1ère étoile', category: 'Développe ton corps', name: 'Marche de Bagheera' },
  { id: 'e1_33', step: '1ère étoile', category: 'Développe ton corps', name: 'Balle' },
  { id: 'e1_34', step: '1ère étoile', category: 'Développe ton corps', name: 'Deplacement suspendu' },
  { id: 'e1_35', step: '1ère étoile', category: 'Ami de la nature', name: '5 arbres' },
  { id: 'e1_36', step: '1ère étoile', category: 'Ami de la nature', name: '5 animaux et oiseaux' },
  { id: 'e1_37', step: '1ère étoile', category: 'Ami de la nature', name: 'Bois' },
  { id: 'e1_38', step: '1ère étoile', category: 'Ami de la nature', name: 'Signes de piste' },
  { id: 'e1_39', step: '1ère étoile', category: 'Ami de la nature', name: 'Animal' },
  { id: 'e1_40', step: '1ère étoile', category: 'Ami de la nature', name: 'Effort personnel' },

  // --- 2ÈME ÉTOILE ---
  { id: 'e2_1', step: '2ème étoile', category: 'Jungle', name: 'Loi du clan et devise des loups' },
  { id: 'e2_2', step: '2ème étoile', category: 'Jungle', name: 'Rocher du Conseil' },
  { id: 'e2_3', step: '2ème étoile', category: 'Jungle', name: 'Sagesses de Jungle' },
  { id: 'e2_4', step: '2ème étoile', category: 'Jungle', name: 'Faire decouvrir animaux' },
  { id: 'e2_5', step: '2ème étoile', category: 'Jungle', name: 'Mime avec patte tendre' },
  { id: 'e2_6', step: '2ème étoile', category: 'Jungle', name: 'Veillee' },
  { id: 'e2_7', step: '2ème étoile', category: 'FSE', name: 'Drapeaux des pays d\'Europe' },
  { id: 'e2_8', step: '2ème étoile', category: 'FSE', name: 'Pays des Scouts d\'Europe' },
  { id: 'e2_9', step: '2ème étoile', category: 'FSE', name: 'Hymne national' },
  { id: 'e2_10', step: '2ème étoile', category: 'FSE', name: 'Baden-Powell' },
  { id: 'e2_11', step: '2ème étoile', category: 'FSE', name: 'Saint patron de ton groupe' },
  { id: 'e2_12', step: '2ème étoile', category: 'FSE', name: 'Cantons et langues' },
  { id: 'e2_13', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Saint François' },
  { id: 'e2_14', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Je confesse a Dieu / Acte de contrition' },
  { id: 'e2_15', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Priere des GSE d\'apres St François' },
  { id: 'e2_16', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Sacrement de reconciliation' },
  { id: 'e2_17', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Communion' },
  { id: 'e2_18', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Texte d\'Evangile' },
  { id: 'e2_19', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: '9 fetes liturgiques' },
  { id: 'e2_20', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Livre de messe' },
  { id: 'e2_21', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Chapelet' },
  { id: 'e2_22', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Rencontre avec un prêtre' },
  { id: 'e2_23', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Prêtre, eveque' },
  { id: 'e2_24', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Intentions de priere' },
  { id: 'e2_25', step: '2ème étoile', category: 'Fils ou fille de Dieu', name: 'Aider autour de soi' },
  { id: 'e2_26', step: '2ème étoile', category: 'Habile pour servir', name: 'Chercher un numero de telephone' },
  { id: 'e2_27', step: '2ème étoile', category: 'Habile pour servir', name: 'Repondeur telephonique' },
  { id: 'e2_28', step: '2ème étoile', category: 'Habile pour servir', name: 'Courriel' },
  { id: 'e2_29', step: '2ème étoile', category: 'Habile pour servir', name: 'Noeuds de chaise, jambe-de-chien, brelage' },
  { id: 'e2_30', step: '2ème étoile', category: 'Habile pour servir', name: 'Objet utile' },
  { id: 'e2_31', step: '2ème étoile', category: 'Habile pour servir', name: 'Nord avec le soleil' },
  { id: 'e2_32', step: '2ème étoile', category: 'Habile pour servir', name: 'Allumer un feu' },
  { id: 'e2_33', step: '2ème étoile', category: 'Habile pour servir', name: 'Bouillir de l\'eau' },
  { id: 'e2_34', step: '2ème étoile', category: 'Habile pour servir', name: 'Plaie et brulure' },
  { id: 'e2_35', step: '2ème étoile', category: 'Habile pour servir', name: 'Feu de veillee' },
  { id: 'e2_36', step: '2ème étoile', category: 'Habile pour servir', name: 'Monter une tente' },
  { id: 'e2_37', step: '2ème étoile', category: 'Habile pour servir', name: 'Reportage' },
  { id: 'e2_38', step: '2ème étoile', category: 'Habile pour servir', name: 'Sac pour le camp' },
  { id: 'e2_39', step: '2ème étoile', category: 'Développe ton corps', name: 'Semaphore' },
  { id: 'e2_40', step: '2ème étoile', category: 'Développe ton corps', name: 'Parcours Hebert' },
  { id: 'e2_41', step: '2ème étoile', category: 'Ami de la nature', name: 'Composition nature' },
  { id: 'e2_42', step: '2ème étoile', category: 'Ami de la nature', name: 'Tableau 2 semaines' },
  { id: 'e2_43', step: '2ème étoile', category: 'Ami de la nature', name: 'Observer un element naturel et presentation' },
  { id: 'e2_44', step: '2ème étoile', category: 'Ami de la nature', name: 'Tracer une piste' },
  { id: 'e2_45', step: '2ème étoile', category: 'Ami de la nature', name: 'Effort personnel' },
  { id: 'e2_46', step: '2ème étoile', category: 'Ami de la nature', name: 'Vivre la loi et la devise' },
  { id: 'e2_47', step: '2ème étoile', category: 'Ami de la nature', name: 'Choix de 3 badges' },

  // --- BADGES ---
  { id: 'b_bl_1', step: 'Badges', category: 'Badges', name: 'Servant de messe' },
  { id: 'b_bl_2', step: 'Badges', category: 'Badges', name: 'Liturgiste' },
  { id: 'b_bl_3', step: 'Badges', category: 'Badges', name: 'Ceremoniaire' },
  { id: 'b_bl_4', step: 'Badges', category: 'Badges', name: 'Lecteur' },
  { id: 'b_bl_5', step: 'Badges', category: 'Badges', name: 'Evangeliste' },
  { id: 'b_bl_6', step: 'Badges', category: 'Badges', name: 'Temoin du Christ' },
  { id: 'b_bl_7', step: 'Badges', category: 'Badges', name: 'Art floral' },
  { id: 'b_bl_8', step: 'Badges', category: 'Badges', name: 'Batisseur d\'eglise' },
  { id: 'b_bl_9', step: 'Badges', category: 'Badges', name: 'Hagiographe' },
  { id: 'b_bl_10', step: 'Badges', category: 'Badges', name: 'A l\'ecole de Marie' },

  { id: 'b_rg_1', step: 'Badges', category: 'Badges', name: 'Guide' },
  { id: 'b_rg_2', step: 'Badges', category: 'Badges', name: 'Messager' },
  { id: 'b_rg_3', step: 'Badges', category: 'Badges', name: 'Farfadet' },
  { id: 'b_rg_4', step: 'Badges', category: 'Badges', name: 'Aide secouriste' },
  { id: 'b_rg_5', step: 'Badges', category: 'Badges', name: 'Cuisinier' },
  { id: 'b_rg_6', step: 'Badges', category: 'Badges', name: 'Ami des petits' },

  { id: 'b_ja_1', step: 'Badges', category: 'Badges', name: 'Artisan' },
  { id: 'b_ja_2', step: 'Badges', category: 'Badges', name: 'Bon campeur' },
  { id: 'b_ja_3', step: 'Badges', category: 'Badges', name: 'Grillon' },
  { id: 'b_ja_4', step: 'Badges', category: 'Badges', name: 'Photographe' },
  { id: 'b_ja_5', step: 'Badges', category: 'Badges', name: 'Ami des livres' },
  { id: 'b_ja_6', step: 'Badges', category: 'Badges', name: 'Electricien' },
  { id: 'b_ja_7', step: 'Badges', category: 'Badges', name: 'Menuisier' },
  { id: 'b_ja_8', step: 'Badges', category: 'Badges', name: 'Ami des betes' },
  { id: 'b_ja_9', step: 'Badges', category: 'Badges', name: 'Jardinier' },
  { id: 'b_ja_10', step: 'Badges', category: 'Badges', name: 'Decorateur' },
  { id: 'b_ja_11', step: 'Badges', category: 'Badges', name: 'Gabier' },

  { id: 'b_blu_1', step: 'Badges', category: 'Badges', name: 'Loup d\'Europe' },
  { id: 'b_blu_2', step: 'Badges', category: 'Badges', name: 'Collectionneur' },
  { id: 'b_blu_3', step: 'Badges', category: 'Badges', name: 'Reporter' },
  { id: 'b_blu_4', step: 'Badges', category: 'Badges', name: 'Kim' },
  { id: 'b_blu_5', step: 'Badges', category: 'Badges', name: 'Animateur de veillee' },
  { id: 'b_blu_6', step: 'Badges', category: 'Badges', name: 'Signaleur' },

  { id: 'b_vt_1', step: 'Badges', category: 'Badges', name: 'Bon joueur' },
  { id: 'b_vt_2', step: 'Badges', category: 'Badges', name: 'Sportif' },
  { id: 'b_vt_3', step: 'Badges', category: 'Badges', name: 'Ceiste-kayakiste' },
  { id: 'b_vt_4', step: 'Badges', category: 'Badges', name: 'Loup des mers' },
  { id: 'b_vt_5', step: 'Badges', category: 'Badges', name: 'Loup des montagnes' },
  { id: 'b_vt_6', step: 'Badges', category: 'Badges', name: 'Cycliste' },
];

const SIZAINES = ['Blancs', 'Gris', 'Noirs'];
const LISTE_CHEFS = ['Akela', 'Baloo', 'Bagheera', 'Kaa', 'Chil'];
const STEPS = ['Patte tendre', '1ère étoile', '2ème étoile', 'Badges'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'cubs' | 'ai' | 'profile' | 'config'>('cubs');

  const [packCode, setPackCode] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMeute = urlParams.get('meute');
    if (urlMeute) {
      const formatted = urlMeute.toUpperCase();
      localStorage.setItem('mowgli_pack_code', formatted);
      return formatted;
    }
    return localStorage.getItem('mowgli_pack_code') || 'MEUTE-DEFAUT';
  });

  const [listeChefs, setListeChefs] = useState<string[]>(() => {
    const saved = localStorage.getItem('mowgli_chefs_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return LISTE_CHEFS;
  });

  const [currentChef, setCurrentChef] = useState<string>(() => {
    return localStorage.getItem('mowgli_current_chef') || 'Akela';
  });

  const [newChefInput, setNewChefInput] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  const [cubs, setCubs] = useState<Cub[]>([
    { 
      id: '1', 
      name: 'Augustin', 
      sizain: 'Blancs', 
      progress: { pt_1: true }, 
      validations: { pt_1: { date: '12/10', chef: 'Akela' } } 
    },
    { 
      id: '2', 
      name: 'Mayeul', 
      sizain: 'Gris', 
      progress: {}, 
      validations: {} 
    },
  ]);

  const [tasks] = useState<Task[]>(ALL_TASKS);
  const [selectedCubId, setSelectedCubId] = useState<string | null>(null);
  const [newCubName, setNewCubName] = useState('');
  const [newCubSizain, setNewCubSizain] = useState('Blancs');
  const [filterSizain, setFilterSizain] = useState('Tous');

  const [openStep, setOpenStep] = useState<string | null>('Patte tendre');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleChefChange = (chef: string) => {
    setCurrentChef(chef);
    localStorage.setItem('mowgli_current_chef', chef);
  };

  const handleAddCustomChef = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChefInput.trim();
    if (!trimmed) return;
    if (!listeChefs.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      const updatedList = [...listeChefs, trimmed];
      setListeChefs(updatedList);
      localStorage.setItem('mowgli_chefs_list', JSON.stringify(updatedList));
      handleChefChange(trimmed);
    } else {
      handleChefChange(trimmed);
    }
    setNewChefInput('');
  };

  const handlePackCodeChange = (code: string) => {
    const formatted = code.toUpperCase();
    setPackCode(formatted);
    localStorage.setItem('mowgli_pack_code', formatted);
  };

  useEffect(() => {
    const packRef = doc(db, 'meutes', packCode);
    
    const unsubscribe = onSnapshot(packRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.cubs)) {
          setCubs(data.cubs);
        }
      } else {
        setDoc(packRef, { cubs: cubs });
      }
      setSyncStatus('synced');
    }, (error) => {
      console.error("Erreur Cloud :", error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [packCode]);

  const saveToCloud = async (updatedCubs: Cub[]) => {
    setCubs(updatedCubs);
    setSyncStatus('saving');
    try {
      const packRef = doc(db, 'meutes', packCode);
      await setDoc(packRef, { cubs: updatedCubs });
      setSyncStatus('synced');
    } catch (e) {
      console.error("Erreur d'écriture Cloud :", e);
      setSyncStatus('error');
    }
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
    saveToCloud(updated);
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
    saveToCloud([...cubs, newCub]);
    setNewCubName('');
  };

  const deleteCub = (id: string) => {
    if (confirm("Supprimer ce louveteau ?")) {
      saveToCloud(cubs.filter(c => c.id !== id));
      if (selectedCubId === id) setSelectedCubId(null);
    }
  };

  // LOGIQUE INTELLIGENTE : SÉLECTION DES 6 POINTS DE PROGRESSION & JEUX 5'
  const getAiRecommendations = () => {
    if (cubs.length === 0) return { selectedTasks: [], activities: [] };

    const stepPriority = ['Patte tendre', '1ère étoile', '2ème étoile', 'Badges'];

    const taskDeficit: { task: Task; missingCount: number; stepIndex: number }[] = tasks.map(task => {
      let missing = 0;
      cubs.forEach(cub => {
        if (!cub.progress?.[task.id]) missing++;
      });
      const stepIndex = stepPriority.indexOf(task.step);
      return { task, missingCount: missing, stepIndex };
    });

    taskDeficit.sort((a, b) => {
      if (a.stepIndex !== b.stepIndex) {
        return a.stepIndex - b.stepIndex;
      }
      return b.missingCount - a.missingCount;
    });

    const selectedTasks = taskDeficit.slice(0, 6).map(item => item.task);

    const activities = selectedTasks.map((t, index) => {
      let gameName = "Grand Jeu de la Jungle";
      let rule = "Jeu rapide de 5 minutes axé sur la cohésion de sizaine pour acquérir ce point.";

      const nameLower = t.name.toLowerCase();
      if (nameLower.includes('noeud') || nameLower.includes('brelage')) {
        gameName = "Le Relais des Nœuds Express";
        rule = "En sizaine, chaque louveteau court faire un nœud imparti sur un piquet, tape dans la main du suivant. Chrono : 5 minutes max.";
      } else if (nameLower.includes('semaphore') || nameLower.includes('indicatif')) {
        gameName = "Le Télégramme de Mowgli";
        rule = "Un chef mime ou transmet un mot en sémaphore d'un côté du camp, le premier louveteau qui décode court le relayer.";
      } else if (nameLower.includes('prière') || nameLower.includes('dizainier') || nameLower.includes('messe') || nameLower.includes('dieu')) {
        gameName = "La Minute du Loup Contemplatif";
        rule = "Rassemblement autour du Rocher du Conseil pour un court topo et un chant gestué de 5 minutes avant le grand jeu.";
      } else if (nameLower.includes('kim') || nameLower.includes('objet') || nameLower.includes('observation')) {
        gameName = "Le Kim de Bagheera";
        rule = "10 objets posés sur une bâche, on observe 1 minute, on cache, les louveteaux écrivent ce qu'ils ont vu en 3 minutes.";
      } else if (nameLower.includes('marche') || nameLower.includes('corps') || nameLower.includes('saut') || nameLower.includes('courir')) {
        gameName = "Le Parcours de la Canopée";
        rule = "Petit parcours d'agilité chronométré en un contre un à travers les arbres du camp, sans courir dans les zones interdites.";
      } else if (nameLower.includes('arbre') || nameLower.includes('animal') || nameLower.includes('nature') || nameLower.includes('piste')) {
        gameName = "Pistage Éclair en Sizaine";
        rule = "Suivre une piste de signes de piste de 50 mètres tracée à la craie ou au bois mort autour du lieu de rassemblement.";
      }

      return {
        id: t.id,
        pointName: t.name,
        step: t.step,
        gameTitle: gameName,
        description: rule
      };
    });

    return { selectedTasks, activities };
  };

  const aiData = getAiRecommendations();

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

  const currentUrl = window.location.origin + window.location.pathname + '?meute=' + packCode.toLowerCase();

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>⚜️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              Carnet Mowgli {syncStatus === 'saving' ? '☁️...' : syncStatus === 'error' ? '⚠️' : '☁️ Live'}
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#a7f3d0' }}>Canal : <b>{packCode}</b></p>
          </div>
        </div>
        <button 
          onClick={() => { setActiveTab('profile'); setSelectedCubId(null); }}
          style={{ background: '#047857', color: '#fde047', border: '1px solid #059669', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Changer de rôle (Chef)"
        >
          👤 {currentChef}
        </button>
      </header>

      {/* CONTENU */}
      <main style={styles.main}>
        
        {/* VUE LOUVETEAUX */}
        {activeTab === 'cubs' && !selectedCub && (
          <div>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredCubs.map(cub => {
                const progress = cub.progress || {};
                const totalValidated = Object.values(progress).filter(Boolean).length;
                const totalPercent = Math.round((totalValidated / tasks.length) * 100);

                return (
                  <div 
                    key={cub.id}
                    onClick={() => setSelectedCubId(cub.id)}
                    style={{ ...styles.card, cursor: 'pointer', margin: 0, marginBottom: '8px', padding: '12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', background: '#065f46', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fde047', fontSize: '14px' }}>
                          {cub.name ? cub.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{cub.name}</span>
                            <span style={{ fontSize: '10px', background: '#334155', padding: '2px 6px', borderRadius: '6px', color: '#cbd5e1' }}>Sizaine {cub.sizain}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fde047' }}>{totalValidated}/{tasks.length}</span>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{totalPercent}%</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                      {STEPS.map(stepName => {
                        const stepTasks = tasks.filter(t => t.step === stepName);
                        const stepVal = stepTasks.filter(t => progress[t.id]).length;
                        const stepPct = stepTasks.length > 0 ? Math.round((stepVal / stepTasks.length) * 100) : 0;
                        const shortName = stepName === 'Patte tendre' ? 'Patte' : stepName === '1ère étoile' ? '1ère Étoile' : stepName === '2ème étoile' ? '2ème Étoile' : 'Badges';

                        return (
                          <div key={stepName} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginBottom: '2px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortName}</span>
                              <span style={{ color: stepPct === 100 ? '#10b981' : '#fde047', fontWeight: 'bold' }}>{stepVal}/{stepTasks.length}</span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden', border: '1px solid #334155' }}>
                              <div style={{ width: `${stepPct}%`, background: stepPct === 100 ? '#10b981' : '#f59e0b', height: '100%' }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

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

        {/* CARNET INDIVIDUEL */}
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

            {STEPS.map(stepName => {
              const stepTasks = tasks.filter(t => t.step === stepName);
              const stepValidatedCount = stepTasks.filter(t => selectedCub.progress?.[t.id]).length;
              const isStepOpen = openStep === stepName;
              const categoriesInStep = Array.from(new Set(stepTasks.map(t => t.category)));

              return (
                <div key={stepName} style={{ ...styles.card, marginBottom: '8px', padding: '12px' }}>
                  <div 
                    onClick={() => setOpenStep(isStepOpen ? null : stepName)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{isStepOpen ? '📂' : '📁'}</span>
                      <span style={{ fontWeight: 'bold', color: '#fde047', fontSize: '14px' }}>{stepName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{stepValidatedCount}/{stepTasks.length}</span>
                      <span style={{ fontSize: '12px', color: '#f59e0b' }}>{isStepOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isStepOpen && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                      {categoriesInStep.map(catName => {
                        const catTasks = stepTasks.filter(t => t.category === catName);
                        const catValidatedCount = catTasks.filter(t => selectedCub.progress?.[t.id]).length;
                        const catKey = `${stepName}-${catName}`;
                        const isCatOpen = openCategory === catKey;

                        return (
                          <div key={catName} style={{ background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
                            <div 
                              onClick={() => setOpenCategory(isCatOpen ? null : catKey)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', background: '#1e293b' }}
                            >
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>{catName}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{catValidatedCount}/{catTasks.length}</span>
                                <span style={{ fontSize: '10px', color: '#f59e0b' }}>{isCatOpen ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            {isCatOpen && (
                              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {catTasks.map(task => {
                                  const progress = selectedCub.progress || {};
                                  const validations = selectedCub.validations || {};
                                  const isChecked = !!progress[task.id];
                                  const valInfo = validations[task.id];

                                  return (
                                    <div 
                                      key={task.id}
                                      onClick={() => toggleTask(selectedCub.id, task.id)}
                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '6px', background: isChecked ? '#064e3b' : '#1e293b', border: '1px solid', borderColor: isChecked ? '#047857' : '#334155', cursor: 'pointer' }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                        <span>{isChecked ? '✅' : '⚪'}</span>
                                        <span>{task.name}</span>
                                      </div>
                                      {valInfo && (
                                        <span style={{ fontSize: '9px', background: '#065f46', padding: '2px 4px', borderRadius: '4px', color: '#a7f3d0', textAlign: 'right' }}>
                                          {valInfo.date} • <b>{valInfo.chef}</b>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ONGLET IA / PRÉPARATION DE SORTIE */}
        {activeTab === 'ai' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#fde047' }}>🤖 Assistant IA & Sortie de Meute</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                L'IA analyse les carnets de toute la meute (priorité Patte Tendre ➔ 1ère Étoile ➔ 2ème Étoile ➔ Badges) et vous propose les 6 objectifs parfaits pour votre prochaine sortie !
              </p>
            </div>

            <div style={{ ...styles.card, overflowX: 'auto', padding: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#fde047' }}>📊 Matrice des 6 Objectifs prioritaires</h3>
              {cubs.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Ajoutez des louveteaux pour activer l'analyse.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '6px', textAlign: 'left' }}>Louveteau</th>
                      {aiData.selectedTasks.map((t, idx) => (
                        <th key={t.id} style={{ padding: '6px', maxWidth: '60px' }} title={`${t.step} - ${t.name}`}>
                          Obj {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cubs.map(cub => (
                      <tr key={cub.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '6px', textAlign: 'left', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{cub.name}</td>
                        {aiData.selectedTasks.map(t => {
                          const isAcquired = !!cub.progress?.[t.id];
                          return (
                            <td key={t.id} style={{ padding: '6px' }}>
                              <span style={{ fontSize: '14px' }}>{isAcquired ? '✅' : '❌'}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '12px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#a7f3d0' }}>Détail des 6 points ciblés :</span>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '11px', color: '#cbd5e1' }}>
                  {aiData.selectedTasks.map((t, idx) => (
                    <li key={t.id} style={{ marginBottom: '2px' }}>
                      <b>Obj {idx + 1} ({t.step}) :</b> {t.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fde047' }}>⚡ 6 Jeux scouts express (5 minutes max)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {aiData.activities.map((act, idx) => (
                  <div key={act.id} style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {idx + 1}. {act.gameTitle}
                      </span>
                      <span style={{ fontSize: '9px', background: '#065f46', color: '#a7f3d0', padding: '2px 6px', borderRadius: '4px' }}>
                        Cible : {act.pointName}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: '1.3' }}>
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE PROFIL (CHOIX DU CHEF) */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={styles.card}>
              <button onClick={() => setActiveTab('cubs')} style={{ background: 'none', border: 'none', color: '#fde047', padding: 0, cursor: 'pointer', fontSize: '12px', marginBottom: '8px' }}>
                ← Retour au carnet
              </button>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fde047' }}>Mon Rôle de Chef</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
                Sélectionnez votre nom de jungle ou ajoutez-le s'il n'y est pas.
              </p>
              
              <form onSubmit={handleAddCustomChef} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Ajouter un autre nom..." 
                  value={newChefInput} 
                  onChange={e => setNewChefInput(e.target.value)} 
                  style={{ ...styles.input, flex: 1 }} 
                />
                <button type="submit" style={styles.button}>Ajouter</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listeChefs.map(chef => (
                  <button
                    key={chef}
                    onClick={() => handleChefChange(chef)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: currentChef === chef ? '#f59e0b' : '#334155',
                      background: currentChef === chef ? '#064e3b' : '#0f172a',
                      color: currentChef === chef ? '#fde047' : '#f8fafc',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{chef}</span>
                    {currentChef === chef && <span>✅ Actif</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONFIGURATION / MEUTE */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fde047' }}>Paramètres de la Meute (Cloud)</h2>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Code d'accès de votre Meute :</label>
              <input 
                type="text" 
                value={packCode} 
                onChange={e => handlePackCodeChange(e.target.value)}
                style={{ ...styles.input, fontWeight: 'bold', color: '#fde047', textTransform: 'uppercase' }}
              />
              
              <div style={{ marginTop: '12px', background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ fontSize: '11px', color: '#a7f3d0', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>🔗 Lien direct à partager aux chefs de cette meute :</span>
                <input 
                  type="text" 
                  readOnly 
                  value={currentUrl} 
                  style={{ ...styles.input, fontSize: '11px', color: '#94a3b8', background: '#1e293b' }} 
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
              </div>
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
        <button onClick={() => { setActiveTab('ai'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'ai' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>🤖</div>
          <div style={{ fontSize: '10px' }}>IA / Sortie</div>
        </button>
        <button onClick={() => { setActiveTab('profile'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>👤</div>
          <div style={{ fontSize: '10px' }}>Mon Rôle</div>
        </button>
        <button onClick={() => { setActiveTab('config'); setSelectedCubId(null); }} style={{ background: 'none', border: 'none', color: activeTab === 'config' ? '#fde047' : '#94a3b8', cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: '16px' }}>⚙️</div>
          <div style={{ fontSize: '10px' }}>Meute</div>
        </button>
      </nav>

    </div>
  );
}