import type { CultureCategory, CultureQuestion } from '../../types';

const SOURCE = 'Culture_Aero_PSY0_Air_France_2026.docx — version du 29 août 2026';
const VERIFIED_AT = '2026-08-29';

interface QuestionOptions {
  tags?: string[];
  categories?: CultureCategory[];
  difficulty?: 1 | 2 | 3;
  highYield?: boolean;
  trap?: string;
  memoryTip?: string;
  timeSensitive?: boolean;
}

function choice(
  number: number,
  category: CultureCategory,
  question: string,
  answer: string,
  distractors: [string, string, string],
  explanation: string,
  options: QuestionOptions = {},
): CultureQuestion {
  const isTimeSensitive = options.timeSensitive ?? false;
  return {
    id: `doc26-${String(number).padStart(2, '0')}`,
    category,
    categories: [...new Set([category, ...(options.categories ?? [])])],
    tags: options.tags ?? [],
    question,
    type: 'single-choice',
    choices: [answer, ...distractors],
    answer,
    explanation,
    difficulty: options.difficulty ?? 1,
    source: SOURCE,
    sourceQuestionNumber: number,
    isTimeSensitive,
    verifiedAt: isTimeSensitive ? VERIFIED_AT : undefined,
    trap: options.trap,
    memoryTip: options.memoryTip,
    highYield: options.highYield ?? true,
  };
}

function numeric(
  number: number,
  category: CultureCategory,
  question: string,
  answer: number,
  explanation: string,
  options: QuestionOptions = {},
): CultureQuestion {
  const isTimeSensitive = options.timeSensitive ?? false;
  return {
    id: `doc26-${String(number).padStart(2, '0')}`,
    category,
    categories: [...new Set([category, ...(options.categories ?? [])])],
    tags: options.tags ?? [],
    question,
    type: 'numeric',
    answer,
    acceptedAnswers: [answer, String(answer)],
    explanation,
    difficulty: options.difficulty ?? 1,
    source: SOURCE,
    sourceQuestionNumber: number,
    isTimeSensitive,
    verifiedAt: isTimeSensitive ? VERIFIED_AT : undefined,
    trap: options.trap,
    memoryTip: options.memoryTip,
    highYield: options.highYield ?? true,
  };
}

