# Déploiement — PSY0 Trainer en ligne

L'application reste **utilisable hors-ligne** : le serveur ne sert qu'à sauvegarder
la progression entre deux séances et à la retrouver sur un autre appareil.
Aucun appel réseau n'a lieu pendant un exercice — un M2 Back à 1 s ou des Formes
et couleurs à 0,5 s ne toléreraient pas la latence.

## Architecture

Un seul conteneur applicatif (front statique + API) et un Postgres.

| Élément | Rôle |
|---|---|
| `snapshots` | Dump complet du `localStorage`, versionné. C'est ce qui restaure un appareil à l'identique. |
| `item_events` | Un item joué par ligne, requêtable en SQL. Append-only, jamais écrasé par une synchronisation. |

La version du snapshot est **monotone** : c'est elle qui arbitre les conflits.
Si deux appareils ont avancé depuis la dernière synchronisation, l'API répond
**409** et l'application demande explicitement quoi garder — jamais d'écrasement
silencieux.

Les events sont dédoublonnés sur `(session_id, pos_in_session)` : renvoyer deux
fois le même lot n'insère rien. Sans cette contrainte, chaque synchronisation
dupliquerait l'historique et fausserait tous les taux d'erreur du coach.

## 1. Générer les secrets

```bash
npm run hash-code -- "ton code d'accès"
```

Sort `ACCESS_CODE_HASH` et `SESSION_SECRET`. **Le code en clair ne quitte jamais
ton terminal** : seule son empreinte scrypt salée est déployée.

Le séparateur de l'empreinte est `:` et non `$` — docker compose et Coolify
traitent `$` comme une interpolation de variable et videraient l'empreinte en
silence.

## 2. Variables d'environnement Coolify

| Variable | Valeur |
|---|---|
| `POSTGRES_PASSWORD` | mot de passe long et aléatoire |
| `ACCESS_CODE_HASH` | sortie de `npm run hash-code` |
| `SESSION_SECRET` | sortie de `npm run hash-code` (32 caractères minimum) |
| `DATABASE_SSL` | `true` uniquement si Postgres exige TLS (inutile sur le réseau interne) |

Le serveur **refuse de démarrer** si `ACCESS_CODE_HASH` est malformé ou si
`SESSION_SECRET` fait moins de 32 caractères. C'est délibéré : une empreinte
tronquée au copier-coller validerait n'importe quel code d'accès.

## 3. Déployer

Ressource **Docker Compose** dans Coolify, depuis `git@github.com:amdiakhate/psy0.git`,
fichier `docker-compose.yml`. Domaine : `psy.makht.art` sur le service `app`,
port 3000.

Le volume `psy0-db` porte tout l'historique d'entraînement : **le supprimer
efface la progression**. Il survit aux redéploiements.

## 4. Vérifier

```bash
curl -s https://psy.makht.art/api/health
```

Doit répondre `{"ok":true,"db":true}`. Le healthcheck teste la base, pas
seulement le processus : un conteneur qui répond sans pouvoir écrire n'est pas
sain, il est trompeur.

## Tester en local avant de pousser

```bash
npm run hash-code -- "code-de-test" > .env
docker compose up -d --build
curl -s "http://127.0.0.1:$(docker compose port app 3000 | cut -d: -f2)/api/health"
```

`.env` est ignoré par git.

## Sauvegarde

L'export JSON depuis Réglages reste la sauvegarde de dernier recours, indépendante
du serveur. À conserver : c'est ce qui protège d'une erreur d'infrastructure.

```bash
docker compose exec db pg_dump -U psy0 psy0 > sauvegarde-psy0.sql
```
