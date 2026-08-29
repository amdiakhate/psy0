import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';
const q=(a:string,b:string,c:[string,string,string],d:string):QuestionSeed=>[a,b,c,d];
const topics:CultureTopicSeed[]=[
  {slug:'classes',title:'Classes d’espace aérien',category:'regulations',source:CULTURE_SOURCES.sera,takeaways:['A est réservée aux IFR.','C et D accueillent IFR et VFR contrôlés.','G est non contrôlée.'],questions:[
    q('Quelle classe est le repère d’espace non contrôlé ?','La classe G',['La classe A','La classe C','La classe D'],'La classe G est non contrôlée.'),
    q('Dans quelle classe les vols VFR sont-ils interdits ?','La classe A',['La classe C','La classe E','La classe G'],'La classe A est réservée aux vols IFR.'),
    q('Dans quelle classe les IFR sont-ils contrôlés tandis que les VFR peuvent généralement évoluer sans clairance selon les conditions applicables ?','La classe E',['La classe A','La classe B','La classe F uniquement'],'La classe E est contrôlée pour les IFR.'),
    q('Quelle affirmation décrit la classe D ?','IFR et VFR y sont contrôlés',['Elle est IFR uniquement','Elle est toujours non contrôlée','Elle interdit toute radio'],'Les deux régimes de vol sont soumis au contrôle en classe D.'),
    q('« Non contrôlé » signifie-t-il absence de tout service ATS ?','Non, information et alerte peuvent être fournis',['Oui, aucun service ne peut exister','Oui, toute radio est interdite','Non, mais seule la séparation IFR/VFR est garantie'],'La classe G peut bénéficier de services sans devenir un espace contrôlé.'),
    q('Quelle classe offre le niveau de contrôle le plus complet aux IFR et VFR parmi les classes courantes ?','La classe B',['La classe E','La classe F','La classe G'],'En classe B, IFR et VFR sont contrôlés et séparés.'),
  ]},
  {slug:'vfr-ifr',title:'VFR, IFR et services',category:'regulations',source:CULTURE_SOURCES.sera,takeaways:['VFR repose sur les règles de vol à vue.','IFR repose sur les règles de vol aux instruments.','Une clairance est une autorisation ATC encadrée.'],questions:[
    q('Que signifie VFR ?','Visual Flight Rules',['Vertical Flight Route','Verified Flight Record','Visual Frequency Range'],'VFR désigne les règles de vol à vue.'),
    q('Que signifie IFR ?','Instrument Flight Rules',['International Flight Route','Internal Flight Record','Instrument Frequency Range'],'IFR désigne les règles de vol aux instruments.'),
    q('Qu’est-ce qu’une clairance ATC ?','Une autorisation de procéder sous conditions spécifiées',['Une prévision météo','Une licence de pilote','Une garantie d’absence de trafic'],'Elle autorise une action ou trajectoire dans les limites données.'),
    q('Quel service fournit des renseignements utiles à la conduite sûre du vol ?','Le service d’information de vol',['Le service douanier','Le service de piste uniquement','Le constructeur'],'Le FIS diffuse des informations pertinentes sans être une clairance.'),
    q('Quel service vise à prévenir les organismes appropriés lorsqu’un aéronef a besoin d’aide ?','Le service d’alerte',['Le contrôle d’approche','Le service météo privé','La maintenance'],'Le service d’alerte soutient la recherche et le sauvetage.'),
  ]},
  {slug:'priorites',title:'Priorités et prévention des collisions',category:'regulations',source:CULTURE_SOURCES.sera,takeaways:['Deux aéronefs face à face s’écartent à droite.','En convergence, celui qui voit l’autre à droite cède.','L’aéronef dépassé est prioritaire.'],questions:[
    q('Deux avions se rapprochent de face : comment s’écartent-ils ?','Chacun vire à droite',['Chacun vire à gauche','Le plus rapide monte','Aucun ne change de route'],'La règle symétrique impose un écartement vers la droite.'),
    q('En convergence au même niveau, qui cède le passage ?','Celui qui voit l’autre sur sa droite',['Celui qui voit l’autre sur sa gauche','Toujours le plus lourd','Toujours le plus lent'],'L’aéronef ayant l’autre à sa droite doit s’écarter.'),
    q('Quel aéronef est prioritaire lors d’un dépassement ?','L’aéronef dépassé',['L’aéronef dépassant','Le plus haut','Le plus rapide'],'Le dépassant doit modifier sa trajectoire.'),
    q('De quel côté s’effectue normalement un dépassement aérien ?','Par la droite de l’aéronef dépassé',['Par sa gauche','Par-dessous obligatoirement','Sans écart latéral'],'Le dépassement s’effectue en s’écartant vers la droite.'),
    q('Quelle priorité générale possède un aéronef en détresse ?','Priorité absolue sur les autres trafics',['Aucune priorité','Priorité seulement la nuit','Priorité uniquement en classe G'],'La détresse impose aux autres aéronefs de lui céder le passage.'),
  ]},
  {slug:'ppl-lapl',title:'PPL et LAPL',category:'training',source:CULTURE_SOURCES.easaAircrew,takeaways:['PPL est la licence de pilote privé.','PPL(A) standard : 45 h minimum.','LAPL offre des privilèges plus limités.'],questions:[
    q('Quel privilège général associe-t-on à une PPL ?','Piloter à titre privé dans les limites de la licence',['Exercer automatiquement comme commandant de ligne','Assurer tout transport commercial','Instruire sans qualification'],'La PPL permet des vols non commerciaux selon ses privilèges.'),
    q('Quel âge minimal est requis pour la délivrance d’une PPL(A) ?','17 ans',['16 ans','18 ans','21 ans'],'Part-FCL fixe 17 ans pour la délivrance.'),
    q('Quel minimum de formation en vol prévoit le cursus standard PPL(A) ?','45 heures',['30 heures','35 heures','60 heures'],'Le cursus standard comporte au moins 45 heures.'),
    q('Comment se situe généralement la LAPL par rapport à la PPL ?','Ses privilèges sont plus limités',['Elle est supérieure à l’ATPL','Elle est réservée aux planeurs','Elle remplace toute qualification de classe'],'La LAPL est une licence légère aux privilèges encadrés.'),
    q('Une PPL autorise-t-elle automatiquement le vol aux instruments ?','Non, une qualification IR est nécessaire',['Oui, sans formation','Oui, seulement la nuit','Non, le vol IFR est interdit à tous les privés'],'Le vol IFR demande la qualification appropriée.'),
  ]},
  {slug:'licences',title:'SPL, CPL et ATPL',category:'training',source:CULTURE_SOURCES.easaSailplanes,takeaways:['SPL concerne le planeur.','CPL est la licence commerciale.','ATPL est la licence de transport aérien.'],questions:[
    q('Quelle licence européenne concerne le pilote de planeur ?','La SPL',['La PPL(A)','La CPL(H)','La MCC'],'SPL signifie Sailplane Pilot Licence.'),
    q('Quel âge minimal est requis pour la délivrance d’une SPL ?','16 ans',['14 ans','17 ans','18 ans'],'Part-SFCL fixe 16 ans pour la délivrance.'),
    q('Que signifie CPL ?','Commercial Pilot Licence',['Cooperative Pilot Level','Civil Passenger Licence','Certified Private Licence'],'La CPL est la licence de pilote professionnel/commercial.'),
    q('Que signifie ATPL ?','Airline Transport Pilot Licence',['Aircraft Technical Pilot Level','Air Traffic Private Licence','Advanced Training Pilot Licence'],'L’ATPL est la licence de pilote de ligne.'),
    q('Quelle licence représente le niveau supérieur pour exercer comme commandant de bord en transport aérien commercial multipilote ?','L’ATPL',['La SPL','La LAPL','La PPL seule'],'L’ATPL porte les privilèges de commandement correspondants sous réserve des qualifications.'),
  ]},
  {slug:'qualifications',title:'IR, MCC et UPRT',category:'training',source:CULTURE_SOURCES.easaAircrew,takeaways:['IR autorise le vol aux instruments.','MCC forme à la coopération multipilote.','UPRT prépare aux attitudes inusuelles.'],questions:[
    q('Quelle qualification est nécessaire pour exercer les privilèges de vol aux instruments ?','L’IR',['La MCC','La SPL','Le BIA'],'IR signifie Instrument Rating.'),
    q('Quel est l’objectif principal de la MCC ?','Apprendre la coopération en équipage multipilote',['Apprendre le vol à voile','Obtenir le médical','Apprendre uniquement la météo'],'Elle structure coordination, communication et partage des tâches.'),
    q('Quel est l’objectif de l’UPRT ?','Prévenir et récupérer les pertes de contrôle et attitudes inusuelles',['Former au roulage','Enseigner la géographie','Remplacer l’IR'],'UPRT signifie Upset Prevention and Recovery Training.'),
    q('La MCC est-elle une licence de pilote ?','Non, c’est une formation de coopération multipilote',['Oui, elle remplace l’ATPL','Oui, pour planeur','Non, c’est un certificat médical'],'Elle complète la formation sans constituer une licence autonome.'),
    q('Que signifie la lettre R dans IR ?','Rating',['Route','Record','Regulation'],'IR développe Instrument Rating.'),
  ]},
];
export const regulationsTrainingContent=buildDomainContent('regulations-training','reg',topics,9);
