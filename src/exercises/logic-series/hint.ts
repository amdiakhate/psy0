import type { Hint, Item } from '../../core/types';
import type { LogicQuestion } from './generator';
import { riddleValue } from './generator';

/**
 * Astuces des Séries logiques.
 *
 * Elles répondent à la seule question qui bloque vraiment : OÙ vit la loi ?
 * `where` nomme l'emplacement sans rien calculer ; `step` applique le premier
 * geste — les écarts, la mesure d'un décalage — et s'arrête AVANT d'appliquer
 * la loi au terme manquant. Le calcul final reste à faire, sinon l'astuce
 * répond à la place du candidat.
 */
export function hint(item: Item<LogicQuestion>): Hint | null {
  const q = item.question;

  if (q.format === 'numeric') {
    if (q.rule.type === 'palindrome') {
      return {
        where: 'Les termes n’ont pas tous la même longueur : aucune progression n’est possible. La loi est DANS le nombre.',
        step: 'Lis chaque terme de droite à gauche. Puis fais-en autant sur les quatre options — une seule survivra.',
      };
    }
    if (q.rule.type === 'concat-product') {
      return {
        where: 'Nombres longs, sans progression : découpe-en UN au lieu de les comparer.',
        step: 'Coupe en trois morceaux — a, puis un bloc, puis b. Vérifie si le bloc du milieu est le produit des deux autres.',
      };
    }
    const diffs = q.terms.slice(1).map((v, i) => v - q.terms[i]);
    if (q.rule.type === 'alternate' || q.rule.type === 'two-rules') {
      return {
        where: 'Les écarts ne se répètent pas simplement : lis une position sur deux.',
        step: `Écarts entre termes consécutifs : ${diffs.join(', ')}. Ils alternent — sépare les rangs pairs des rangs impairs.`,
      };
    }
    if (q.rule.type === 'fibo') {
      return {
        where: 'Les écarts grossissent vite sans être un multiple constant : regarde les termes DEUX à deux en arrière.',
        step: `Additionne deux termes voisins et compare au suivant : ${q.terms[0]} + ${q.terms[1]} = ${q.terms[0] + q.terms[1]}.`,
      };
    }
    if (q.rule.type === 'geo') {
      return {
        where: 'Les écarts enflent au lieu d’être constants : teste un RAPPORT, pas une différence.',
        step: `Divise chaque terme par le précédent : ${q.terms[1]} ÷ ${q.terms[0]} = ${q.terms[1] / q.terms[0]}.`,
      };
    }
    return {
      where: 'Premier geste systématique : passe aux écarts entre termes consécutifs.',
      step: `Écarts entre termes consécutifs : ${diffs.join(', ')}. Cherche le motif LÀ-DEDANS, pas dans les termes.`,
    };
  }

  if (q.format === 'letters') {
    if (q.rule.type === 'calendar') {
      return {
        where: 'Ce ne sont pas des lettres au hasard : les initiales évoquent quelque chose de familier. Aucun calcul ne mène à la réponse.',
        step: 'Lis les initiales à voix haute dans l’ordre. Mois de l’année ? Jours de la semaine ? Le nombre accolé est le rang.',
      };
    }
    if (q.rule.type === 'letter-rank') {
      return {
        where: 'Une lettre collée à un nombre : demande-toi ce que le nombre dit de la LETTRE, pas du terme précédent.',
        step: 'Convertis la lettre en rang alphabétique (A=1, E=5, J=10, O=15, T=20, Z=26) et compare au nombre affiché.',
      };
    }
    if (q.rule.type === 'pair-internal') {
      return {
        where: 'Les premières lettres ne progressent pas — inutile de chercher un pas. La loi est À L’INTÉRIEUR de chaque groupe.',
        step: 'Mesure l’écart entre les deux lettres d’un même groupe, puis vérifie qu’il est le même sur tous les autres.',
      };
    }
    if (q.rule.type === 'pair-columns') {
      return {
        where: 'Groupes de deux : ce sont DEUX séries indépendantes posées côte à côte.',
        step: 'Couvre la seconde colonne du doigt et ne lis que la première. Puis l’inverse. Chacune a son propre pas.',
      };
    }
    if (q.rule.type === 'letter-interleaved') {
      return {
        where: 'Les écarts d’une lettre à la suivante sont incohérents : c’est la signature de deux suites entrelacées.',
        step: 'Convertis en rangs, puis lis une position sur deux — tu obtiens deux suites simples.',
      };
    }
    return {
      where: 'Une série de lettres n’a rien de verbal : convertis en rangs alphabétiques et traite-la comme des nombres.',
      step: 'Jalons pour convertir sans compter : A=1, E=5, J=10, O=15, T=20, Z=26. Puis passe aux écarts.',
    };
  }

  if (q.format === 'words') {
    return {
      where: 'Ne cherche AUCUN rapport de sens entre ces mots : il n’y en a pas. La propriété est formelle.',
      step: 'Trois contrôles, dans cet ordre : même longueur ? même première lettre ? même dernière lettre ?',
    };
  }

  if (q.format === 'riddle') {
    const example = q.rule.names[0];
    return {
      where: 'Le nombre ne vient pas du prénom précédent : il se lit sur les LETTRES du prénom lui-même.',
      step: `Prends « ${example} » (${riddleValue(q.rule.type, example)}) et cherche : première lettre, dernière lettre, longueur — laquelle donne ce nombre ? Vérifie sur les deux autres avant de conclure.`,
    };
  }

  return {
    where: 'Une figure porte cinq attributs indépendants : forme, nombre, taille, rotation, remplissage.',
    step: 'Passe-les en revue UN PAR UN, toujours dans le même ordre. Chacun a son propre cycle.',
  };
}
