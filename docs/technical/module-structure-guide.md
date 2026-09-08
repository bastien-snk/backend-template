# Guide structure module (template IA)

Ce document definit la structure canonique pour construire un module sans drift.
Objectif: frontieres claires, clean architecture stricte, conventions stables.

## 1) Structure canonique (complete)

```text
src/modules/<module-name>/
  module.ts
  index.ts

  domain/
    entity/
    value-object/
    service/
    policy/
    repository/
    event/
    errors/

  application/
    command/
    event/
    query/
    dto/
    port/
    service/
    errors/
    common/

  infrastructure/
    adapter/
      inbound/
        http/
          routes/
          controller/
          endpoints/
          schema/
            request/
            response/
            params/
            query/
          mapper/
          errors/
        event/listener/
        job/handler/
      outbound/
        persistence/
          drizzle/
            model/
            schema/
            mapper/
            repository/
            types/
        event/publisher/
        external/
        config/
    job/
      payload/
      definition/
      handler/
      sender/
      worker/
    event/
      listener/
        internal/
          reaction/
          relay/
        integration/
          reaction/
      publisher/
    config/
    external/
    errors/

  api/
    contract.ts
    event/
    operation/
    error/
    mapper/
    facade.ts
    view/
    type/
```

## 2) Regles de frontiere

- Un module est une unite metier autonome.
- La communication inter-modules passe par `api/` uniquement.
- Dans `api/`, `contract.ts` definit le contrat racine du module, `operation/` formalise les contrats d'operations, et `facade.ts` expose l'implementation.
- Les integration events inter-modules d'un module vivent dans `api/event/`.
- Les events applicatifs d'un module vivent dans `application/event/`.
- Interdit: imports profonds vers l'interieur d'un autre module.
- `api/` est une interface in-process, pas du transport HTTP.

### Exception encadrée: FK cross-module

Quand un module a besoin d'une contrainte SQL vers une table d'un autre module:

- la FK cross-module est autorisee en base (integrite referentielle),
- la logique inter-modules reste via `api/` facade,
- autoriser l'import TypeScript cross-module de table Drizzle uniquement dans les fichiers schema.

Pattern recommandé:

- declarer la FK cross-module via `references()` dans `infrastructure/adapter/outbound/persistence/drizzle/model/*`,
- limiter cet import cross-module a la couche schema/persistence,
- documenter cette FK dans l'epic et la doc technique du module.

## 3) Regle de dependance (obligatoire)

Direction des dependances:

- `api -> application -> domain`
- `infrastructure -> application | domain` (adapters techniques)
- `domain` ne depend d'aucune techno

Interdits:

- logique metier lourde dans `infrastructure/adapter/inbound/http/controller`
- acces DB dans `domain`
- couplage direct a l'infra d'un autre module

## 4) Composition du module (`module.ts`)

`module.ts` est la composition root du module:

1. instancier services techniques transverses
2. instancier mappers infra
3. instancier repositories infra
4. instancier use-cases application
5. instancier `api/facade.ts`
6. brancher adapters entrants (HTTP/jobs/events) selon le mode runtime

Cycle de vie attendu:

- `init`: wiring des dependances
- `startApi` / `startWs` / `startWorker`: activation par mode
- `startShared`: hooks communs
- `stop*` + `stopShared`: arret propre

## 5) Conventions par couche

### Domain

- Entites et value objects portent les invariants metier.
- Erreurs metier dans `domain/errors`.
- Zero dependance framework/DB/HTTP.

### Application

- Use-cases en `command/` et `query/`.
- Types `Input`/`Output` colocalises dans les fichiers `command/` et `query/`.
- DTO applicatifs internes en `dto/`.
- Ports en `port/` (interfaces) et adapters techniques en `infrastructure/`.
- Pour les integrations multi-provider: ajouter un `*-provider-selector` en `application/port/`.
- Erreurs applicatives dans `application/errors`.

### Infrastructure

- HTTP dans `infrastructure/adapter/inbound/http/*`.
- Drizzle dans `infrastructure/adapter/outbound/persistence/drizzle/*`.
- Integrations externes dans `infrastructure/external/`.
- Pour les providers externes: implementer un registry selector en
  `infrastructure/external/provider/*-provider-registry.ts`.
- Si une integration est partagee par plusieurs modules, utiliser
  `src/integrations/<provider>/`.
- Jobs et eventing dans `infrastructure/job/` et `infrastructure/event/`.
- Configuration module via schemas Zod dans `infrastructure/config/schema/*.ts`.

### API (in-process)