export const document2026Questions: CultureQuestion[] = [
  numeric(1, 'mental-math', 'Quelle distance, en NM, parcourt un avion à 240 kt en 15 minutes ?', 60, '15 min = 1/4 h. Distance = 240 × 1/4 = 60 NM.', { tags: ['vitesse-distance-temps', 'unités'], memoryTip: '15 minutes : divise la vitesse par 4.' }),
  numeric(2, 'mental-math', 'Quelle distance, en NM, parcourt un avion à 180 kt en 20 minutes ?', 60, '20 min = 1/3 h. Distance = 180 × 1/3 = 60 NM.', { tags: ['vitesse-distance-temps', 'unités'], memoryTip: '20 minutes : divise la vitesse par 3.' }),
  choice(3, 'navigation', 'Quel est le virage le plus court pour passer du cap 300° au cap 100° ?', 'À droite de 160°', ['À gauche de 160°', 'À droite de 200°', 'À gauche de 200°'], 'En ajoutant 360° au cap 100°, on obtient 460° : 460 − 300 = 160° vers la droite. L’autre sens mesure 200°.', { tags: ['caps'], trap: 'Ne soustrais pas simplement le plus petit cap du plus grand sans tester le passage par 360°.', memoryTip: 'Cherche toujours le virage inférieur ou égal à 180°.' }),
  choice(4, 'aerodromes', 'Quel cap approximatif correspond à une piste 27 ?', '270°', ['027°', '180°', '090°'], 'Le numéro de piste correspond au cap magnétique arrondi à la dizaine, sans le zéro final : 27 ≈ 270°.', { tags: ['QFU', 'caps'], categories: ['navigation'], memoryTip: 'QFU × 10 ≈ cap.' }),
  choice(5, 'aerodromes', 'Quel est le QFU opposé d’une piste 04 ?', '22', ['14', '26', '36'], 'Deux sens opposés diffèrent de 180°, donc leurs numéros diffèrent de 18 : 04 + 18 = 22.', { tags: ['QFU'], categories: ['navigation'], memoryTip: 'QFU opposé : ajoute ou retire 18.' }),
  numeric(6, 'aerodromes', 'Combien de pistes physiques possède Paris-Charles de Gaulle ?', 4, 'Paris-CDG possède quatre pistes physiques organisées en deux doublets parallèles.', { tags: ['QFU', 'hubs'], categories: ['air-france'], timeSensitive: true }),
  numeric(7, 'aerodromes', 'Combien de QFU les quatre pistes de Paris-CDG représentent-elles ?', 8, 'Chaque piste physique possède deux sens. Les quatre pistes donnent donc huit QFU : 08L/26R, 08R/26L, 09L/27R et 09R/27L.', { tags: ['QFU', 'hubs'], categories: ['air-france'], timeSensitive: true }),
  choice(8, 'navigation', 'Un vent du 180° vient de quelle direction ?', 'Du sud', ['Du nord', "De l’est", "De l’ouest"], 'La direction du vent indique sa provenance. Un vent du 180° vient du sud et souffle vers le nord.', { tags: ['vent'], memoryTip: 'Le vent est nommé par l’endroit d’où il vient.' }),
  choice(9, 'aerodromes', 'Entre les pistes 04 et 22, laquelle privilégier en principe avec un vent du sud ?', 'La piste 22', ['La piste 04', 'Les deux sont équivalentes', 'Aucune des deux'], 'La piste 22 pointe vers 220°, proche de la provenance 180° du vent : elle offre une forte composante de face.', { tags: ['vent', 'QFU'], categories: ['navigation'], trap: 'Ne choisis pas la piste vers laquelle le vent souffle : on cherche un vent de face.' }),
  choice(10, 'aerodromes', 'Que signifie le « L » dans la désignation 08L ?', 'Left : la piste gauche parmi des parallèles', ['Longue', 'Éclairée', 'Locale'], 'L, C et R signifient Left, Center et Right lorsque plusieurs pistes parallèles portent le même numéro.', { tags: ['QFU', 'balisage'] }),
  choice(11, 'aerodynamics', 'Quelle commande de vol contrôle le roulis ?', 'Les ailerons', ['La gouverne de profondeur', 'La gouverne de direction', 'Les volets'], 'Les ailerons braqués en sens opposés modifient la portance de chaque aile et commandent le roulis.', { tags: ['commandes de vol'] }),
  choice(12, 'aerodynamics', 'Quelle commande de vol contrôle le tangage ?', 'La gouverne de profondeur', ['Les ailerons', 'La gouverne de direction', 'Les spoilers'], 'La gouverne de profondeur agit autour de l’axe transversal et commande le tangage.', { tags: ['commandes de vol'] }),
  choice(13, 'aerodynamics', 'Quelle commande de vol contrôle le lacet ?', 'La gouverne de direction', ['Les ailerons', 'La gouverne de profondeur', 'Les volets'], 'La gouverne de direction, actionnée au palonnier, agit autour de l’axe vertical et commande le lacet.', { tags: ['commandes de vol'] }),
  choice(14, 'aerodynamics', 'Comment s’appelle le lacet opposé au virage induit par les ailerons ?', 'Le lacet inverse', ['Le roulis hollandais', 'Le facteur de charge', 'Le lacet positif'], 'L’aileron qui descend augmente aussi la traînée de son aile, ce qui tend à faire partir le nez à l’opposé du virage.', { tags: ['lacet inverse'], memoryTip: 'Aileron bas : plus de portance, mais aussi plus de traînée.' }),
  choice(15, 'aerodynamics', 'Quelle condition provoque le décrochage aérodynamique ?', 'Le dépassement de l’angle d’attaque critique', ['Une vitesse sol trop faible', 'Une assiette supérieure à 10°', 'Le passage sous 1 000 ft'], 'Le décrochage survient lorsque l’angle d’attaque critique est dépassé, quelle que soit l’assiette ou la vitesse affichée.', { tags: ['décrochage'], trap: 'Le décrochage n’est pas défini par une vitesse unique.' }),
  choice(16, 'aerodynamics', 'En virage en palier, que devient la vitesse de décrochage ?', 'Elle augmente', ['Elle diminue', 'Elle ne change jamais', 'Elle devient nulle'], 'L’inclinaison augmente le facteur de charge nécessaire au maintien du palier, donc la vitesse de décrochage augmente.', { tags: ['décrochage', 'facteur de charge'] }),
  choice(17, 'aerodynamics', 'Quand les vortex de sillage sont-ils particulièrement forts ?', 'Avion lourd, lent et en configuration propre', ['Avion léger, rapide et volets sortis', 'Avion léger au roulage', 'Avion rapide en descente train sorti'], 'Les vortex croissent avec la portance demandée : ils sont maximaux derrière un avion lourd, lent et sans dispositifs hypersustentateurs sortis.', { tags: ['vortex'], memoryTip: 'Lourd, lent, propre : vortex forts.' }),
  choice(18, 'aerodynamics', 'Quel est l’effet principal des volets ?', 'Ils augmentent la portance et la traînée', ['Ils réduisent la portance et la traînée', 'Ils commandent le lacet', 'Ils mesurent l’incidence'], 'Les volets augmentent la cambrure : l’avion peut voler plus lentement, avec davantage de traînée.', { tags: ['volets'] }),
  choice(19, 'instruments', 'Que mesure l’anémomètre ?', 'La vitesse air indiquée', ['La vitesse sol', 'La vitesse verticale', 'La vitesse du vent'], 'L’anémomètre déduit la vitesse indiquée de la pression dynamique fournie par le système pitot-statique.', { tags: ['Pitot', 'anémomètre'] }),
  choice(20, 'instruments', 'Quelles pressions l’anémomètre compare-t-il ?', 'La pression totale Pitot et la pression statique', ['Le QNH et le QFE', 'La pression cabine et la pression extérieure', 'La pression standard et la pression dynamique'], 'La différence entre pression totale et pression statique donne la pression dynamique utilisée pour l’indication de vitesse.', { tags: ['Pitot', 'anémomètre'] }),
  choice(21, 'instruments', 'Quel instrument utilise la pression statique pour indiquer l’altitude ?', 'L’altimètre', ['L’anémomètre', 'Le compas', 'L’horizon artificiel'], 'L’altimètre est un baromètre gradué en altitude. Il n’utilise que la pression statique et le calage choisi.', { tags: ['altimètre', 'QNH', 'QFE'] }),
  choice(22, 'instruments', 'Quel instrument indique le taux de montée ou de descente ?', 'Le variomètre', ['L’altimètre', 'Le conservateur de cap', 'Le machmètre'], 'Le variomètre mesure la variation de pression statique et l’exprime généralement en pieds par minute.', { tags: ['variomètre', 'statique'] }),
  choice(23, 'aerodromes', 'Quel calage fait lire approximativement l’altitude du terrain lorsque l’avion est au sol ?', 'Le QNH', ['Le QFE', 'Le calage 1013', 'Le QFU'], 'Le QNH ramène la pression au niveau moyen de la mer : au sol, l’altimètre indique donc approximativement l’altitude du terrain.', { tags: ['QNH', 'altimètre'], categories: ['instruments'], trap: 'Au QFE, l’altimètre indique approximativement zéro au terrain.' }),
  choice(24, 'instruments', 'Quelle est la pression standard utilisée pour les niveaux de vol ?', '1013,25 hPa', ['1000 hPa', '1025 hPa', '760 hPa'], 'Au-dessus de l’altitude de transition, les altimètres sont calés sur 1013,25 hPa afin de conserver une référence commune.', { tags: ['altimètre', 'unités'] }),
  choice(25, 'aerodromes', 'Que signifie PAPI ?', 'Precision Approach Path Indicator', ['Primary Airport Position Indicator', 'Pilot Approach Position Instrument', 'Precision Airfield Path Instrument'], 'Le PAPI est une aide visuelle de pente d’approche composée généralement de quatre feux.', { tags: ['PAPI', 'balisage'] }),
  choice(26, 'aerodromes', 'Que signifie une indication PAPI avec 2 feux blancs et 2 feux rouges ?', 'L’avion est sur la pente nominale', ['L’avion est trop haut', 'L’avion est trop bas', 'La piste est fermée'], 'Deux blancs et deux rouges indiquent la pente correcte.', { tags: ['PAPI'], memoryTip: 'Deux blancs, deux rouges : tout va bien.' }),
  choice(27, 'aerodromes', 'Que signifie une indication PAPI avec 4 feux rouges ?', 'L’avion est trop bas', ['L’avion est trop haut', 'L’avion est sur la pente', 'Le vent est arrière'], 'Plus il y a de rouge, plus l’avion est sous la pente. Quatre rouges signalent une approche nettement trop basse.', { tags: ['PAPI'], memoryTip: 'Rouge = bas, blanc = haut.' }),
  choice(28, 'aerodromes', 'Que signifie VASIS ?', 'Visual Approach Slope Indicator System', ['Vertical Airspeed Safety Instrument System', 'Visual Aerodrome Signal Information Service', 'Variable Approach Speed Indication System'], 'Le VASIS fournit une indication visuelle de position par rapport au plan de descente, selon la même fonction générale que le PAPI.', { tags: ['VASIS', 'balisage'] }),
  choice(29, 'general-aviation', 'Quelle couleur de feu de navigation se trouve sur l’aile droite ?', 'Vert', ['Rouge', 'Blanc', 'Ambre'], 'Les feux de position sont vert à droite, rouge à gauche et blanc à l’arrière.', { tags: ['feux'], memoryTip: 'GREEN = RIGHT.' }),
  choice(30, 'general-aviation', 'Quelle couleur de feu de navigation se trouve sur l’aile gauche ?', 'Rouge', ['Vert', 'Blanc', 'Bleu'], 'Les feux de position sont rouge à gauche, vert à droite et blanc à l’arrière.', { tags: ['feux'], memoryTip: 'RED = LEFT.' }),
  choice(31, 'general-aviation', 'Qu’est-ce qu’un train classique ?', 'Deux roues principales en avant du centre de gravité et une roulette ou un patin de queue', ['Deux roues principales et une roulette de nez', 'Un train entièrement rentrant', 'Un train à quatre roues principales'], 'Le train classique place le troisième point à la queue, contrairement au train tricycle doté d’une roulette de nez.', { tags: ['aéronefs'] }),
  choice(32, 'commercial-aviation', 'Quelle différence simple distingue un turbofan d’un turbopropulseur ?', 'Le turbofan produit sa poussée avec un fan, le turbopropulseur entraîne une hélice', ['Le turbofan est à pistons', 'Le turbopropulseur ne possède pas de turbine', 'Le turbofan fonctionne sans compresseur'], 'Les deux utilisent une turbine à gaz. Le turbofan accélère un flux secondaire avec son fan ; le turbopropulseur transmet l’énergie à une hélice par un réducteur.', { tags: ['motorisation'] }),
  choice(33, 'weather', 'Qu’est-ce qu’un talweg ?', 'Un axe allongé de basses pressions', ['Un axe allongé de hautes pressions', 'Une ligne d’égale température', 'Un courant ascendant permanent'], 'Un talweg prolonge une zone dépressionnaire et s’accompagne souvent d’un temps plus perturbé ou instable.', { tags: ['talweg', 'pression'] }),
  choice(34, 'weather', 'Qu’est-ce qu’une dorsale météorologique ?', 'Un axe allongé de hautes pressions', ['Un axe allongé de basses pressions', 'Un front froid stationnaire', 'Une zone de brouillard côtier'], 'Une dorsale est une extension allongée d’un anticyclone, souvent associée à un temps plus stable.', { tags: ['pression'] }),
  choice(35, 'weather', 'Quel nuage est directement associé aux orages ?', 'Le cumulonimbus', ['Le cirrus', 'Le stratus', 'Le cumulus humilis'], 'Le cumulonimbus peut réunir turbulence sévère, fortes ascendances et descendances, grêle, foudre et givrage.', { tags: ['cumulonimbus', 'orages'], memoryTip: 'CB = danger, contourne largement.' }),
  choice(36, 'navigation', 'Que signifie « vent du 270° » ?', 'Un vent venant de l’ouest', ['Un vent allant vers l’ouest', 'Un vent venant de l’est', 'Un vent venant du nord'], '270° correspond à l’ouest. La direction du vent est celle d’où il vient.', { tags: ['vent', 'caps'] }),
  choice(37, 'weather', 'Dans l’hémisphère Nord, dans quel sens le vent tourne-t-il globalement autour d’une dépression ?', 'Dans le sens antihoraire', ['Dans le sens horaire', 'Toujours du nord au sud', 'Sans direction dominante'], 'Sous l’effet de Coriolis, la circulation autour des basses pressions est globalement antihoraire dans l’hémisphère Nord.', { tags: ['dépression', 'vent'] }),
  choice(38, 'weather', 'Qu’est-ce qu’un front froid ?', 'L’avancée d’air froid sous une masse d’air plus chaud', ['L’avancée d’air chaud sous une masse d’air froid', 'Une zone sans vent', 'Une ligne d’égale pression'], 'L’air froid, plus dense, s’insinue sous l’air chaud et peut provoquer des phénomènes brusques et convectifs.', { tags: ['fronts'] }),
  choice(39, 'weather', 'Quel est le danger aérodynamique principal du givrage sur une aile ?', 'Il dégrade le profil, augmente la traînée et réduit la portance', ['Il améliore la portance à basse vitesse', 'Il réduit uniquement la visibilité', 'Il augmente seulement la masse de carburant'], 'Même une faible contamination modifie le profil, augmente la traînée et peut relever fortement la vitesse de décrochage.', { tags: ['givrage'], categories: ['aerodynamics'] }),
  choice(40, 'regulations', 'Que caractérise un espace aérien de classe G ?', 'Il est non contrôlé', ['Il est réservé aux IFR', 'Il interdit le VFR', 'Il est contrôlé comme la classe C'], 'La classe G est l’espace non contrôlé. Des services d’information ou d’alerte peuvent exister, mais le repère demandé reste « non contrôlé ».', { tags: ['classe G', 'espaces aériens'] }),
  choice(41, 'training', 'Que signifie PPL ?', 'Private Pilot Licence', ['Professional Pilot Level', 'Public Pilot Licence', 'Private Passenger Licence'], 'La PPL est la licence de pilote privé.', { tags: ['PPL', 'licences'] }),
  numeric(42, 'training', 'Quel est l’âge minimal, en années, pour obtenir une PPL(A) ?', 17, 'L’âge minimal pour la délivrance d’une PPL(A) est de 17 ans.', { tags: ['PPL', 'licences'] }),
  numeric(43, 'training', 'Combien d’heures de formation en vol faut-il au minimum dans le cursus standard PPL(A) ?', 45, 'Le cursus standard PPL(A) prévoit au minimum 45 heures de formation en vol.', { tags: ['PPL', 'licences'] }),
  choice(44, 'training', 'Que signifie SPL ?', 'Sailplane Pilot Licence', ['Student Pilot Level', 'Sport Plane Licence', 'Single Pilot Licence'], 'La SPL est la licence européenne de pilote de planeur.', { tags: ['SPL', 'licences'] }),
  numeric(45, 'training', 'Quel est l’âge minimal, en années, pour obtenir une SPL ?', 16, 'L’âge minimal de délivrance d’une SPL est de 16 ans selon Part-SFCL.', { tags: ['SPL', 'licences'] }),
  choice(46, 'training', 'Que signifie MCC ?', 'Multi-Crew Cooperation', ['Minimum Crew Certification', 'Multi-Control Check', 'Managed Cockpit Course'], 'La MCC prépare au travail coordonné dans un cockpit multipilote.', { tags: ['MCC', 'formation pilote'] }),
  choice(47, 'training', 'Que signifie IR ?', 'Instrument Rating', ['International Rules', 'Instructor Record', 'Integrated Route'], 'L’IR est la qualification de vol aux instruments.', { tags: ['IR', 'formation pilote'] }),
  choice(48, 'training', 'Que signifie UPRT ?', 'Upset Prevention and Recovery Training', ['Universal Pilot Radio Training', 'Upper Performance Route Test', 'Unified Procedure Rating Training'], 'L’UPRT entraîne à prévenir et récupérer les pertes de contrôle et attitudes inusuelles.', { tags: ['UPRT', 'formation pilote'] }),
  numeric(49, 'air-france', 'En quelle année Air France a-t-elle été créée ?', 1933, 'Air France est créée le 30 août 1933 par regroupement de plusieurs compagnies françaises.', { tags: ['histoire Air France'] }),
  choice(50, 'air-france', 'Qui est la Directrice générale d’Air France au 29 août 2026 ?', 'Anne Rigail', ['Marjan Rintel', 'Florence Parly', 'Catherine Guillouard'], 'Anne Rigail dirige Air France depuis décembre 2018.', { tags: ['organisation', 'dirigeants'], timeSensitive: true }),
  choice(51, 'air-france', 'Qui est le Directeur général d’Air France-KLM au 29 août 2026 ?', 'Benjamin Smith', ['Alexandre de Juniac', 'Jean-Marc Janaillac', 'Pieter Elbers'], 'Benjamin Smith dirige le groupe Air France-KLM et préside le conseil d’administration d’Air France.', { tags: ['organisation', 'dirigeants'], timeSensitive: true }),
  choice(52, 'air-france', 'Quel est le hub principal d’Air France en 2026 ?', 'Paris-Charles de Gaulle', ['Paris-Orly', 'Amsterdam-Schiphol', 'Lyon-Saint-Exupéry'], 'Paris-CDG concentre le réseau de correspondances et l’essentiel du long-courrier Air France.', { tags: ['hubs'], categories: ['commercial-aviation'], timeSensitive: true }),
  numeric(53, 'air-france', 'Combien de pilotes Air France sont indiqués au 31 décembre 2025 ?', 4275, 'Le document préparatoire indique 4 275 pilotes Air France au 31 décembre 2025.', { tags: ['chiffres clés'], timeSensitive: true, difficulty: 2 }),
  numeric(54, 'air-france', 'Combien d’avions Air France et HOP! comptent-elles au total au 31 décembre 2025 ?', 268, 'Le total indiqué est de 268 appareils : 229 Air France hors HOP! et 39 HOP!.', { tags: ['flotte Air France'], categories: ['commercial-aviation'], timeSensitive: true, difficulty: 2 }),
  numeric(55, 'air-france', 'Combien d’A350-900 Air France possède-t-elle au 31 décembre 2025 ?', 41, 'La flotte Air France compte 41 Airbus A350-900 au 31 décembre 2025.', { tags: ['flotte Air France', 'A350'], categories: ['commercial-aviation'], timeSensitive: true }),
  choice(56, 'commercial-aviation', 'Quelle est l’envergure de l’Airbus A350-900 ?', '64,75 m', ['60,30 m', '66,80 m', '73,86 m'], 'L’A350-900 mesure 64,75 m d’envergure. 66,80 m correspond à sa longueur.', { tags: ['A350', 'unités'], highYield: false, trap: 'Ne confonds pas longueur 66,80 m et envergure 64,75 m.' }),
  choice(57, 'commercial-aviation', 'Quelle est la longueur de l’Airbus A350-900 ?', '66,80 m', ['64,75 m', '60,17 m', '73,86 m'], 'L’A350-900 mesure 66,80 m de long et 64,75 m d’envergure.', { tags: ['A350', 'unités'], highYield: false, trap: 'Ne confonds pas longueur 66,80 m et envergure 64,75 m.' }),
  choice(58, 'air-france', 'Quelle nouvelle destination américaine Air France a-t-elle ouverte en avril 2026 ?', 'Las Vegas', ['Phoenix', 'Austin', 'Seattle'], 'La liaison Paris-CDG–Las Vegas a ouvert le 15 avril 2026, trois fois par semaine en A350-900.', { tags: ['destinations', 'réseau'], categories: ['geography'], timeSensitive: true, difficulty: 2 }),
  choice(59, 'air-france', 'Combien de destinations environ Air France dessert-elle à l’été 2026 ?', 'Près de 170', ['Près de 90', 'Près de 240', 'Près de 320'], 'Le programme été 2026 annonce près de 170 destinations.', { tags: ['destinations', 'réseau'], timeSensitive: true, difficulty: 2 }),
  numeric(60, 'air-france', 'Dans combien de pays environ Air France dessert-elle des destinations à l’été 2026 ?', 73, 'Le programme été 2026 couvre 73 pays.', { tags: ['destinations', 'réseau'], timeSensitive: true, difficulty: 2 }),
  choice(61, 'air-france', 'Quelles compagnies ont cofondé SkyTeam avec Air France ?', 'Delta Air Lines, Aeromexico et Korean Air', ['KLM, Lufthansa et United', 'British Airways, Iberia et Qantas', 'Emirates, Etihad et Qatar Airways'], 'SkyTeam est fondée le 22 juin 2000 par Air France, Delta, Aeromexico et Korean Air.', { tags: ['SkyTeam'], categories: ['commercial-aviation'] }),
  numeric(62, 'air-france', 'En quelle année SkyTeam a-t-elle été fondée ?', 2000, 'SkyTeam est fondée le 22 juin 2000 par quatre compagnies, dont Air France.', { tags: ['SkyTeam'], categories: ['commercial-aviation'] }),
  numeric(63, 'commercial-aviation', 'Combien de membres actifs la page SkyTeam liste-t-elle au 29 août 2026 ?', 18, 'La page officielle liste 18 membres actifs, Aeroflot étant indiqué comme suspendu.', { tags: ['SkyTeam'], categories: ['air-france'], timeSensitive: true, difficulty: 2, highYield: false }),
  numeric(64, 'air-france', 'En quelle année le groupe Air France-KLM est-il né ?', 2004, 'Le rapprochement d’Air France et KLM donne naissance au groupe en 2004, les deux marques étant conservées.', { tags: ['histoire Air France', 'organisation'], categories: ['commercial-aviation'] }),
  choice(65, 'general-aviation', 'Quel pilote d’essai français est associé au premier vol du Concorde 001 ?', 'André Turcat', ['Jacqueline Auriol', 'Jean Mermoz', 'Roland Garros'], 'André Turcat commandait le premier vol du Concorde 001 en 1969.', { tags: ['Concorde', 'histoire'] }),
  numeric(66, 'general-aviation', 'En quelle année les vols commerciaux du Concorde ont-ils commencé ?', 1976, 'Air France et British Airways commencent les vols commerciaux du Concorde en 1976.', { tags: ['Concorde', 'histoire'] }),
  numeric(67, 'general-aviation', 'En quelle année Air France a-t-elle arrêté les vols commerciaux du Concorde ?', 2003, 'Le dernier vol commercial du Concorde chez Air France a lieu le 31 mai 2003.', { tags: ['Concorde', 'histoire'] }),
  choice(68, 'general-aviation', 'Quel avion pilotait Saint-Exupéry lors de sa disparition en 1944 ?', 'Un Lockheed F-5B, version de reconnaissance du P-38', ['Un Latécoère 28', 'Un Breguet XIV', 'Un Spitfire'], 'Saint-Exupéry disparaît lors d’une mission de reconnaissance en Lockheed F-5B, dérivé du P-38 Lightning.', { tags: ['Saint-Exupéry', 'histoire'], highYield: false, trap: 'Ses avions de l’Aéropostale sont célèbres, mais la disparition a lieu à bord d’un appareil militaire de reconnaissance.' }),
  choice(69, 'general-aviation', 'Qui réalise le premier vol motorisé contrôlé et soutenu en 1903 ?', 'Les frères Wright', ['Clément Ader', 'Louis Blériot', 'Charles Lindbergh'], 'Orville et Wilbur Wright réalisent le vol de référence à Kitty Hawk en décembre 1903.', { tags: ['histoire'] }),
  choice(70, 'general-aviation', 'Qui est le premier humain dans l’espace ?', 'Youri Gagarine', ['Neil Armstrong', 'Alan Shepard', 'Alexeï Leonov'], 'Youri Gagarine accomplit un tour de Terre à bord de Vostok 1.', { tags: ['espace'], highYield: false }),
  numeric(71, 'general-aviation', 'En quelle année Youri Gagarine devient-il le premier humain dans l’espace ?', 1961, 'Le vol de Vostok 1 a lieu le 12 avril 1961.', { tags: ['espace'], highYield: false }),
  choice(72, 'general-aviation', 'Quelle mission réalise le premier alunissage habité ?', 'Apollo 11', ['Apollo 8', 'Apollo 10', 'Apollo 13'], 'Apollo 11 se pose sur la Lune en juillet 1969 ; Neil Armstrong et Buzz Aldrin marchent sur sa surface.', { tags: ['espace'], highYield: false }),
  choice(73, 'geography', 'Quelle est la capitale du Vietnam ?', 'Hanoï', ['Hô Chi Minh-Ville', 'Da Nang', 'Phnom Penh'], 'Hanoï est la capitale du Vietnam. Hô Chi Minh-Ville est la plus grande ville du pays.', { tags: ['capitales'], trap: 'La ville la plus peuplée n’est pas la capitale.' }),
  choice(74, 'geography', 'Quelle est la latitude approximative de Johannesburg ?', '26° Sud', ['26° Nord', '5° Sud', '49° Sud'], 'Johannesburg se situe vers 26° de latitude Sud, un peu au sud du tropique du Capricorne.', { tags: ['latitudes'] }),
  choice(75, 'geography', 'Quel est le fuseau horaire de Singapour toute l’année ?', 'UTC+8', ['UTC+6', 'UTC+7', 'UTC+9'], 'Singapour utilise UTC+8 toute l’année et ne change pas d’heure.', { tags: ['heures', 'fuseaux'] }),
  choice(76, 'geography', 'Quel est le décalage de Singapour par rapport à Paris en été ?', '+6 heures', ['+5 heures', '+7 heures', '+8 heures'], 'Singapour est à UTC+8 et Paris à UTC+2 en été : Singapour a donc six heures d’avance.', { tags: ['heures', 'fuseaux'], trap: 'En hiver, Paris repasse à UTC+1 et l’écart devient +7 h.' }),
  choice(77, 'geography', 'Quels pays partagent une frontière terrestre avec la Colombie ?', 'Panama, Venezuela, Brésil, Pérou et Équateur', ['Panama, Costa Rica, Brésil, Pérou et Équateur', 'Venezuela, Guyana, Brésil, Bolivie et Pérou', 'Panama, Nicaragua, Venezuela, Brésil et Chili'], 'La Colombie touche cinq pays : Panama, Venezuela, Brésil, Pérou et Équateur.', { tags: ['pays'], difficulty: 2, highYield: false }),
  choice(78, 'geography', 'Quelle est la capitale du Canada ?', 'Ottawa', ['Toronto', 'Montréal', 'Vancouver'], 'Ottawa est la capitale fédérale du Canada ; Toronto est la ville la plus peuplée.', { tags: ['capitales'] }),
  choice(79, 'geography', 'Quelle est la capitale de l’Australie ?', 'Canberra', ['Sydney', 'Melbourne', 'Perth'], 'Canberra est la capitale fédérale, choisie comme compromis entre Sydney et Melbourne.', { tags: ['capitales'] }),
  choice(80, 'geography', 'Quelle est la capitale du Maroc ?', 'Rabat', ['Casablanca', 'Marrakech', 'Fès'], 'Rabat est la capitale politique du Maroc ; Casablanca est sa plus grande ville.', { tags: ['capitales'] }),
];
