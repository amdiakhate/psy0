import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';
const q = (a:string,b:string,c:[string,string,string],d:string):QuestionSeed=>[a,b,c,d];
const topics: CultureTopicSeed[] = [
  { slug:'forces', title:'Les quatre forces', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['Portance et poids s’opposent verticalement.','Poussée et traînée s’opposent longitudinalement.','En palier stabilisé, les forces s’équilibrent.'], diagram:'forces', questions:[
    q('Quelle force aérodynamique s’oppose principalement au poids ?','La portance',['La poussée','La traînée','La dérive'],'La portance agit globalement vers le haut et équilibre le poids en palier.'),
    q('Quelle force s’oppose à l’avancement dans l’air ?','La traînée',['La portance','Le poids','La poussée'],'La traînée est dirigée à l’opposé du mouvement relatif.'),
    q('En vol rectiligne horizontal stabilisé, quelle relation verticale est vraie ?','Portance égale au poids',['Portance supérieure au poids','Traînée égale au poids','Poussée nulle'],'Sans accélération verticale, portance et poids s’équilibrent.'),
    q('Quelle force fournit le moteur ou l’hélice ?','La poussée',['La portance','Le poids','La traînée induite'],'Le système propulsif fournit la force d’avancement.'),
    q('En palier à vitesse constante, quelle relation longitudinale est vraie ?','Poussée égale à la traînée',['Poussée égale au poids','Traînée nulle','Portance égale à la poussée'],'Sans accélération longitudinale, poussée et traînée s’équilibrent.'),
    q('Quelle force dépend directement de la gravité et de la masse ?','Le poids',['La portance','La poussée','La traînée'],'Le poids est la force gravitationnelle appliquée à la masse.'),
  ]},
  { slug:'portance-incidence', title:'Portance et incidence', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['La portance dépend notamment de la vitesse et de la densité.','L’incidence est l’angle corde/vent relatif.','La portance croît avec l’incidence jusqu’au domaine du décrochage.'], trap:'Incidence et assiette ne sont pas synonymes.', questions:[
    q('Entre quelles directions mesure-t-on l’angle d’incidence ?','La corde du profil et le vent relatif',['L’horizon et le fuselage','Le nord vrai et le nord magnétique','La piste et le vent'],'L’incidence, ou angle d’attaque, compare la corde au vent relatif.'),
    q('Si la vitesse augmente à configuration identique, que fait généralement la portance ?','Elle augmente',['Elle diminue toujours','Elle devient nulle','Elle ne dépend jamais de la vitesse'],'La portance varie notamment avec le carré de la vitesse.'),
    q('Quel paramètre atmosphérique intervient dans la portance ?','La densité de l’air',['La longitude','Le QFU','La couleur du balisage'],'Un air plus dense produit davantage de force aérodynamique à conditions égales.'),
    q('Que trouve-t-on en général sur l’extrados d’une aile porteuse ?','Une pression plus faible que sur l’intrados',['Une pression toujours identique','Une pression plus forte sans exception','Aucun écoulement'],'La répartition de pression contribue à la portance.'),
    q('Quelle différence distingue incidence et assiette ?','L’incidence se réfère au vent relatif, l’assiette à l’horizon',['Elles sont toujours identiques','L’assiette se réfère au nord','L’incidence mesure le roulis'],'Le vent relatif peut ne pas être parallèle à l’horizon.'),
    q('Que devient d’abord le coefficient de portance quand l’incidence augmente avant l’angle critique ?','Il augmente',['Il devient nul','Il diminue nécessairement','Il ne varie jamais'],'Avant le décrochage, une incidence accrue augmente généralement le coefficient de portance.'),
  ]},
  { slug:'decrochage', title:'Décrochage', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['Le décrochage dépend de l’incidence critique.','Il peut survenir à toute assiette.','La contamination et le facteur de charge augmentent le risque.'], questions:[
    q('Quelle grandeur déclenche directement le décrochage aérodynamique ?','Le dépassement de l’incidence critique',['Une altitude précise','Une assiette de 10°','Une vitesse sol donnée'],'Le décrochage est défini par l’angle d’attaque critique.'),
    q('Un avion peut-il décrocher nez sous l’horizon ?','Oui, si l’incidence critique est dépassée',['Non, jamais','Seulement au sol','Seulement train sorti'],'L’assiette ne détermine pas seule l’incidence.'),
    q('Quelle action constitue la priorité pour sortir d’un décrochage ?','Réduire l’incidence',['Augmenter encore l’incidence','Couper toutes les commandes','Braquer les ailerons à fond'],'Il faut rétablir un écoulement attaché en diminuant l’angle d’attaque.'),
    q('Quel signe peut annoncer l’approche du décrochage ?','Des vibrations ou le buffet aérodynamique',['Une vitesse sol élevée uniquement','Un compas parfaitement stable','Une hausse du QNH'],'La séparation progressive de l’écoulement peut provoquer des vibrations.'),
    q('Une aile contaminée décroche généralement à quelle vitesse ?','À une vitesse plus élevée',['À une vitesse plus faible','Toujours à la même vitesse','Uniquement à Mach 1'],'La contamination dégrade le coefficient de portance maximal.'),
  ]},
  { slug:'trainee', title:'Traînée et finesse', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['La traînée parasite croît avec la vitesse.','La traînée induite est forte à basse vitesse.','La finesse compare portance et traînée.'], questions:[
    q('Quelle traînée domine davantage à grande vitesse ?','La traînée parasite',['La traînée induite','La portance','Le poids'],'La traînée parasite croît fortement avec la vitesse.'),
    q('Quelle traînée est liée à la production de portance ?','La traînée induite',['La traînée de forme uniquement','La poussée résiduelle','Le poids apparent'],'La différence de pression et les vortex associés à la portance créent cette traînée.'),
    q('À basse vitesse en palier, pourquoi la traînée induite augmente-t-elle ?','Il faut davantage d’incidence pour produire la portance',['La densité devient nulle','Le train se rentre','La masse disparaît'],'Une incidence plus forte renforce les effets induits.'),
    q('Que représente la finesse aérodynamique ?','Le rapport portance sur traînée',['Le rapport poids sur masse','Le rapport vitesse sur altitude','Le rapport poussée sur carburant'],'Une finesse élevée traduit une bonne efficacité aérodynamique.'),
    q('Quel dispositif augmente nettement la traînée à l’atterrissage ?','Les volets sortis',['Le compas','Le Pitot chauffé','Le phare de roulage'],'Les volets augmentent portance mais aussi traînée.'),
  ]},
  { slug:'axes-commandes', title:'Axes et commandes de vol', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['Roulis autour de l’axe longitudinal.','Tangage autour de l’axe transversal.','Lacet autour de l’axe vertical.'], memoryTip:'Ailerons roulis, profondeur tangage, direction lacet.', questions:[
    q('Autour de quel axe s’effectue le roulis ?','L’axe longitudinal',['L’axe transversal','L’axe vertical','L’axe magnétique'],'L’axe longitudinal va du nez à la queue.'),
    q('Quelle gouverne commande le tangage ?','La gouverne de profondeur',['Les ailerons','La gouverne de direction','Les spoilers uniquement'],'La profondeur fait pivoter l’avion autour de l’axe transversal.'),
    q('Quelle commande actionne principalement la gouverne de direction ?','Le palonnier',['Le manche en roulis','La manette des gaz','Le compensateur moteur'],'Les pédales du palonnier commandent le lacet.'),
    q('Pourquoi les ailerons se braquent-ils en sens opposés ?','Pour créer une différence de portance entre les ailes',['Pour freiner les deux ailes pareillement','Pour commander le tangage','Pour régler le QNH'],'Cette dissymétrie crée un moment de roulis.'),
    q('Qu’est-ce que le lacet inverse ?','Un lacet opposé au roulis commandé',['Un tangage automatique','Un décrochage sans lacet','Une rotation autour de l’axe longitudinal'],'La traînée accrue de l’aile à aileron baissé tire le nez du mauvais côté.'),
  ]},
  { slug:'virage-charge', title:'Virage et facteur de charge', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['En virage, la portance s’incline.','Le palier exige davantage de portance.','Le facteur de charge augmente avec l’inclinaison.'], questions:[
    q('Pourquoi faut-il augmenter la portance en virage en palier ?','Sa composante verticale doit toujours équilibrer le poids',['Le poids disparaît','La traînée devient nulle','La poussée devient verticale'],'Une partie de la portance inclinée sert à faire tourner l’avion.'),
    q('Que devient le facteur de charge quand l’inclinaison augmente en palier ?','Il augmente',['Il diminue','Il reste toujours égal à zéro','Il devient négatif'], 'La portance totale nécessaire devient supérieure au poids.'),
    q('Que devient la vitesse de décrochage lorsque le facteur de charge augmente ?','Elle augmente',['Elle diminue','Elle reste rigoureusement fixe','Elle devient une vitesse sol'],'Une portance plus forte est demandée à la même masse.'),
    q('Quelle composante de la portance fait tourner l’avion ?','La composante horizontale',['La composante verticale','La traînée parasite','Le poids'],'La composante horizontale fournit l’accélération centripète.'),
    q('À inclinaison nulle en palier stabilisé, le facteur de charge vaut approximativement combien ?','1 g',['0 g','2 g','4 g'],'La portance équilibre alors simplement le poids.'),
  ]},
  { slug:'vortex', title:'Vortex et turbulence de sillage', category:'aerodynamics', source:CULTURE_SOURCES.bia, takeaways:['Les vortex naissent de la différence de pression.','Ils descendent derrière l’avion.','Lourd, lent et propre constitue le cas fort.'], questions:[
    q('Où naissent principalement les vortex de sillage ?','Aux extrémités d’ailes',['Au tube Pitot','Au train avant','Dans le cockpit'],'L’air contourne le saumon de l’intrados vers l’extrados.'),
    q('Comment évoluent généralement les vortex juste derrière l’avion ?','Ils descendent et s’écartent',['Ils montent verticalement','Ils restent immobiles','Ils disparaissent instantanément'],'Les deux tourbillons s’enfoncent sous la trajectoire.'),
    q('Quel avion produit généralement le sillage le plus intense ?','Un avion lourd, lent et propre',['Un avion léger et rapide','Un planeur au parking','Un avion léger volets sortis'],'Cette combinaison correspond à une forte portance demandée.'),
    q('Pourquoi un vent traversier faible peut-il être piégeux près d’une piste ?','Il peut maintenir un vortex sur la piste',['Il annule toujours les vortex','Il supprime la portance','Il ferme le QFU'],'Le vortex sous le vent peut dériver ou rester dans la zone utilisée.'),
    q('Quelle précaution réduit le risque derrière un avion lourd au départ ?','Éviter sa trajectoire et respecter l’espacement',['Décoller exactement à son point de rotation','Rester sous sa trajectoire','Ignorer le vent'],'L’espacement et une trajectoire adaptée évitent la zone de sillage la plus dangereuse.'),
  ]},
];
export const aerodynamicsContent=buildDomainContent('aerodynamics','aero',topics,14);
