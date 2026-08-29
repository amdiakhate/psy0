import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';
const q=(a:string,b:string,c:[string,string,string],d:string):QuestionSeed=>[a,b,c,d];
const topics:CultureTopicSeed[]=[
  {slug:'pitot-statique',title:'Circuit Pitot-statique',category:'instruments',source:CULTURE_SOURCES.bia,takeaways:['Le Pitot capte la pression totale.','La prise statique capte la pression ambiante.','La différence donne la pression dynamique.'],diagram:'pitot-static',questions:[
    q('Que mesure directement un tube Pitot correctement orienté ?','La pression totale',['La pression statique seule','Le QNH','La température totale'],'Le Pitot arrête localement l’écoulement et capte la pression totale.'),
    q('Que mesure une prise statique ?','La pression ambiante de l’air',['La pression totale','La vitesse sol','Le cap magnétique'],'Elle prélève la pression statique hors de l’écoulement perturbé.'),
    q('À quoi correspond totale moins statique ?','À la pression dynamique',['Au QFE','À la pression cabine','À la densité'],'Cette différence varie avec la vitesse de l’écoulement.'),
    q('Quels instruments dépendent de la prise statique ?','Anémomètre, altimètre et variomètre',['Compas, montre et GPS','Horizon et compas seulement','Compte-tours et jauge carburant'],'Les trois instruments barométriques utilisent la pression statique.'),
    q('Quel dispositif limite le givrage du Pitot ?','Le chauffage Pitot',['Le réglage QNH','Le conservateur de cap','Le phare anticollision'],'Une résistance chauffante évite l’accumulation de glace.'),
  ]},
  {slug:'anemometre',title:'Anémomètre',category:'instruments',source:CULTURE_SOURCES.bia,takeaways:['Il indique une vitesse air.','Il utilise pression totale et statique.','Il ne mesure pas directement la vitesse sol.'],trap:'IAS et vitesse sol diffèrent avec le vent.',questions:[
    q('Quel instrument affiche la vitesse indiquée IAS ?','L’anémomètre',['L’altimètre','Le variomètre','Le compas'],'L’anémomètre convertit la pression dynamique en vitesse indiquée.'),
    q('Quelle vitesse l’anémomètre ne mesure-t-il pas directement ?','La vitesse sol',['La vitesse indiquée','Une vitesse issue du Pitot-statique','La vitesse air'],'La vitesse sol nécessite une référence de déplacement par rapport au sol.'),
    q('Si totale et statique sont égales, quelle pression dynamique obtient-on ?','Zéro',['1013 hPa','Une valeur maximale','Le QNH'],'La différence de pression est nulle.'),
    q('Pourquoi la densité influence-t-elle la relation entre IAS et vitesse vraie ?','Une même pression dynamique ne correspond pas à la même vitesse vraie selon la densité',['Le compas change de nord','Le QFU varie','La gravité disparaît'],'En air moins dense, il faut une vitesse vraie plus élevée pour la même indication.'),
    q('Quel code couleur de l’anémomètre indique habituellement la plage normale ?','L’arc vert',['L’arc rouge','Le trait noir','L’arc violet'],'L’arc vert matérialise la plage normale d’utilisation.'),
  ]},
  {slug:'altimetre',title:'Altimètre et calages',category:'instruments',categories:['aerodromes'],source:CULTURE_SOURCES.bia,takeaways:['L’altimètre utilise la pression statique.','QNH donne une altitude.','QFE donne environ zéro au terrain.'],questions:[
    q('Sur quel principe fonctionne l’altimètre ?','La diminution de pression avec l’altitude',['La mesure GPS uniquement','La force centrifuge','La pression totale seule'],'Des capsules barométriques réagissent à la pression statique.'),
    q('Au sol avec le QNH, que doit indiquer approximativement l’altimètre ?','L’altitude de l’aérodrome',['Zéro obligatoirement','Le niveau de vol','La hauteur des nuages'],'Le QNH référence l’altitude au niveau moyen de la mer.'),
    q('Au sol avec le QFE de l’aérodrome, quelle indication attend-on ?','Environ zéro',['L’altitude du terrain','1013 ft','La longitude'],'Le QFE référence la pression du terrain.'),
    q('Quel calage utilise-t-on pour exprimer les niveaux de vol ?','1013,25 hPa',['Le QFE local','Le QNH de départ uniquement','760 hPa affichés en altitude'],'Le calage standard fournit une référence commune.'),
    q('Si la pression réelle baisse sans recalage, quel risque existe ?','Être plus bas que l’altitude indiquée',['Être toujours plus haut','Voir la vitesse sol augmenter','Changer de cap'],'De haute vers basse pression, attention à l’altitude réelle plus faible.'),
  ]},
  {slug:'variometre',title:'Variomètre',category:'instruments',source:CULTURE_SOURCES.bia,relatedQuestionIds:['doc26-22'],takeaways:['Il indique une vitesse verticale.','Il exploite la variation de pression statique.','Il présente un léger retard.'],questions:[
    q('Que mesure le variomètre ?','Le taux de montée ou de descente',['L’altitude absolue','La vitesse sol','Le cap'],'Il exprime une vitesse verticale, souvent en pieds par minute.'),
    q('Quelle source de pression utilise le variomètre ?','La pression statique',['La pression totale seule','La pression carburant','Le QFU'],'Il compare la pression statique instantanée à une pression retardée.'),
    q('Pourquoi un variomètre classique présente-t-il un retard ?','Le débit calibré met du temps à équilibrer les pressions',['Le compas précesse','Le Pitot chauffe','Le QNH est magnétique'],'Son fonctionnement repose sur une fuite calibrée.'),
    q('Une indication +500 ft/min signifie quoi ?','Une montée de 500 pieds par minute',['Une altitude de 500 ft','Une vitesse de 500 kt','Une descente de 500 ft/min'],'Le signe positif indique une montée.'),
  ]},
  {slug:'gyroscopiques',title:'Horizon et conservateur de cap',category:'instruments',source:CULTURE_SOURCES.bia,takeaways:['L’horizon indique assiette et inclinaison.','Le conservateur donne un cap gyroscopique.','Les gyroscopes peuvent dériver.'],questions:[
    q('Quelles informations principales donne l’horizon artificiel ?','Assiette et inclinaison',['Altitude et vitesse','Cap et QNH','Vitesse sol et dérive'],'Il représente l’attitude de l’avion par rapport à l’horizon.'),
    q('Quel instrument donne une indication gyroscopique de direction ?','Le conservateur de cap',['Le variomètre','L’altimètre','La bille'],'Il offre une lecture plus stable que le compas en manœuvre.'),
    q('Pourquoi recale-t-on un conservateur de cap classique ?','Parce qu’il dérive avec le temps',['Parce que le QFU change','Parce que le Pitot givre toujours','Parce que l’altitude diminue'],'Les imperfections et la précession entraînent une dérive.'),
    q('Quel instrument reste la référence magnétique autonome ?','Le compas magnétique',['L’horizon artificiel','Le variomètre','L’anémomètre'],'Il s’aligne directement sur le champ magnétique terrestre.'),
    q('Que montre l’inclinaison sur l’horizon artificiel ?','Le roulis de l’avion',['Le lacet seul','La vitesse indiquée','La pression standard'],'L’inclinaison correspond à la rotation autour de l’axe longitudinal.'),
  ]},
  {slug:'compas',title:'Compas magnétique',category:'instruments',source:CULTURE_SOURCES.bia,takeaways:['Il indique le nord magnétique.','Il subit déclinaison et déviation.','Les accélérations et virages peuvent créer des erreurs.'],questions:[
    q('Vers quelle référence s’oriente un compas magnétique ?','Le nord magnétique',['Le nord vrai directement','Le QFU actif','La route GPS'],'Il suit le champ magnétique terrestre.'),
    q('Quelle erreur provient des masses métalliques et circuits de l’avion ?','La déviation',['La déclinaison','La dérive vent','L’incidence'],'Les champs magnétiques propres à l’aéronef perturbent le compas.'),
    q('Pourquoi le compas est-il moins confortable en virage ?','Il présente des erreurs et oscillations liées à la manœuvre',['Il cesse de contenir du liquide','Il mesure la pression','Il indique la vitesse sol'],'Son système magnétique réagit aux inclinaisons et accélérations.'),
    q('Quel document de bord aide à corriger la déviation du compas ?','La table de déviation',['La carte des fronts','Le carnet carburant','Le manuel PAPI'],'Elle indique les corrections selon les caps.'),
    q('Quelle différence sépare nord vrai et nord magnétique ?','La déclinaison magnétique',['La déviation instrumentale','Le facteur de charge','La finesse'],'Cette différence dépend de la position géographique.'),
  ]},
];
export const instrumentsContent=buildDomainContent('instruments','inst',topics,12);
