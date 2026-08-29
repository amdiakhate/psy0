import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';
const q=(a:string,b:string,c:[string,string,string],d:string):QuestionSeed=>[a,b,c,d];
const V='2026-08-29';
const topics:CultureTopicSeed[]=[
  {slug:'histoire-af',title:'Histoire d’Air France',category:'air-france',source:CULTURE_SOURCES.document2026,takeaways:['Air France naît en 1933.','L’inauguration officielle a lieu au Bourget.','La compagnie cofonde SkyTeam en 2000.'],questions:[
    q('Quelle date correspond à la création d’Air France ?','30 août 1933',['7 octobre 1933','22 juin 2000','5 mai 2004'],'Air France est créée le 30 août 1933 par regroupement de compagnies françaises.'),
    q('Où Air France est-elle officiellement inaugurée en octobre 1933 ?','Au Bourget',['À Orly','À Roissy-CDG','À Toulouse-Blagnac'],'L’inauguration officielle a lieu au Bourget le 7 octobre 1933.'),
    q('Quel événement Air France célèbre-t-elle en 2026 à propos de Concorde ?','Les 50 ans du début du service commercial',['Les 25 ans du premier vol','Les 100 ans de la compagnie','Les 10 ans de SkyTeam'],'Le service commercial du Concorde commence en 1976.'),
    q('Quelle compagnie historique rejoint le regroupement à l’origine d’Air France ?','Air Orient',['Pan Am','British Airways','Lufthansa'],'Air Orient fait partie des compagnies constitutives mentionnées dans l’histoire officielle.'),
    q('En quelle année le Boeing 747 entre-t-il chez Air France ?','1970',['1958','1976','1988'],'Le Boeing 747 rejoint la flotte Air France en 1970.'),
  ]},
  {slug:'groupe',title:'Groupe Air France-KLM',category:'air-france',categories:['commercial-aviation'],source:CULTURE_SOURCES.document2026,takeaways:['Le groupe naît en 2004.','Air France et KLM conservent leurs marques.','Le groupe possède plusieurs compagnies complémentaires.'],questions:[
    q('Quel rapprochement donne naissance à Air France-KLM ?','Celui d’Air France et de KLM',['Celui d’Air France et Lufthansa','Celui de KLM et British Airways','Celui d’Air France et Emirates'],'Le groupe associe les deux compagnies française et néerlandaise.'),
    q('Après la création du groupe, que deviennent les marques Air France et KLM ?','Elles sont conservées',['Elles disparaissent immédiatement','Elles deviennent Transavia','Elles fusionnent sous le nom SkyTeam'],'Le groupe commun conserve les identités commerciales.'),
    q('En quelle année le groupe Air France-KLM naît-il ?','2004',['1998','2000','2009'],'Le rapprochement est réalisé en 2004.'),
    q('À quelle alliance Air France et KLM appartiennent-elles ?','SkyTeam',['Star Alliance','oneworld','Aucune alliance'],'Les deux compagnies sont membres de SkyTeam.'),
    q('Quelle activité distingue Air France-KLM de SkyTeam ?','Air France-KLM est un groupe de compagnies ; SkyTeam est une alliance',['Les deux sont la même société','SkyTeam possède tous les avions du groupe','Air France-KLM est un aéroport'],'Le groupe a une structure capitalistique, l’alliance organise une coopération entre compagnies.'),
  ]},
  {slug:'flotte-af',title:'Flotte Air France 2025',category:'air-france',categories:['commercial-aviation'],source:CULTURE_SOURCES.airFrance,verifiedAt:V,takeaways:['La flotte associe monocouloirs et long-courriers.','A220 et A350 participent au renouvellement.','HOP! exploite des Embraer.'],trap:'Les quantités exactes sont datées au 31 décembre 2025.',questions:[
    q('Quelle famille assure une partie du renouvellement moyen-courrier Air France au 31 décembre 2025 ?','L’Airbus A220-300',['Le Boeing 747-400','L’Airbus A380','Le Concorde'],'La flotte officielle vérifiée le 29 août 2026 recense l’A220-300 sur le moyen-courrier.'),
    q('Quels appareils HOP! exploite-t-elle dans le document au 31 décembre 2025 ?','Des Embraer 170 et 190',['Des Airbus A350 et A380','Des Boeing 777 et 787','Des ATR 42 uniquement'],'La flotte officielle vérifiée le 29 août 2026 indique les familles Embraer 170 et 190.'),
    q('Quel biréacteur long-courrier Airbus récent figure dans la flotte Air France ?','L’A350-900',['L’A340-600','L’A380-900','L’A300B2'],'La flotte officielle vérifiée le 29 août 2026 compte exactement 41 A350-900.'),
    q('Quelle famille Boeing long-courrier est la plus nombreuse chez Air France au 31 décembre 2025 ?','Le Boeing 777',['Le Boeing 747','Le Boeing 767','Le Boeing 737'],'La flotte officielle vérifiée le 29 août 2026 compte 61 Boeing 777 passagers, plus deux cargos 777-F.'),
    q('Combien d’appareils HOP! sont comptabilisés au total au 31 décembre 2025 ?','39',['29','36','49'],'La flotte officielle vérifiée le 29 août 2026 indique exactement 39 appareils HOP!, dont 36 en exploitation.'),
  ]},
  {slug:'reseau-af',title:'Réseau Air France été 2026',category:'air-france',categories:['geography','commercial-aviation'],source:CULTURE_SOURCES.airFrance,verifiedAt:V,takeaways:['CDG est le hub principal.','Le programme été 2026 approche 170 destinations.','Las Vegas ouvre en avril 2026.'],questions:[
    q('Depuis quel aéroport part la nouvelle liaison Air France vers Las Vegas en 2026 ?','Paris-Charles de Gaulle',['Paris-Orly','Lyon-Saint-Exupéry','Amsterdam-Schiphol'],'Le programme été 2026 vérifié le 29 août 2026 ouvre Paris-CDG–Las Vegas.'),
    q('À quelle fréquence la liaison Paris-CDG–Las Vegas est-elle annoncée ?','Trois fois par semaine',['Une fois par semaine','Une fois par jour','Deux fois par jour'],'Le programme vérifié le 29 août 2026 annonce exactement trois vols hebdomadaires.'),
    q('Quel avion dessert Las Vegas à l’ouverture de la ligne Air France ?','L’Airbus A350-900',['L’Airbus A220-300','L’Embraer 190','Le Boeing 737-800'],'Le programme été 2026 vérifié le 29 août 2026 prévoit l’A350-900.'),
    q('Combien de destinations américaines Las Vegas représente-t-elle alors pour Air France ?','La 19e',['La 9e','La 15e','La 26e'],'Air France la présente, dans le programme vérifié le 29 août 2026, comme sa 19e destination aux États-Unis.'),
    q('Quel aéroport concentre l’essentiel du long-courrier Air France en 2026 ?','Paris-Charles de Gaulle',['Paris-Orly','Nice-Côte d’Azur','Lille-Lesquin'],'Le réseau vérifié le 29 août 2026 est organisé autour du hub de Paris-CDG.'),
  ]},
  {slug:'transavia',title:'Transavia France',category:'air-france',categories:['commercial-aviation'],source:CULTURE_SOURCES.transavia,verifiedAt:V,takeaways:['Transavia est la compagnie loisirs à bas coûts du groupe.','Orly constitue sa base parisienne majeure.','Sa flotte est composée de monocouloirs.'],questions:[
    q('Quel positionnement occupe Transavia France dans le groupe Air France-KLM ?','Compagnie loisirs à bas coûts',['Compagnie cargo long-courrier','Alliance de compagnies','Constructeur aéronautique'],'Les pages officielles vérifiées le 29 août 2026 présentent Transavia comme la marque low-cost du groupe.'),
    q('Quel aéroport parisien est la base majeure de Transavia France ?','Paris-Orly',['Paris-Le Bourget','Paris-CDG uniquement','Beauvais-Tillé'],'Le réseau officiel vérifié le 29 août 2026 est fortement centré sur Orly.'),
    q('Quel type général d’appareils constitue la flotte Transavia ?','Des monocouloirs moyen-courriers',['Des quadriréacteurs long-courriers','Des avions cargo uniquement','Des planeurs'],'La flotte vérifiée le 29 août 2026 exploite des monocouloirs adaptés au court et moyen-courrier.'),
    q('À quel groupe appartient Transavia France ?','Air France-KLM',['Lufthansa Group','International Airlines Group','Emirates Group'],'Transavia France appartient au groupe Air France-KLM.'),
    q('Quelle activité Transavia complète-t-elle principalement ?','Le réseau loisirs court et moyen-courrier',['Le fret spatial','Les vols militaires','La construction de moteurs'],'Son modèle vise principalement les destinations loisirs en Europe et autour du bassin méditerranéen.'),
  ]},
  {slug:'skyteam-v3',title:'Alliance SkyTeam',category:'air-france',categories:['commercial-aviation'],source:CULTURE_SOURCES.skyTeam,verifiedAt:V,takeaways:['SkyTeam est fondée en 2000.','Air France fait partie des quatre fondateurs.','L’alliance mutualise réseau et services.'],questions:[
    q('Quel membre fondateur de SkyTeam est basé en Corée du Sud ?','Korean Air',['Japan Airlines','Singapore Airlines','Cathay Pacific'],'La liste officielle vérifiée le 29 août 2026 rappelle Korean Air parmi les quatre fondateurs.'),
    q('Quel membre fondateur de SkyTeam est basé au Mexique ?','Aeromexico',['Iberia','LATAM','Avianca'],'Aeromexico cofonde SkyTeam avec Air France, Delta et Korean Air.'),
    q('Quel membre fondateur de SkyTeam est basé aux États-Unis ?','Delta Air Lines',['United Airlines','American Airlines','Southwest Airlines'],'Delta fait partie des quatre fondateurs.'),
    q('Quel est l’objectif général d’une alliance comme SkyTeam ?','Étendre les correspondances et services entre compagnies partenaires',['Fusionner tous les avions sous une seule immatriculation','Remplacer les autorités aériennes','Construire des aéroports'],'L’alliance coordonne réseaux et avantages sans supprimer les compagnies.'),
    q('KLM fait-elle partie des quatre fondateurs de SkyTeam en 2000 ?','Non',['Oui, avec Lufthansa','Oui, à la place d’Air France','Non, car elle appartient à oneworld'],'KLM rejoint SkyTeam plus tard ; elle ne figure pas parmi les quatre fondateurs.'),
  ]},
  {slug:'service-concorde',title:'Air France, service et Concorde',category:'air-france',categories:['commercial-aviation','general-aviation'],source:CULTURE_SOURCES.document2026,relatedQuestionIds:['doc26-66'],takeaways:['Concorde entre en service commercial en 1976.','Air France arrête le service en 2003.','Le programme est franco-britannique.'],questions:[
    q('Quel jour a lieu le dernier vol commercial Concorde d’Air France ?','31 mai 2003',['25 juillet 2000','22 juin 2000','30 août 2003'],'Le dernier vol commercial Air France a lieu le 31 mai 2003.'),
    q('Quelle vitesse de croisière caractérise approximativement Concorde ?','Mach 2',['Mach 0,85','Mach 1 exactement','Mach 3,5'],'Concorde croise autour de Mach 2.'),
    q('Quels pays portent principalement le programme Concorde ?','La France et le Royaume-Uni',['La France et les États-Unis','Le Royaume-Uni et l’Allemagne','La France et le Canada'],'Concorde est un programme supersonique franco-britannique.'),
    q('Quel pilote commande le premier vol du Concorde 001 ?','André Turcat',['Jean Mermoz','Charles Lindbergh','Antoine de Saint-Exupéry'],'André Turcat commande le vol inaugural du prototype français en 1969.'),
  ]},
];
export const airFranceContent=buildDomainContent('air-france','af',topics,15);
