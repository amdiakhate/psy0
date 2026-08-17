import type { Tips } from '../../core/types';

export const tips: Tips = {
  method: [
    'DEUX OUTILS, DEUX COÛTS : la petite croix en bout de ligne déroute UN avion (coût 1) ; la grosse croix latérale déroute TOUS les avions de cette couleur sur le plateau (coût = leur nombre). La grosse croix est une solution de panique — elle sauve la série mais ruine le score de stratégie.',
    'Le score se joue sur la SOBRIÉTÉ : depuis la refonte de 2019, le test note ta stratégie, pas seulement la survie. Une série sans accident mais avec 5 avions déroutés vaut moins qu’une série sauvée avec 1 seul.',
    'Lis les COMPTEURS, pas le trafic : « 2/2 ◀ » signifie que le prochain bleu qui entre en zone déclenche l’accident. Tes yeux vivent sur les compteurs des deux blocs ; le plateau ne sert qu’à choisir QUI dérouter.',
    'Anticipe l’ENTRÉE en zone : compte les avions à 2-3 cases de la zone grise et ajoute-les mentalement au compteur. La décision se prend AVANT l’entrée — après, l’accident est déjà déclenché.',
    'Attention à l’ESCALIER : la zone grise n’est pas alignée entre les lignes 1-3 et 4-6 d’un bloc. Un avion peut être « au niveau » de la zone visuellement sans y être encore sur SA ligne. Vérifie ligne par ligne.',
    'Priorité aux bleus : leur limite (2) est deux fois plus serrée que la limite totale (4). Une file de bleus rapprochés sur les lignes d’un même bloc est l’alerte n°1.',
    'Choisis la victime la plus rentable : entre deux avions, déroute celui qui RESTERA le plus longtemps dans la zone (celui qui vient d’y entrer), pas celui qui en sort dans une case — tu libères plus de capacité pour un même coût.',
  ],
  traps: [
    'Dégainer la grosse croix par réflexe : elle enlève parfois 4-5 avions d’un coup là où une petite croix bien placée suffisait. C’est l’erreur qui transforme une série réussie en demi-point.',
    'L’accident par accumulation lente : trois avions déjà en zone, un quatrième qui arrive tranquillement — l’œil s’est habitué au trafic. Seul le compteur donne l’alerte à temps.',
    'L’effet tunnel sur un bloc : pendant que tu gères la saturation en haut, le bloc du bas se remplit. Le balayage alterné haut/bas est non négociable, surtout pendant une intervention.',
    'Dérouter trop tôt « par sécurité » : un avion qui traverse la zone en 4 pas libère sa place tout seul. Compte les sorties imminentes avant de sacrifier quoi que ce soit.',
  ],
  timing: [
    'Boucle de scan ~2 s : compteurs haut → entrées imminentes haut → compteurs bas → entrées imminentes bas. La régularité du scan EST la performance.',
    'Décide un déroutage en moins d’une seconde : pendant que tu hésites, les avions avancent. Les critères de choix (le plus long séjour restant) doivent être automatiques.',
    '10 séries à traiter : ne crame pas ta lucidité sur la première. En fin de série, la vigilance baisse alors que le trafic accumulé se croise dans les zones — c’est là que tombent les accidents.',
  ],
};
