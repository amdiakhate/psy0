import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';

const q = (question: string, answer: string, distractors: [string, string, string], explanation: string, tags: string[] = []): QuestionSeed => [question, answer, distractors, explanation, tags];
const topics: CultureTopicSeed[] = [
  { slug: 'cardinaux', title: 'Caps et points cardinaux', category: 'navigation', source: CULTURE_SOURCES.bia, takeaways: ['Nord 000°/360°, Est 090°.', 'Sud 180°, Ouest 270°.', 'Les directions intermédiaires sont espacées de 45°.'], memoryTip: 'N 000, E 090, S 180, W 270.', diagram: 'heading-rose', questions: [
    q('Quel cap correspond à l’est ?', '090°', ['000°', '180°', '270°'], 'L’est correspond au cap 090°.'),
    q('Quel point cardinal correspond au cap 225° ?', 'Sud-ouest', ['Sud-est', 'Nord-ouest', 'Ouest'], '225° se situe à mi-chemin entre le sud 180° et l’ouest 270°.'),
    q('Quel cap correspond au nord-ouest ?', '315°', ['045°', '135°', '225°'], 'Le nord-ouest correspond à 315°.'),
    q('Comment écrit-on conventionnellement le cap nord ?', '000°', ['090°', '180°', '359°'], 'Un cap est codé sur trois chiffres ; le nord s’écrit 000°.'),
    q('Quel point cardinal correspond au cap 135° ?', 'Sud-est', ['Nord-est', 'Sud-ouest', 'Nord-ouest'], '135° est à mi-chemin entre l’est et le sud.'),
    q('De combien de degrés deux points cardinaux principaux voisins sont-ils séparés ?', '90°', ['45°', '120°', '180°'], 'Nord, est, sud et ouest sont espacés de 90°.'),
  ]},
  { slug: 'qfu', title: 'QFU et orientation de piste', category: 'navigation', categories: ['aerodromes'], source: CULTURE_SOURCES.aip, takeaways: ['Le QFU est lié à l’orientation magnétique.', 'Le cap est arrondi à la dizaine.', 'Les deux sens diffèrent de 18.'], trap: 'Le numéro ne donne pas la direction du vent.', memoryTip: 'QFU × 10 ≈ cap.', diagram: 'qfu', questions: [
    q('Une piste orientée approximativement au 184° porte normalement quel numéro ?', '18', ['04', '14', '28'], '184° s’arrondit à 180°, puis on retire le zéro.'),
    q('Quel est le QFU réciproque de la piste 13 ?', '31', ['23', '30', '32'], 'Deux QFU opposés diffèrent de 18 : 13 + 18 = 31.'),
    q('Pourquoi une même piste physique possède-t-elle deux QFU ?', 'Elle peut être utilisée dans deux sens opposés', ['Elle change avec le QNH', 'Elle possède deux largeurs', 'Elle distingue jour et nuit'], 'Chaque sens d’utilisation possède une orientation opposée.'),
    q('Que signifie la lettre R dans 27R ?', 'La piste droite parmi des pistes parallèles', ['Une piste réservée', 'Une piste revêtue', 'Le sens retour'], 'R signifie Right lorsque plusieurs pistes sont parallèles.'),
    q('Un QFU 36 correspond approximativement à quelle orientation ?', '360°', ['036°', '180°', '270°'], 'Le numéro 36 représente le nord, soit environ 360°.'),
  ]},
  { slug: 'caps-reciproques', title: 'Caps réciproques', category: 'navigation', source: CULTURE_SOURCES.bia, takeaways: ['Un cap réciproque diffère de 180°.', 'On ajoute 180° sous 180°.', 'On retranche 180° à partir de 180°.'], memoryTip: 'Réciproque = ±180°.', questions: [
    q('Quel est le cap réciproque du 070° ?', '250°', ['110°', '180°', '290°'], 'Un cap réciproque diffère de 180° : 070° + 180° = 250°.'),
    q('Quel est le cap réciproque du 310° ?', '130°', ['050°', '140°', '230°'], 'Un cap réciproque diffère de 180° : 310° − 180° = 130°.'),
    q('Deux caps réciproques sont séparés de combien ?', '180°', ['90°', '270°', '360°'], 'Ils représentent exactement deux directions opposées.'),
    q('Quel couple représente deux caps réciproques ?', '095° et 275°', ['095° et 185°', '095° et 265°', '095° et 285°'], 'Ces deux caps sont opposés car 275° − 095° = 180°.'),
    q('Le cap réciproque de 180° est lequel ?', '000°', ['090°', '270°', '360° uniquement'], 'Le sud 180° est opposé au nord, noté 000° en cap.'),
  ]},
  { slug: 'vent', title: 'Direction du vent', category: 'navigation', source: CULTURE_SOURCES.bia, takeaways: ['Le vent est nommé par sa provenance.', 'Un vent 270° vient de l’ouest.', 'Un vent de face s’oppose au déplacement.'], trap: 'Ne lis pas la direction vers laquelle le vent se dirige.', questions: [
    q('Un vent du 045° vient de quelle direction générale ?', 'Du nord-est', ['Du sud-ouest', 'Du sud-est', 'Du nord-ouest'], '045° correspond au nord-est et indique la provenance.'),
    q('Vers où souffle un vent du 090° ?', 'Vers l’ouest', ['Vers l’est', 'Vers le nord', 'Vers le sud'], 'Il vient de l’est et se dirige donc vers l’ouest.'),
    q('Quelle composante augmente la distance de décollage en principe ?', 'Le vent arrière', ['Le vent de face', 'Un vent nul', 'La brise descendante uniquement'], 'Le vent arrière augmente la vitesse sol nécessaire pour atteindre la vitesse air de décollage.'),
    q('Un vent aligné sur le nez de l’avion est appelé comment ?', 'Vent de face', ['Vent traversier', 'Vent arrière', 'Vent catabatique'], 'Il arrive dans la direction opposée au déplacement.'),
    q('Un vent perpendiculaire à la piste produit principalement quelle composante ?', 'Une composante traversière', ['Une composante de face', 'Une composante arrière', 'Aucune composante'], 'À 90° de l’axe, le vent est traversier.'),
  ]},
  { slug: 'choix-piste', title: 'Vent et choix de piste', category: 'navigation', categories: ['aerodromes'], source: CULTURE_SOURCES.bia, takeaways: ['On privilégie le vent de face.', 'Comparer vent et orientation de piste.', 'Le sens opposé peut transformer vent arrière en vent de face.'], trap: 'Le meilleur QFU pointe vers la provenance du vent.', questions: [
    q('Avec un vent du 270°, quel sens privilégier sur une piste 09/27 ?', 'La piste 27', ['La piste 09', 'Les deux obligatoirement', 'Aucune'], 'La piste 27 pointe vers la provenance du vent et offre un vent de face.'),
    q('Avec un vent du 030°, quel QFU est le plus favorable entre 04 et 22 ?', '04', ['22', 'Les deux sont identiques', '18'], '040° est proche de 030° : la composante est principalement de face.'),
    q('Pourquoi décolle-t-on généralement face au vent ?', 'Pour atteindre la vitesse air avec une vitesse sol plus faible', ['Pour supprimer la portance', 'Pour augmenter la vitesse sol', 'Pour éviter tout roulis'], 'Le vent de face réduit la distance au sol nécessaire pour une même vitesse air.'),
    q('Quel écart vent-piste correspond à un vent purement traversier ?', '90°', ['0°', '45°', '180°'], 'À 90°, le vent est perpendiculaire à l’axe.'),
    q('Avec un vent du 180° sur une piste 18/36, quel sens donne un vent arrière ?', 'La piste 36', ['La piste 18', 'Les deux', 'Aucun'], 'En piste 36, l’avion se dirige vers le nord tandis que le vent vient du sud.'),
  ]},
  { slug: 'nord', title: 'Nord vrai et nord magnétique', category: 'navigation', source: CULTURE_SOURCES.bia, takeaways: ['Le nord vrai vise le pôle géographique.', 'Le nord magnétique est suivi par le compas.', 'La déclinaison sépare les deux références.'], trap: 'Cap vrai et cap magnétique ne sont pas toujours identiques.', questions: [
    q('Quelle référence suit directement un compas magnétique ?', 'Le nord magnétique', ['Le nord vrai', 'Le nord de la grille', 'Le nord du vent'], 'Le compas s’aligne sur le champ magnétique terrestre.'),
    q('Comment nomme-t-on l’angle entre nord vrai et nord magnétique ?', 'La déclinaison magnétique', ['La dérive', 'La déviation', 'L’incidence'], 'La déclinaison dépend du lieu et évolue lentement.'),
    q('Quel nord correspond à l’axe géographique de rotation terrestre ?', 'Le nord vrai', ['Le nord magnétique', 'Le nord compas', 'Le nord relatif'], 'Le nord vrai est la direction du pôle Nord géographique.'),
    q('Quelle erreur est propre aux influences magnétiques de l’aéronef sur le compas ?', 'La déviation', ['La déclinaison', 'La dérive', 'La précession'], 'La déviation vient des champs magnétiques à bord.'),
    q('Une route tracée sur une carte géographique est d’abord référencée à quel nord ?', 'Au nord vrai', ['Au nord compas', 'Au vent magnétique', 'Au QFU'], 'Les méridiens donnent la référence du nord vrai.'),
  ]},
  { slug: 'coordonnees', title: 'Latitude et longitude', category: 'navigation', categories: ['geography'], source: CULTURE_SOURCES.bia, takeaways: ['La latitude se mesure nord/sud de l’équateur.', 'La longitude se mesure est/ouest de Greenwich.', 'Les méridiens relient les pôles.'], questions: [
    q('Quelle coordonnée mesure l’écart au nord ou au sud de l’équateur ?', 'La latitude', ['La longitude', 'L’altitude', 'La déclinaison'], 'La latitude varie de 0° à 90° nord ou sud.'),
    q('Quelle ligne correspond à la latitude 0° ?', 'L’équateur', ['Greenwich', 'Le tropique du Cancer', 'Le méridien 180°'], 'L’équateur partage la Terre en hémisphères nord et sud.'),
    q('À quoi sert le méridien de Greenwich ?', 'Référence de longitude 0°', ['Référence de latitude 0°', 'Limite du cercle polaire', 'Référence d’altitude'], 'Les longitudes sont comptées vers l’est ou l’ouest depuis Greenwich.'),
    q('Comment appelle-t-on les demi-cercles reliant les deux pôles ?', 'Les méridiens', ['Les parallèles', 'Les isobares', 'Les orthodromies'], 'Tous les méridiens passent par les pôles.'),
    q('Les parallèles servent principalement à lire quelle coordonnée ?', 'La latitude', ['La longitude', 'Le cap magnétique', 'La hauteur'], 'Un parallèle relie les points de même latitude.'),
  ]},
  { slug: 'routes', title: 'Route, cap et dérive', category: 'navigation', source: CULTURE_SOURCES.bia, takeaways: ['La route décrit la trajectoire au sol.', 'Le cap décrit l’orientation du nez.', 'Le vent peut créer une dérive.'], trap: 'Cap et route ne coïncident pas forcément.', questions: [
    q('Quelle grandeur décrit la direction suivie sur le sol ?', 'La route', ['Le cap', 'L’assiette', 'L’incidence'], 'La route représente la trajectoire réelle ou prévue sur la surface terrestre.'),
    q('Quelle grandeur décrit l’orientation de l’axe longitudinal de l’avion ?', 'Le cap', ['La route sol', 'La pente', 'La latitude'], 'Le cap indique où pointe le nez de l’avion.'),
    q('Pourquoi le cap peut-il différer de la route ?', 'À cause de la dérive due au vent', ['À cause du QNH uniquement', 'À cause de la masse seule', 'À cause du balisage'], 'Un vent traversier déplace l’avion latéralement.'),
    q('Comment compense-t-on un vent traversier en navigation ?', 'En prenant une correction de dérive', ['En réglant le QFE', 'En sortant le train', 'En changeant de latitude'], 'Le pilote oriente le nez légèrement vers le vent.'),
    q('Sans vent, en vol stabilisé, quelle relation est normalement attendue ?', 'Le cap et la route coïncident approximativement', ['Ils diffèrent toujours de 90°', 'La route est opposée au cap', 'Le cap devient nul'], 'Sans dérive, l’orientation du nez et la trajectoire au sol s’alignent.'),
  ]},
  { slug: 'unites', title: 'Unités aéronautiques', category: 'navigation', categories: ['mental-math'], source: CULTURE_SOURCES.bia, takeaways: ['Le mille nautique mesure une distance.', 'Le nœud vaut un NM par heure.', 'Le pied est couramment utilisé en altitude.'], memoryTip: 'kt = NM/h.', questions: [
    q('Que représente un nœud ?', 'Un mille nautique par heure', ['Un kilomètre par heure', 'Un mille terrestre par minute', 'Un pied par seconde'], 'Le nœud est une unité de vitesse égale à 1 NM/h.'),
    q('Quelle distance vaut approximativement un mille nautique ?', '1 852 m', ['1 000 m', '1 609 m', '2 000 m'], 'Le mille nautique est défini à 1 852 mètres.'),
    q('Quelle unité est couramment utilisée pour l’altitude en aviation ?', 'Le pied', ['Le nœud', 'Le pascal', 'Le gallon'], 'Les altitudes sont généralement exprimées en pieds.'),
    q('Quelle unité abrégée NM désigne-t-elle ?', 'Le mille nautique', ['Le mille terrestre', 'Le nanomètre', 'Le nœud métrique'], 'NM signifie nautical mile.'),
    q('Quelle relation fondamentale relie vitesse, temps et distance ?', 'Distance = vitesse × temps', ['Distance = vitesse ÷ temps', 'Temps = vitesse × distance', 'Vitesse = temps ÷ distance'], 'Avec une vitesse en kt et un temps en heures, la distance est obtenue en NM.'),
  ]},
];

export const navigationContent = buildDomainContent('navigation', 'nav', topics, 21);
