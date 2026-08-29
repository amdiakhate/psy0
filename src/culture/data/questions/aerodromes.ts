import { CULTURE_SOURCES } from '../sources';
import { buildDomainContent } from './helpers';
import type { CultureTopicSeed, QuestionSeed } from './helpers';
const q=(a:string,b:string,c:[string,string,string],d:string):QuestionSeed=>[a,b,c,d];
const topics:CultureTopicSeed[]=[
  {slug:'marquages-piste',title:'Marquages de piste',category:'aerodromes',source:CULTURE_SOURCES.aip,takeaways:['Les marquages de piste sont blancs.','L’axe est matérialisé par des traits centraux.','Le seuil comporte des bandes longitudinales.'],questions:[
    q('Quelle est la couleur générale des marquages de piste ?','Blanche',['Jaune','Rouge','Verte'],'Les marques de piste sont blanches.'),
    q('Que matérialisent les traits blancs discontinus au centre ?','L’axe de piste',['La limite du parking','Le point d’attente','Le bord du taxiway'],'Ils guident l’alignement sur l’axe.'),
    q('À quoi servent les bandes longitudinales près de l’entrée de piste ?','À matérialiser le seuil',['À indiquer le QNH','À fermer la piste','À signaler le vent'],'Le marquage en peigne identifie le seuil.'),
    q('Que signifie une grande croix blanche ou jaune sur une piste ?','Une portion fermée à l’utilisation',['Une zone de toucher','Une piste prioritaire','Une aire de dégivrage'],'La croix signale une surface fermée.'),
    q('Où trouve-t-on normalement le numéro de piste peint ?','Près du seuil',['Au milieu de chaque taxiway','Sur la tour','Sur le PAPI'],'Le numéro accueille l’aéronef à l’entrée du sens utilisé.'),
    q('Que délimitent les lignes blanches continues latérales ?','Les bords de piste',['Une voie de circulation','La limite d’espace contrôlé','Le circuit de piste'],'Elles matérialisent les limites de la surface de piste.'),
  ]},
  {slug:'taxiways',title:'Voies de circulation et signalisation',category:'aerodromes',source:CULTURE_SOURCES.aip,takeaways:['Les marquages de taxiway sont jaunes.','La ligne axiale guide le roulage.','Le point d’attente protège la piste.'],questions:[
    q('Quelle couleur caractérise les marquages de voie de circulation ?','Jaune',['Blanche','Verte','Bleue'],'Les taxiways utilisent des marques jaunes au sol.'),
    q('Quel est le rôle d’un point d’attente avant piste ?','Empêcher l’entrée sans autorisation ou condition requise',['Mesurer le vent','Régler l’altimètre','Indiquer la pente PAPI'],'Il protège la piste active contre une incursion.'),
    q('Quelle ligne suit-on normalement au centre d’un taxiway ?','Une ligne jaune continue',['Une ligne blanche discontinue','Une ligne rouge','Une rangée de triangles blancs'],'Elle matérialise l’axe de circulation.'),
    q('Quelle couleur ont généralement les feux de bord de taxiway ?','Bleue',['Rouge','Blanche','Ambre uniquement'],'Les feux bleus délimitent les bords des voies de circulation.'),
    q('Quelle couleur peut matérialiser l’axe lumineux d’un taxiway ?','Verte',['Rouge','Blanche','Violette'],'Les feux axiaux de taxiway sont verts.'),
  ]},
  {slug:'papi-vasis',title:'PAPI et VASIS',category:'aerodromes',source:CULTURE_SOURCES.aip,takeaways:['Le PAPI indique la position sur le plan.','Deux blancs/deux rouges : pente correcte.','Le VASIS remplit une fonction comparable.'],diagram:'papi',memoryTip:'Blanc haut, rouge bas.',questions:[
    q('Que signifie un PAPI avec trois blancs et un rouge ?','L’avion est légèrement trop haut',['L’avion est trop bas','La pente est parfaite','La piste est fermée'],'Davantage de blanc signifie au-dessus du plan.'),
    q('Que signifie un PAPI avec un blanc et trois rouges ?','L’avion est légèrement trop bas',['L’avion est trop haut','La pente est parfaite','Le vent est arrière'],'Davantage de rouge signifie sous le plan.'),
    q('Que signifient quatre feux blancs au PAPI ?','L’avion est nettement trop haut',['L’avion est nettement trop bas','L’avion est sur le plan','Le balisage est éteint'],'Tout blanc indique une position très au-dessus de la pente.'),
    q('Quelle information le VASIS fournit-il ?','La position verticale par rapport à la pente d’approche',['Le vent de travers','La longueur de piste','Le QNH'],'Le VASIS est une aide visuelle de pente.'),
    q('Le PAPI donne-t-il une autorisation d’atterrir ?','Non, il indique seulement la pente',['Oui, toujours','Oui si deux feux sont rouges','Seulement la nuit'],'L’autorisation et l’indication de pente sont deux informations distinctes.'),
  ]},
  {slug:'balisage',title:'Feux d’aérodrome',category:'aerodromes',source:CULTURE_SOURCES.aip,takeaways:['Les bords de piste sont généralement blancs.','Les feux de seuil sont verts vus à l’approche.','Les feux d’extrémité sont rouges vers la piste.'],questions:[
    q('Quelle couleur présentent les feux de seuil vus en approche ?','Verte',['Rouge','Bleue','Jaune'],'Le vert marque le début utilisable de la piste.'),
    q('Quelle couleur présentent les feux d’extrémité de piste vus depuis la piste ?','Rouge',['Verte','Bleue','Blanche'],'Le rouge marque la fin de la piste disponible.'),
    q('Quelle couleur ont généralement les feux de bord de piste ?','Blanche',['Bleue','Verte','Rouge sur toute la longueur'],'Les bords de piste sont balisés en blanc, avec adaptations possibles près de l’extrémité.'),
    q('À quoi sert un balisage lumineux d’approche ?','À aider l’alignement et l’acquisition de la piste',['À mesurer la pression','À indiquer la licence requise','À remplacer le contrôle aérien'],'Il fournit des repères visuels avant le seuil.'),
    q('Quelle couleur signale une barre d’arrêt allumée ?','Rouge',['Verte','Blanche','Bleue'],'Une barre rouge ne doit pas être franchie lorsqu’elle est allumée.'),
  ]},
  {slug:'seuil-circuit',title:'Seuil, piste et circuit',category:'aerodromes',source:CULTURE_SOURCES.bia,takeaways:['Un seuil peut être décalé.','Le circuit comprend vent arrière, base et finale.','La manche à air indique direction et force approximative.'],questions:[
    q('Qu’est-ce qu’un seuil décalé ?','Un seuil d’atterrissage placé après le début physique de la piste',['Une piste sans QFU','Un seuil réservé au roulage','Une piste plus large'],'La portion avant le seuil peut avoir des usages limités.'),
    q('Quelle branche précède généralement la finale dans un circuit standard ?','L’étape de base',['La vent arrière','La montée initiale','La branche traversière après finale'],'On tourne de la base vers l’axe final.'),
    q('À quoi sert la manche à air ?','À indiquer direction et force approximative du vent',['À mesurer le QNH','À signaler le niveau de vol','À donner la visibilité exacte'],'Son orientation et son gonflement donnent une lecture visuelle du vent.'),
    q('Comment nomme-t-on la branche parallèle à la piste dans le sens opposé à l’atterrissage ?','La vent arrière',['La finale','La base','La montée initiale'],'La vent arrière longe la piste avant les virages vers la base et la finale.'),
    q('Quelle phase aligne l’avion avec l’axe de piste avant l’atterrissage ?','La finale',['La vent traversier','La vent arrière','Le roulage'], 'La finale est la dernière branche de l’approche.'),
  ]},
];
export const aerodromesContent=buildDomainContent('aerodromes','ad',topics);
