import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';

const q = (a: string, b: string, c: [string, string, string], d: string, e: string[] = []): QuestionSeed => [a, b, c, d, e];
const topics: CultureTopicSeed[] = [
  { slug: 'atmosphere-isa', title: 'Atmosphère et ISA', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['La troposphère contient l’essentiel des phénomènes météo.', 'Température et pression diminuent généralement avec l’altitude.', 'ISA fournit une atmosphère de référence.'], trap: 'Une inversion peut faire augmenter la température avec l’altitude.', questions: [
    q('Dans quelle couche se produisent la plupart des phénomènes météorologiques ?', 'La troposphère', ['La stratosphère', 'La mésosphère', 'La thermosphère'], 'La troposphère est la couche basse où se concentre la vapeur d’eau.'),
    q('Quelle température ISA règne au niveau moyen de la mer ?', '15 °C', ['0 °C', '10 °C', '25 °C'], 'L’atmosphère standard ISA prend 15 °C au niveau moyen de la mer.'),
    q('Comment évolue généralement la pression quand l’altitude augmente ?', 'Elle diminue', ['Elle augmente', 'Elle reste constante', 'Elle devient immédiatement nulle'], 'La masse d’air située au-dessus devient plus faible.'),
    q('Qu’est-ce qu’une inversion de température ?', 'Une couche où la température augmente avec l’altitude', ['Une chute brutale de pression', 'Un changement de direction du vent', 'Une couche sans humidité'], 'Elle inverse le profil thermique habituel de la troposphère.'),
    q('Pourquoi utilise-t-on ISA ?', 'Pour disposer d’une référence commune de calcul et de comparaison', ['Pour prévoir exactement chaque orage', 'Pour mesurer le vent réel', 'Pour remplacer le QNH local'], 'ISA est un modèle conventionnel, pas la météo réelle.'),
  ]},
  { slug: 'pression', title: 'Pression, dépressions et anticyclones', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['Anticyclone : hautes pressions.', 'Dépression : basses pressions.', 'Les isobares relient les pressions égales.'], memoryTip: 'A haut, D bas.', questions: [
    q('Que relie une isobare ?', 'Les points de même pression', ['Les points de même température', 'Les points de même altitude', 'Les vents de même direction'], 'Une isobare est une ligne d’égale pression.'),
    q('Quel système correspond à un centre de hautes pressions ?', 'Un anticyclone', ['Une dépression', 'Un talweg', 'Un front occlus'], 'Un anticyclone est organisé autour de pressions relativement élevées.'),
    q('Que suggèrent des isobares très resserrées ?', 'Un fort gradient de pression et souvent davantage de vent', ['Une absence certaine de vent', 'Une température constante', 'Un brouillard obligatoire'], 'Le vent tend à être plus fort lorsque le gradient horizontal est marqué.'),
    q('Dans l’hémisphère Nord, le vent tourne globalement comment autour d’un anticyclone ?', 'Dans le sens horaire', ['Dans le sens antihoraire', 'Toujours vers le sud', 'Sans organisation'], 'La circulation anticyclonique est globalement horaire dans l’hémisphère Nord.'),
    q('Quelle situation est souvent associée à la subsidence ?', 'Un anticyclone', ['Un front froid actif', 'Un cumulonimbus', 'Une convergence dépressionnaire'], 'L’air descendant favorise souvent la stabilité, sans garantir un ciel clair.'),
  ]},
  { slug: 'vent-aerologie', title: 'Vent et aérologie', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['Le vent naît notamment du gradient de pression.', 'La brise de mer souffle de la mer vers la terre le jour.', 'Le relief peut créer ascendances et rabattants.'], questions: [
    q('Quelle force met initialement l’air en mouvement horizontal ?', 'La force de gradient de pression', ['La portance', 'La poussée', 'La force centrifuge de l’avion'], 'L’air est accéléré des hautes vers les basses pressions.'),
    q('Le jour, une brise de mer souffle généralement comment ?', 'De la mer vers la terre', ['De la terre vers la mer', 'Du sommet vers la vallée uniquement', 'Toujours d’ouest en est'], 'La terre se réchauffe plus vite et favorise une circulation depuis la mer.'),
    q('Quel mouvement trouve-t-on souvent au vent d’un relief ?', 'Une ascendance', ['Un rabattant systématique', 'Une inversion obligatoire', 'Une subsidence sans turbulence'], 'L’air forcé à franchir le relief s’élève sur le versant au vent.'),
    q('Quel danger peut se trouver sous le vent d’un relief ?', 'Des rabattants et de la turbulence', ['Une pression constante', 'Un vent toujours nul', 'Une portance accrue garantie'], 'L’écoulement peut devenir turbulent et descendant derrière la crête.'),
    q('Comment se nomme un vent descendant une pente par refroidissement nocturne ?', 'Un vent catabatique', ['Un vent anabatique', 'Une brise de mer', 'Un courant-jet'], 'L’air froid et dense s’écoule vers le bas de la pente.'),
  ]},
  { slug: 'front-chaud', title: 'Front chaud', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['L’air chaud glisse sur l’air froid.', 'La pente frontale est généralement douce.', 'Les nuages sont souvent stratiformes et étendus.'], questions: [
    q('Que fait l’air chaud à l’approche d’un front chaud ?', 'Il glisse progressivement au-dessus de l’air froid', ['Il passe brutalement sous l’air froid', 'Il descend verticalement', 'Il supprime toute humidité'], 'L’air chaud, moins dense, remonte sur la masse froide.'),
    q('Quel type de nuages domine souvent à un front chaud ?', 'Des nuages stratiformes étendus', ['Uniquement des cumulus humilis', 'Aucun nuage', 'Seulement des nuages lenticulaires'], 'Le soulèvement progressif favorise une succession de couches nuageuses.'),
    q('Quel caractère ont souvent les précipitations d’un front chaud ?', 'Étendues et relativement continues', ['Toujours sèches', 'Uniquement sous forme de grêle', 'Très localisées sans nuage'], 'Le soulèvement doux couvre une large zone.'),
    q('Par rapport à un front froid actif, la pente d’un front chaud est généralement comment ?', 'Plus faible', ['Plus forte', 'Strictement verticale', 'Toujours identique'], 'L’air chaud remonte progressivement sur l’air froid.'),
    q('Quel symbole cartographique représente généralement un front chaud ?', 'Une ligne avec des demi-cercles', ['Une ligne avec des triangles', 'Une ligne pointillée jaune', 'Un cercle autour d’un H'], 'Les demi-cercles pointent vers la progression du front chaud.'),
  ]},
  { slug: 'front-froid-occlusion', title: 'Front froid et occlusion', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['L’air froid s’insère sous l’air chaud.', 'Les phénomènes peuvent être brusques et convectifs.', 'Une occlusion naît quand le front froid rattrape le front chaud.'], questions: [
    q('Quel mécanisme définit un front froid ?', 'L’air froid progresse sous l’air plus chaud', ['L’air chaud progresse sous l’air froid', 'Deux masses chaudes se séparent', 'La pression devient uniforme'], 'L’air froid, plus dense, soulève l’air chaud.'),
    q('Quels phénomènes accompagnent souvent un front froid actif ?', 'Averses, grains et convection', ['Ciel clair garanti', 'Uniquement du cirrus sans précipitation', 'Absence totale de turbulence'], 'Le soulèvement rapide peut déclencher une convection marquée.'),
    q('Qu’est-ce qu’une occlusion ?', 'Le rattrapage du front chaud par le front froid', ['La disparition du vent', 'Une dorsale thermique', 'Un brouillard côtier'], 'Le secteur chaud est alors soulevé du sol.'),
    q('Quel symbole représente généralement un front froid ?', 'Une ligne avec des triangles', ['Une ligne avec des demi-cercles', 'Une ligne de H', 'Un trait sans symbole'], 'Les triangles indiquent la direction de déplacement du front froid.'),
    q('Après le passage d’un front froid, la température évolue généralement comment ?', 'Elle baisse', ['Elle augmente fortement', 'Elle reste toujours identique', 'Elle devient ISA exactement'], 'Le front introduit une masse d’air plus froide.'),
  ]},
  { slug: 'nuages', title: 'Familles de nuages', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['Cirrus : élevés et glacés.', 'Stratus : couche basse uniforme.', 'Cumulus : développement convectif.'], questions: [
    q('Quel nuage forme souvent une couche basse uniforme ?', 'Le stratus', ['Le cirrus', 'Le cumulonimbus', 'L’altocumulus lenticulaire'], 'Le stratus est un nuage bas en nappe.'),
    q('Quel nuage élevé est principalement constitué de cristaux de glace ?', 'Le cirrus', ['Le stratus', 'Le cumulus humilis', 'Le brouillard'], 'Le cirrus se développe à haute altitude et présente un aspect fibreux.'),
    q('Quelle famille traduit typiquement une convection verticale ?', 'Les cumulus', ['Les stratus uniquement', 'Les cirrus uniquement', 'Les brouillards'], 'Les cumulus naissent de mouvements ascendants convectifs.'),
    q('Quel nuage est souvent associé à une pluie continue étendue ?', 'Le nimbostratus', ['Le cirrus', 'Le cumulus humilis', 'Le lenticulaire'], 'Le nimbostratus est une couche épaisse donnant des précipitations durables.'),
    q('Que signifie le préfixe « alto » dans un nom de nuage ?', 'Un étage moyen', ['Un nuage très élevé uniquement', 'Un nuage au sol', 'Un nuage orageux'], 'Altostratus et altocumulus appartiennent à l’étage moyen.'),
  ]},
  { slug: 'cumulonimbus', title: 'Cumulonimbus et orages', category: 'weather', source: CULTURE_SOURCES.meteoFrance, takeaways: ['Le CB concentre turbulence, foudre et grêle.', 'Les courants verticaux peuvent être violents.', 'Il faut le contourner largement.'], trap: 'Ne jamais compter sur un passage sous l’enclume.', memoryTip: 'CB = contourne.', questions: [
    q('Quel nuage porte l’abréviation CB ?', 'Le cumulonimbus', ['Le cumulostratus', 'Le cirrostratus', 'Le nimbostratus'], 'CB est l’abréviation aéronautique de cumulonimbus.'),
    q('Quel phénomène n’est pas typiquement associé au cumulonimbus ?', 'Une atmosphère uniformément calme', ['La grêle', 'La foudre', 'De fortes ascendances'], 'Un CB est un environnement convectif dangereux.'),
    q('Pourquoi l’enclume d’un CB reste-t-elle dangereuse ?', 'Elle peut contenir glace, turbulence et décharges électriques', ['Elle garantit de l’air calme', 'Elle bloque tout vent', 'Elle indique la fin certaine de l’orage'], 'Les dangers s’étendent au-delà du cœur sombre visible.'),
    q('Quelle conduite générale adopter face à un CB ?', 'Le contourner largement', ['Le traverser sous sa base', 'Le survoler avec un avion léger', 'Le suivre au plus près'], 'L’évitement est la protection principale.'),
    q('Quel mouvement domine dans la phase de développement d’un orage ?', 'De fortes ascendances', ['Seulement des descendances', 'Aucun mouvement vertical', 'Un vent horizontal nul'], 'La cellule croît grâce aux courants ascendants.'),
  ]},
  { slug: 'givrage', title: 'Givrage', category: 'weather', categories: ['aerodynamics', 'instruments'], source: CULTURE_SOURCES.meteoFrance, takeaways: ['L’eau surfondue peut geler à l’impact.', 'Le givre dégrade portance et traînée.', 'Pitot, hélices et entrées d’air peuvent être touchés.'], questions: [
    q('Quelle eau favorise le givrage en vol ?', 'Des gouttelettes surfondues', ['Uniquement de la vapeur sèche', 'De l’eau toujours au-dessus de 30 °C', 'De la glace au sol uniquement'], 'Les gouttelettes liquides sous 0 °C gèlent au contact de l’avion.'),
    q('Quel effet aérodynamique produit le givre sur une aile ?', 'Il réduit la portance et augmente la traînée', ['Il augmente toujours la portance', 'Il réduit la masse', 'Il polit le profil'], 'La contamination déforme le profil et perturbe l’écoulement.'),
    q('Quel instrument peut devenir faux si le Pitot est obstrué par la glace ?', 'L’anémomètre', ['Le compas magnétique', 'L’horloge', 'L’indicateur de virage uniquement'], 'L’anémomètre dépend de la pression totale fournie par le Pitot.'),
    q('Pourquoi le poids n’est-il pas le seul danger du givrage ?', 'La forme du profil est également dégradée', ['Le givre ne pèse rien', 'Il améliore la finesse', 'Il ne touche que la peinture'], 'Une faible quantité de glace peut fortement altérer l’aérodynamique.'),
    q('Que fait généralement la vitesse de décrochage avec une aile givrée ?', 'Elle augmente', ['Elle diminue', 'Elle devient nulle', 'Elle reste toujours identique'], 'La perte d’efficacité du profil impose une vitesse plus élevée.'),
  ]},
  { slug: 'brouillard', title: 'Brouillard et visibilité', category: 'weather', source: CULTURE_SOURCES.meteoFrance, relatedQuestionIds: ['doc26-34'], takeaways: ['Le brouillard est un nuage au sol.', 'Le rayonnement nocturne peut refroidir le sol.', 'L’advection apporte de l’air humide sur une surface froide.'], questions: [
    q('Qu’est-ce que le brouillard du point de vue physique ?', 'Un nuage au contact du sol', ['Une pluie sans nuage', 'Un vent très faible', 'Une inversion sans humidité'], 'Il est constitué de fines gouttelettes réduisant la visibilité près du sol.'),
    q('Quand le brouillard de rayonnement se forme-t-il volontiers ?', 'Pendant une nuit claire avec vent faible et sol humide', ['En plein midi avec vent fort', 'Sous un front froid très turbulent uniquement', 'Dans de l’air parfaitement sec'], 'Le sol se refroidit par rayonnement et refroidit l’air voisin jusqu’à saturation.'),
    q('Quel mécanisme caractérise le brouillard d’advection ?', 'De l’air humide se déplace sur une surface plus froide', ['Le sol chauffe brutalement', 'Un air sec descend une montagne', 'La pression standard augmente'], 'Le refroidissement de l’air humide conduit à la saturation.'),
    q('Quel paramètre opérationnel le brouillard dégrade-t-il directement ?', 'La visibilité horizontale', ['La masse maximale', 'Le nombre de QFU', 'La fréquence radio'], 'Le brouillard masque les repères visuels.'),
  ]},
];

export const weatherContent = buildDomainContent('weather', 'met', topics, 19);
