import type { CultureEntry } from '../types';

/**
 * Air France et le groupe.
 *
 * Le thème que l'examinateur pose pour vérifier une seule chose : es-tu allé
 * voir le site de l'entreprise à laquelle tu postules. Les chiffres bougent
 * d'une année sur l'autre — ceux qui portent `asOf` sont datés dans l'énoncé,
 * et il vaut mieux retenir l'ordre de grandeur que la décimale.
 */
export const airFrance: CultureEntry[] = [
  {
    id: 'af-creation-1933',
    theme: 'air-france',
    prompt: 'En quelle année Air France a-t-elle été créée ?',
    options: ['1933', '1919', '1945', '1948'],
    correct: 0,
    difficulty: 1,
    explain:
      "Le 30 août 1933, par fusion de plusieurs compagnies — dont Air Orient, Air Union, la CIDNA et les lignes Farman. Pierre Cot était alors ministre de l'Air.",
    asked: '2019',
  },
  {
    id: 'af-fusion-origine',
    theme: 'air-france',
    prompt: 'Air France est née de la fusion de plusieurs compagnies. Laquelle en faisait partie ?',
    options: ['Air Orient', 'Aéroports de Paris', 'Sabena', 'Swissair'],
    correct: 0,
    difficulty: 3,
    explain:
      "Air Orient, Air Union, la CIDNA et la Société générale de transport aérien (lignes Farman) forment l'ossature ; l'Aéropostale, en faillite, y est intégrée peu après.",
    asked: '2018',
  },
  {
    id: 'af-logo-hippocampe',
    theme: 'air-france',
    prompt: 'Quel était le logo d’origine d’Air France ?',
    options: ['Un hippocampe ailé', 'Une crevette rouge', 'Un aigle stylisé', 'Une étoile à cinq branches'],
    correct: 0,
    difficulty: 3,
    explain:
      "L'emblème vient d'Air Orient. Son surnom maison, « la crevette », a fait croire à beaucoup que c'en était une : c'est bien un hippocampe ailé.",
    asked: '2018',
  },
  {
    id: 'af-code-iata',
    theme: 'air-france',
    prompt: 'Quel est le code IATA d’Air France ?',
    options: ['AF', 'AFR', 'FR', 'AR'],
    correct: 0,
    difficulty: 2,
    explain:
      "Deux lettres pour l'IATA (AF), trois pour l'OACI (AFR), qui sert d'indicatif radio. FR est Ryanair, AR est Aerolíneas Argentinas.",
  },
  {
    id: 'af-hub-principal',
    theme: 'air-france',
    prompt: 'Quel est le hub principal d’Air France ?',
    options: ['Paris-Charles-de-Gaulle', 'Paris-Orly', 'Lyon-Saint-Exupéry', 'Amsterdam-Schiphol'],
    correct: 0,
    difficulty: 1,
    explain:
      "CDG concentre le long-courrier et les correspondances ; Orly sert surtout le réseau intérieur et les Antilles. Schiphol est le hub de KLM, l'autre pilier du groupe.",
  },
  {
    id: 'af-cdg-pistes',
    theme: 'air-france',
    prompt: 'Combien de pistes compte l’aéroport de Paris-Charles-de-Gaulle ?',
    options: ['Quatre', 'Deux', 'Trois', 'Cinq'],
    correct: 0,
    difficulty: 3,
    explain:
      'Deux doublets parallèles : deux pistes 08/26 au nord, deux pistes 09/27 au sud. Cette configuration permet de décoller et d’atterrir simultanément de chaque côté.',
    asked: '2018',
  },
  {
    id: 'af-ory-pistes',
    theme: 'air-france',
    prompt: 'Combien de pistes compte l’aéroport de Paris-Orly ?',
    options: ['Trois', 'Deux', 'Quatre', 'Une'],
    correct: 0,
    difficulty: 4,
    explain:
      'Une 06/24, une 08/26 et une 02/20, cette dernière très peu utilisée. Orly est en outre soumis à un couvre-feu nocturne et à un plafond de mouvements.',
    asked: '2018',
  },
  {
    id: 'af-skyteam',
    theme: 'air-france',
    prompt: 'À quelle alliance appartient Air France ?',
    options: ['SkyTeam', 'Star Alliance', 'oneworld', 'Vanilla Alliance'],
    correct: 0,
    difficulty: 1,
    explain:
      'Star Alliance est menée par Lufthansa et United, oneworld par British Airways et American. Air France a fondé SkyTeam.',
  },
  {
    id: 'af-skyteam-fondateurs',
    theme: 'air-france',
    prompt: 'Quelles compagnies ont fondé SkyTeam en 2000 ?',
    options: [
      'Aeroméxico, Air France, Delta et Korean Air',
      'Air France, KLM, Alitalia et Delta',
      'Air France, Lufthansa, Iberia et Delta',
      'Air France, British Airways, Delta et Qantas',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      'Quatre fondateurs en juin 2000, un par continent ou presque. KLM ne rejoindra l’alliance qu’après la fusion de 2004.',
    asked: '2018',
  },
  {
    id: 'af-klm-fusion',
    theme: 'air-france',
    prompt: 'En quelle année Air France et KLM ont-elles fusionné ?',
    options: ['2004', '1999', '2010', '1993'],
    correct: 0,
    difficulty: 3,
    explain:
      "La première grande consolidation transfrontalière du transport aérien européen. Les deux compagnies gardent leur marque, leur flotte et leur hub sous une holding commune.",
  },
  {
    id: 'af-dg-groupe',
    theme: 'air-france',
    prompt: 'Qui dirige le groupe Air France-KLM depuis 2018 ?',
    options: ['Benjamin Smith', 'Jean-Marc Janaillac', 'Alexandre de Juniac', 'Anne Rigail'],
    correct: 0,
    difficulty: 3,
    explain:
      "Venu d'Air Canada, il succède à Jean-Marc Janaillac, démissionnaire après l'échec d'un référendum interne. Anne Rigail dirige, elle, la compagnie Air France.",
    asked: '2019',
  },
  {
    id: 'af-dg-air-france',
    theme: 'air-france',
    prompt: 'Qui dirige la compagnie Air France depuis décembre 2018 ?',
    options: ['Anne Rigail', 'Florence Parly', 'Benjamin Smith', 'Marjan Rintel'],
    correct: 0,
    difficulty: 3,
    explain:
      "Première femme à la tête de la compagnie depuis sa création en 1933, après un parcours entièrement fait dans la maison. Marjan Rintel dirige KLM.",
  },
  {
    id: 'af-transavia',
    theme: 'air-france',
    prompt: 'Que représente Transavia dans le groupe Air France-KLM ?',
    options: [
      'La filiale à bas coûts, sur le court et moyen-courrier',
      'La filiale cargo',
      'La filiale de maintenance',
      'La filiale de formation des pilotes',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "Née aux Pays-Bas, déclinée en France depuis 2007. C'est le bras du groupe sur le loisir et le point-à-point, face à Ryanair et easyJet.",
  },
  {
    id: 'af-industries',
    theme: 'air-france',
    prompt: 'Que fait Air France Industries – KLM Engineering & Maintenance ?',
    options: [
      'La maintenance aéronautique, pour le groupe et pour des compagnies tierces',
      'La construction de pièces d’avion',
      'La formation des équipages',
      'La gestion des aéroports du groupe',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "C'est l'un des tout premiers acteurs mondiaux de la maintenance : un métier capitalistique, mais nettement moins cyclique que le transport de passagers.",
  },
  {
    id: 'af-concorde-af',
    theme: 'air-france',
    prompt: 'Combien de Concorde Air France a-t-elle exploités ?',
    options: ['Sept', 'Quatre', 'Douze', 'Deux'],
    correct: 0,
    difficulty: 4,
    explain:
      'Sept pour Air France, sept pour British Airways, sur vingt appareils construits prototypes compris. Leur retrait, en 2003, a clos l’ère du supersonique commercial.',
  },
  {
    id: 'af-a380-mise-en-service',
    theme: 'air-france',
    prompt: 'En quelle année Air France a-t-elle mis l’A380 en service ?',
    options: ['2009', '2005', '2013', '2007'],
    correct: 0,
    difficulty: 3,
    explain:
      "Premier vol commercial le 23 novembre 2009 vers New York. Air France a retiré le type en 2020, comme la plupart des opérateurs européens.",
    asked: '2018',
  },
  {
    id: 'af-a380-retrait',
    theme: 'air-france',
    prompt: 'Quand Air France a-t-elle définitivement retiré l’A380 de sa flotte ?',
    options: ['En 2020', 'En 2016', 'En 2024', 'Elle l’exploite toujours'],
    correct: 0,
    difficulty: 3,
    explain:
      "Le retrait, déjà programmé, a été précipité par la crise sanitaire. Un quadriréacteur de 500 places est très difficile à remplir de façon rentable hors des lignes les plus denses.",
  },
  {
    id: 'af-747-retrait',
    theme: 'air-france',
    prompt: 'Quand Air France a-t-elle retiré son dernier Boeing 747 passagers ?',
    options: ['En 2016', 'En 2003', 'En 2020', 'En 2010'],
    correct: 0,
    difficulty: 4,
    explain:
      "Vol d'adieu en janvier 2016, après plus de quarante ans de service. Le Jumbo a été remplacé par des biréacteurs plus économes : 777, 787, puis A350.",
  },
  {
    id: 'af-premier-jet',
    theme: 'air-france',
    prompt: 'Quel fut le premier avion à réaction exploité par Air France ?',
    options: ['Le De Havilland Comet', 'La Caravelle', 'Le Boeing 707', 'Le Concorde'],
    correct: 0,
    difficulty: 4,
    explain:
      "En 1953, mais pour peu de temps : les ruptures en vol du Comet l'ont cloué au sol. C'est la Caravelle, à partir de 1959, qui a vraiment installé le jet chez Air France.",
    asked: '2019',
  },
  {
    id: 'af-flotte-taille',
    theme: 'air-france',
    prompt: 'Fin 2025, de combien d’appareils se compose environ la flotte d’Air France ?',
    options: ['Environ 260', 'Environ 90', 'Environ 600', 'Environ 1 200'],
    correct: 0,
    difficulty: 4,
    explain:
      "Ordre de grandeur à retenir : environ 250 à 270 pour Air France seule, un peu moins de 200 pour KLM, autour de 140 pour Transavia — soit près de 600 pour le groupe.",
    asOf: 2025,
  },
  {
    id: 'af-groupe-flotte',
    theme: 'air-france',
    prompt: 'Fin 2025, quelle est la taille approximative de la flotte du groupe Air France-KLM ?',
    options: ['Environ 600 appareils', 'Environ 200 appareils', 'Environ 1 500 appareils', 'Environ 80 appareils'],
    correct: 0,
    difficulty: 4,
    explain:
      'Air France, KLM et Transavia réunies. C’est l’un des trois premiers groupes aériens européens, avec Lufthansa Group et IAG.',
    asOf: 2025,
  },
  {
    id: 'af-a220',
    theme: 'air-france',
    prompt: 'Quel appareil remplace progressivement les A318 et A319 sur le réseau court-courrier d’Air France ?',
    options: ["L'Airbus A220-300", "L'Embraer 195", 'Le Boeing 737 MAX', "L'ATR 72-600"],
    correct: 0,
    difficulty: 3,
    explain:
      "Conçu par Bombardier sous le nom de CSeries puis repris par Airbus. Air France en avait reçu son cinquantième fin 2025 : environ 20 % de carburant et de bruit en moins.",
  },
  {
    id: 'af-a350',
    theme: 'air-france',
    prompt: 'Quel appareil constitue le renouvellement du long-courrier Air France aux côtés du 787 ?',
    options: ["L'Airbus A350-900", "L'Airbus A380", 'Le Boeing 747-8', "L'Airbus A340-300"],
    correct: 0,
    difficulty: 3,
    explain:
      'Motorisé par le Rolls-Royce Trent XWB, il remplace les A340 et une partie des 777. Air France en avait reçu son quarantième fin 2025.',
  },
  {
    id: 'af-cargo',
    theme: 'air-france',
    prompt: 'Comment Air France transporte-t-elle l’essentiel de son fret ?',
    options: [
      'En soute des avions passagers, complétée par quelques appareils tout-cargo',
      'Uniquement par une flotte dédiée de gros-porteurs cargo',
      'Par sous-traitance intégrale à des transporteurs tiers',
      'Elle ne transporte pas de fret',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "Le fret en soute est presque du revenu marginal : l'avion part de toute façon. C'est pourquoi la disparition des vols passagers en 2020 a fait exploser le prix du fret aérien.",
  },
  {
    id: 'af-la-premiere',
    theme: 'air-france',
    prompt: 'Comment s’appelle la cabine la plus haut de gamme d’Air France sur long-courrier ?',
    options: ['La Première', 'Business Prestige', 'Le Club Affaires', 'Espace Premier'],
    correct: 0,
    difficulty: 3,
    explain:
      "Proposée sur un petit nombre de 777, au-dessus de Business, Premium Economy et Economy. C'est une vitrine de marque plus qu'un centre de profit.",
  },
  {
    id: 'af-flying-blue',
    theme: 'air-france',
    prompt: 'Comment s’appelle le programme de fidélité d’Air France-KLM ?',
    options: ['Flying Blue', 'Miles & More', 'SkyMiles', 'Executive Club'],
    correct: 0,
    difficulty: 2,
    explain:
      "Miles & More est celui de Lufthansa, SkyMiles celui de Delta, Executive Club celui de British Airways. Ces programmes pèsent lourd au bilan d'un groupe aérien.",
  },
  {
    id: 'af-cadets-filiere',
    theme: 'air-france',
    prompt: 'Que propose la filière Cadets d’Air France ?',
    options: [
      'Une formation de pilote de ligne financée, débouchant sur un poste dans le groupe',
      'Un stage d’observation en cabine',
      'Une bourse pour financer un PPL',
      'Un contrat de mécanicien avion en alternance',
    ],
    correct: 0,
    difficulty: 2,
    explain:
      "C'est la voie d'accès sans expérience préalable de pilotage : la sélection remplace le diplôme. D'où l'exigence des présélections — dont l'épreuve de culture aéronautique.",
  },
  {
    id: 'af-orly-reseau',
    theme: 'air-france',
    prompt: 'Quel type de réseau Air France opère-t-elle principalement depuis Orly ?',
    options: [
      'Le réseau intérieur et les Antilles-Guyane-océan Indien',
      "Le long-courrier vers l'Asie",
      'Le fret exclusivement',
      'Les vols charters saisonniers',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "CDG concentre les correspondances internationales ; Orly, plus proche de Paris mais contraint par son couvre-feu, sert le point-à-point et l'outre-mer.",
  },
  {
    id: 'af-devise-marque',
    theme: 'air-france',
    prompt: 'Quelle signature de marque Air France utilise-t-elle depuis 2014 ?',
    options: [
      'France is in the air',
      'Faire du ciel le plus bel endroit de la terre',
      'Winning the hearts of the world',
      'L’élégance en vol',
    ],
    correct: 0,
    difficulty: 4,
    explain:
      "« Faire du ciel le plus bel endroit de la terre » fut la signature de 1999 à 2014 ; « France is in the air » lui a succédé. Les deux ont existé, mais pas à la même époque — le piège est là.",
  },
  {
    id: 'af-klm-marques',
    theme: 'air-france',
    prompt: 'Que sont devenues les marques Air France et KLM après la fusion ?',
    options: [
      'Elles ont été conservées, chacune avec sa flotte et son hub',
      'Elles ont fusionné sous une marque unique',
      'KLM est devenue une filiale régionale d’Air France',
      'KLM a été revendue en 2010',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Deux compagnies, deux hubs, une holding. Ce modèle a été copié par IAG (British Airways, Iberia, Vueling) et par Lufthansa Group.",
  },
  {
    id: 'af-doublet-hub',
    theme: 'air-france',
    prompt: 'Qu’est-ce qu’un hub, dans le modèle d’Air France ?',
    options: [
      'Un aéroport où les vols sont organisés en vagues pour maximiser les correspondances',
      'Un aéroport possédé par la compagnie',
      'Une base de maintenance lourde',
      'Un terminal réservé aux passagers affaires',
    ],
    correct: 0,
    difficulty: 3,
    explain:
      "Les arrivées se concentrent, puis les départs repartent en bloc. Cela remplit des lignes qui ne tiendraient jamais en point-à-point — au prix d'une vulnérabilité aux retards en chaîne.",
  },
];