- `api/facade.ts`: surface publique du module.
- `api/contract.ts`: contrat racine public (interface API du module).
- `api/event/*`: contrats d'integration events stables si le module publie des faits inter-modules.
- `api/operation/*`: contrats d'operations (inputs/results).
- `api/error/*`: codes/types d'erreurs de frontiere.
- `api/view/` et `api/type/`: modeles publics stables.
- les operations `api/` retournent un contrat `Result<Success, ApiError>`.
- implementation recommandee du contrat `Result`: `neverthrow`.
- implementation recommandee de `ApiError`: `ModuleApiError` (`systems/module`) +
  codes d'erreur namespacés par module.
- les erreurs internes `application/domain` ne doivent pas traverser la frontiere `api/`.
- un use-case `application` ne doit pas importer `api/` de son propre module; il publie ses events applicatifs via un port implemente dans `infrastructure/event/publisher/`.
- un `command/` ou `query/` ne depend pas directement d'un autre `command/` ou `query/`; extraire la logique commune dans `application/service/`, `domain/service/` ou derriere un port.
- les listeners d'events sont ranges par intention dans `infrastructure/event/listener/internal/reaction/`, `infrastructure/event/listener/internal/relay/` et `infrastructure/event/listener/integration/reaction/`.
- la publication d'integration events passe par un port applicatif dedie implemente dans `infrastructure/event/publisher/`, et leurs contrats ne doivent pas fuiter dans `application/event/`.

## 6) Pattern jobs worker (obligatoire si module async)

Le pattern jobs doit rester simple et uniforme entre modules.

### Contrats a utiliser

- `JobSender`: envoi de job.
- `JobWorker`: enregistrement des handlers cote worker.
- `JobPayloadParser<TPayload>`: parsing/validation runtime.
- `JobDefinition<TPayload>`: identite du job (name-only).
- `JobHandler<TPayload>`: adapter entrant fin.
- `Worker`: contrat de demarrage worker cote module.

Signature worker de reference:

```ts
work<TPayload>(
  definition: JobDefinition<TPayload>,
  parser: JobPayloadParser<TPayload>,
  handler: JobHandler<TPayload>,
): Promise<void>
```

### Repartition par dossier

- `infrastructure/job/payload/*`: payload type + schema.
- `infrastructure/job/definition/*`: `JobDefinition` (name-only).
- `infrastructure/job/handler/*`: handlers qui deleguent a l'application.
- `infrastructure/job/sender/*`: implementation des ports applicatifs metier avec `JobSender`.
- `infrastructure/job/worker/*`: classe `*Worker` qui enregistre les jobs (`jobWorker.work(...)`) et peut lancer un bootstrap initial.

### Regles non negociables

1. La couche application ne depend jamais de `pg-boss`.
2. Les modules ne dependent jamais de `pg-boss`.
3. Les handlers restent fins (pas de logique metier lourde).
4. Le payload est separe de la definition.
5. Le nom du job vit dans la definition.
6. Le core jobs ne depend pas de Zod.
7. `startWorker()` du module delegue a une classe worker dediee.
8. Les ports applicatifs sont metier (`send*Job`), pas un bus generique.

### Nommage recommande

- payload: `send-xxx-job-payload.ts`
- definition: `send-xxx-job-definition.ts`
- handler: `send-xxx-job-handler.ts`
- sender: `send-xxx-job-sender.ts`
- worker module: `<module>-worker.ts`

Reference detaillee: `docs/technical/jobs-worker-pattern.md`.

## 7) Pattern pagination curseur

Pour toute query qui retourne une liste paginee, suivre ce pattern strictement.

### Responsabilites par couche

| Couche                                                          | Responsabilite                                                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `application/query`                                             | Clamp limit, decode curseur entrant, owne la constante de tri (`MODULE_SORT`), encode `nextCursor`, retourne `Page<T>`                                              |
| `application/repository` (port)                                 | Accepte `limit: number`, `cursor: CursorPayload \| null`, `sort: SortField[]` — tous requis (pas de valeurs par defaut). Retourne `{ data: T[]; hasMore: boolean }` |
| `infrastructure/adapter/outbound/persistence` (adapter Drizzle) | Utilise `DrizzleCursorApplier.buildWhere()` + `buildOrderBy()` avec `input.sort`. Retourne `{ data, hasMore }` sans encoder le curseur.                             |
| `infrastructure/adapter/inbound/http/controller`                | Attrape `InvalidCursorError` → `InvalidPaginationCursorError` (400)                                                                                                 |
| `infrastructure/adapter/inbound/http/mapper`                    | Utilise `PageResponseMapper<Input, Output>` pour convertir `Page<T>` → `CursorPageResponse<T>` (snake_case HTTP)                                                    |
| `infrastructure/adapter/inbound/http/schema`                    | Compose `paginationQuerySchema` via `t.Composite([paginationQuerySchema, ...])`                                                                                     |

