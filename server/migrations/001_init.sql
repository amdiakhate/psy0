-- Schéma de synchronisation PSY0 Trainer.
--
-- Deux niveaux volontairement distincts :
--   * `snapshots` conserve le dump complet du localStorage, versionné. C'est ce
--     qui restaure un appareil à l'identique : préférences, niveaux, rotation,
--     logs de séance. Le format suit celui d'`exportAll()` côté front.
--   * `item_events` normalise les items joués, un par ligne. C'est la « vraie »
--     table : requêtable en SQL, append-only, et jamais écrasée par une
--     synchronisation — même si un snapshot plus ancien remonte par erreur.
--
-- Le front reste la source de vérité PENDANT une séance (aucune latence réseau
-- sur des exercices chronométrés à la demi-seconde) ; le serveur est la source
-- de vérité ENTRE deux séances.

CREATE TABLE IF NOT EXISTS snapshots (
  id          BIGSERIAL PRIMARY KEY,
  version     INTEGER     NOT NULL,
  data        JSONB       NOT NULL,
  device      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- La version est monotone : c'est elle qui arbitre les conflits entre appareils.
CREATE UNIQUE INDEX IF NOT EXISTS snapshots_version_idx ON snapshots (version);
CREATE INDEX IF NOT EXISTS snapshots_created_at_idx ON snapshots (created_at DESC);

CREATE TABLE IF NOT EXISTS item_events (
  id                 BIGSERIAL   PRIMARY KEY,
  ts                 TIMESTAMPTZ NOT NULL,
  session_id         TEXT        NOT NULL,
  mode               TEXT        NOT NULL,
  exercise           TEXT        NOT NULL,
  level              INTEGER     NOT NULL,
  seed               BIGINT      NOT NULL,
  tags               TEXT[]      NOT NULL DEFAULT '{}',
  rt_ms              INTEGER     NOT NULL,
  correct            BOOLEAN     NOT NULL,
  given              TEXT,
  expected           TEXT,
  pos_in_session     INTEGER     NOT NULL,
  minute_in_session  INTEGER     NOT NULL,
  synced_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotence de la synchronisation : renvoyer deux fois le même lot n'insère
-- rien en double. Sans cette contrainte, chaque synchronisation dupliquerait
-- l'historique et fausserait tous les taux d'erreur du coach.
CREATE UNIQUE INDEX IF NOT EXISTS item_events_identity_idx
  ON item_events (session_id, pos_in_session);

CREATE INDEX IF NOT EXISTS item_events_exercise_ts_idx ON item_events (exercise, ts DESC);
CREATE INDEX IF NOT EXISTS item_events_ts_idx ON item_events (ts DESC);
-- Les analyses du coach interrogent toujours par sous-type d'erreur.
CREATE INDEX IF NOT EXISTS item_events_tags_idx ON item_events USING GIN (tags);
