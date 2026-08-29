import type { CultureCategory } from '../types';

export interface CultureCategoryDefinition {
  id: CultureCategory;
  label: string;
  shortLabel: string;
  description: string;
}

export const CULTURE_CATEGORIES: CultureCategoryDefinition[] = [
  { id: 'air-france', label: 'Air France', shortLabel: 'Air France', description: 'Histoire, flotte, réseau, hubs, SkyTeam et organisation.' },
  { id: 'aerodynamics', label: 'Aérodynamique / mécanique du vol', shortLabel: 'Aérodynamique', description: 'Portance, décrochage, commandes, traînée et vortex.' },
  { id: 'navigation', label: 'Navigation', shortLabel: 'Navigation', description: 'Caps, vent, unités, routes et repères.' },
  { id: 'weather', label: 'Météorologie', shortLabel: 'Météo', description: 'Pression, fronts, nuages, givrage et phénomènes dangereux.' },
  { id: 'instruments', label: 'Instruments', shortLabel: 'Instruments', description: 'Pitot-statique, instruments de base et indications de vol.' },
  { id: 'aerodromes', label: 'Aérodromes / pistes / balisage', shortLabel: 'Aérodromes', description: 'QFU, pistes, PAPI, VASIS, feux et calages.' },
  { id: 'regulations', label: 'Réglementation / espaces aériens', shortLabel: 'Réglementation', description: 'Classes d’espace, règles simples et sécurité.' },
  { id: 'training', label: 'Licences / formation pilote', shortLabel: 'Formation', description: 'PPL, SPL, IR, MCC et UPRT.' },
  { id: 'mental-math', label: 'Performances / unités / calcul mental', shortLabel: 'Calcul aéro', description: 'Vitesse, distance, temps et conversions mentales.' },
  { id: 'geography', label: 'Géographie', shortLabel: 'Géographie', description: 'Capitales, pays, latitudes et fuseaux horaires.' },
  { id: 'commercial-aviation', label: 'Compagnies / aviation commerciale', shortLabel: 'Aviation commerciale', description: 'Flottes, alliances, réseaux et familles d’avions.' },
  { id: 'general-aviation', label: 'Culture aéronautique générale', shortLabel: 'Culture générale', description: 'Histoire, espace, aéronefs et grands repères.' },
];

export const CULTURE_CATEGORY_IDS = CULTURE_CATEGORIES.map((category) => category.id);

export const CULTURE_CATEGORY_BY_ID = Object.fromEntries(
  CULTURE_CATEGORIES.map((category) => [category.id, category]),
) as Record<CultureCategory, CultureCategoryDefinition>;