### Types systeme a utiliser

- `Page<T>` — in-process (camelCase: `nextCursor`, `hasMore`)
- `CursorPageResponse<T>` — HTTP wire uniquement (snake_case: `next_cursor`, `has_more`)
- `CursorPaginator` — `clampLimit()`, `encodeCursor()`, `decodeCursor()`
- `DrizzleCursorApplier` — `buildWhere(table, cursor)`, `buildOrderBy(table, sort)`
- `PageResponseMapper<Input, Output>` — `src/systems/http/mapper/page-response-mapper.ts`
- `paginationQuerySchema` — `src/systems/pagination/schema/pagination-query-schema.ts`

### Regles non negociables

1. Le repo ne encode jamais le curseur et n'a pas de sort hardcode.
2. La query owne le sort (constante `MODULE_SORT`) et encode le `nextCursor`.
3. `Page<T>` est le type in-process; `CursorPageResponse<T>` est uniquement le wire format HTTP.
4. Le controller attrape `InvalidCursorError` → `InvalidPaginationCursorError` (400).
5. Le schema HTTP compose `paginationQuerySchema` via `t.Composite`.
6. `data` est reserve au wire d'une page curseur. Une liste non paginee utilise
   un champ nomme.

### Listes non paginees

`data` n'est pas le nom generique d'un tableau: c'est le champ de
`CursorPageResponse<T>`, ou il voyage avec `next_cursor` et `has_more`. Le voir
seul dans une reponse annonce une pagination qui n'existe pas.

Une liste non paginee nomme donc son contenu — `files`, `instrument_ids`,
`balances`, `providers`, `models`, `connections`:

```ts
// paginee
export const listBotsResponseSchema = t.Object({
    data: t.Array(botResponseSchema),
    next_cursor: t.Union([t.String(), t.Null()]),
    has_more: t.Boolean(),
});

// non paginee
export const listInferenceProvidersResponseSchema = t.Object({
    providers: t.Array(inferenceProviderResponseSchema),
});
```

Le champ nomme dit ce que la liste contient, et le jour ou elle devient une page,
passer a `data` + `next_cursor` + `has_more` est un changement cassant assume
plutot qu'une derive silencieuse de forme.

Ne pas paginer une liste dont la source n'est pas une requete SQL ordonnee: un
curseur suppose un jeu stable entre deux pages, ce qu'un catalogue externe
rafraichi par TTL n'offre pas. Le levier pour une liste longue y est une
recherche, pas un curseur.

Exception connue: `listBotBrokerageAccountsEndpoint` renvoie `{data: [...]}` sans
pagination. Anteriorite, pas un modele a suivre.

### Nommage des schemas HTTP

Un schema est nomme d'apres l'endpoint qu'il sert, un fichier par endpoint —
`list-bots-response-schema.ts`, `connect-brokerage-account-params-schema.ts`. Un
schema d'element partage par plusieurs endpoints garde son propre fichier au
singulier (`bot-response-schema.ts`), et l'enveloppe de liste vit a cote.

Deux endpoints dont les parametres coincident aujourd'hui gardent chacun le leur:
rien ne garantit qu'ils resteront identiques, et un schema partage transforme un
ajout sur l'un en changement de contrat pour l'autre.

## 8) Checklist avant livraison (obligatoire)

- Architecture respectee avec les layers et sous-dossiers canoniques.
- `api/` present avec `contract.ts`, `operation/`, `error/`, `facade.ts`, `view/`, `type/`.
- Frontieres respectees (pas d'import profond inter-modules).
- FK cross-module (si presentes) declarees via `references()` dans les schemas et documentees.
- Dependency rule respectee (`api -> application -> domain`, infra vers interieur).
- Aucune logique metier lourde dans controllers et repositories techniques.
- Pattern jobs respecte (`infrastructure/job/*`, ports metier `send*`, worker dedie, zero dependance directe a `pg-boss`).
- Schemas HTTP alignes (`schema/request`, `schema/response`, `schema/params`, `schema/query`), nommes d'apres leur endpoint, un fichier par endpoint.
- Listes: `data` uniquement pour une page curseur, champ nomme sinon.
- Documentation technique mise a jour si une decision structurante change.
