# Architecture technique

Ce backend suit une architecture **modular monolith** avec une approche **clean architecture pragmatique**.

Le projet utilise le vocabulaire **ports/adapters** (style hexagonal) a l'interieur de la clean architecture: les ports vivent en `application/port/` et les adapters techniques en `infrastructure/`.

L'objectif est simple: garder un systeme facilement deployable (un seul codebase et des runtimes clairs), tout en preservant des frontieres strictes entre les domaines metier.

## 1) Style architectural

### Modular monolith

- Le code est organise en modules metier (`src/modules/*`).
- Tous les modules vivent dans le meme repository et le meme deployable logique.
- L'orchestration centrale est faite par `Application` (`src/app.ts`) + `ModuleManager` (`src/systems/module/module-manager.ts`).
- Chaque module implemente un cycle de vie standard via `Module` (`init -> start -> stop`).

Ce choix permet:

- une complexite operationnelle faible (pas de microservices a orchestrer),
- une evolution progressive des modules,
- un decouplage metier explicite sans cout distribue premature.

### Multi-runtime, meme coeur applicatif

Le meme backend s'execute en 3 modes (`AppMode`):

- `api`
- `ws`
- `worker`

Chaque mode partage les memes modules et le meme contexte de runtime (`RuntimeModeContext`), avec des capacites differentes selon le mode (app HTTP/WebSocket ou worker jobs).

> Important: le mode runtime `api` (processus HTTP) est different du dossier `api/` d'un module (surface publique in-process).

## 2) Clean architecture (par module)

Chaque module suit la separation suivante:

- `domain/`: regles metier pures (entites, value objects, policies, services metier).
- `application/`: use-cases (commands/queries), orchestration metier, ports, modeles applicatifs.
- `infrastructure/`: adapters techniques (DB, HTTP/Elysia, brokers externes, jobs, eventing).
- `api/`: surface publique in-process du module (facades, contrats, DTO) utilisee par les autres modules.

### Structure canonique d'un module

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
          schema/
          mapper/
        event/listener/
        job/handler/
      outbound/
        persistence/
          drizzle/
            repository/
            schema/
            mapper/
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

Notes:

- Tous les sous-dossiers ne sont pas obligatoires des le depart.
- `api/` est la frontiere inter-modules in-process: aucune route HTTP dans `api/`.
- Le transport HTTP (Elysia routes/controllers) vit dans `infrastructure/adapter/inbound/http/`.
- Le module expose sa surface publique via `index.ts` et ses contrats/facades dans `api/`.
- Si un module publie des integration events inter-modules, leurs contrats vivent dans `api/event/`.

### Responsabilites par couche

- `domain/`: invariants metier, objets metier, policies, erreurs metier pures.
- `application/`: orchestration des cas d'usage (commands/queries), modeles applicatifs internes, ports sortants.
- `infrastructure/`: details techniques organises en adapters entrants et sortants (Drizzle, Elysia, jobs, integrations externes).
- `api/`: contrat public (`contract.ts`), contrats d'integration events (`event/`), operations (`operation/`), erreurs API (`error/`), facade (`facade.ts`), modeles d'echange (`view/`, `type/`).
- `application/` ne doit pas importer `api/` de son propre module; un use-case publie un event applicatif via un port applicatif implemente en `infrastructure/event/publisher/`.
- un `command/` ou `query/` ne doit pas dependre directement d'un autre `command/` ou `query/`; factoriser la logique partagee dans `application/service/`, `domain/service/` ou un port selon le besoin.
- les events applicatifs d'un module vivent en `application/event/` et servent a declencher des reactions locales sans figer un contrat inter-module.

### Pattern providers externes

Quand un module consomme plusieurs providers externes (market data, brokers, etc.):

- definir un port provider en `application/port/*-provider-port.ts`,
- definir un selector en `application/port/*-provider-selector.ts`,
- implementer un registry selector en `infrastructure/external/provider/*-provider-registry.ts`,
- enregistrer les providers techniques (Alpaca, etc.) dans `module.ts`.

Si une integration externe est partagee entre plusieurs modules, la placer dans
`src/integrations/<provider>/` (pas dans `systems/`).

Ce pattern evite les `if/else` provider dans les use-cases et facilite l'extension multi-provider.

### Config module

- centraliser les schemas de configuration d'un module dans
  `infrastructure/config/schema/*.ts`,
- injecter les valeurs dans les constructors `application` (queries/services),
- parser/valider la config au bootstrap applicatif puis l'injecter dans le module,
- eviter les constantes hardcodees dans les controllers.

### Convention erreurs

- Standardiser sur `errors/` (plutot que `exceptions/`) dans chaque couche.
- Nommage conseille: suffixe `*Error` (ex: `InstrumentNotFoundError`).
- `domain/errors`: erreurs metier et violations d'invariants.
- `application/errors`: erreurs d'orchestration/use-case.
- `infrastructure/errors`: erreurs techniques/adapters.

### Convention tests

Les tests vivent hors `src/`:

```text
tests/
  modules/
    <module-name>/
      application/
      domain/
      infrastructure/
  e2e/
```

- `tests/modules/<module-name>/...`: tests par module et par couche.
- `tests/e2e/`: parcours transverses, API et comportements bout-en-bout.

Concretement:

- les `routes/controllers` HTTP appartiennent a `infrastructure` (adapter entrant),
- `api/` ne contient pas le transport HTTP; il expose l'interface module a module.

### Regle de dependance (obligatoire)

Toujours dependre vers l'interieur:

- `api (in-process facade) -> application -> domain`
- `infrastructure -> application|domain` (via ports/interfaces)
- `domain` ne depend d'aucun detail technique

En pratique:

- pas d'acces direct DB depuis `domain`,
- pas d'import d'un detail `infra` d'un autre module,
- communication inter-modules via surface publique (`api/` facade/contrats), pas via imports profonds.
- les integration events inter-modules sont exportes par `api/event/`, puis consommes par des listeners `infrastructure/event/listener/integration/reaction/`.
- les events applicatifs d'un module ne doivent pas etre exposes via `api/event/`.

### Contrat d'erreur inter-modules (API in-process)

Pour les appels `module -> module` via `api/`, le module appele expose un contrat
`Result<Success, ApiError>` plutot que de laisser fuiter ses erreurs internes.

Implementation standard:

- utiliser `neverthrow` pour `Result`, `ok` et `err`.
- utiliser `ModuleApiError` (`systems/module`) comme type d'erreur generique de frontiere,
  avec des codes namespacés par module.
- garder `api/contract.ts` comme contrat racine explicite (pas un barrel passif).
- placer les contrats d'operations dans `api/operation/*` et les codes/types d'erreur dans `api/error/*`.

Regle adoptee:

- les use-cases internes peuvent throw des erreurs applicatives/metier,
- la facade `api/` traduit ces erreurs en `ApiError` stable,
- les consommateurs traitent `result.ok` / `result.error.code`.

Objectif:

- eviter la fuite des erreurs internes d'un module vers un autre,
- versionner un contrat inter-modules explicite et stable,
- garder des frontieres clean architecture strictes.

### Cas particulier: FK cross-module en modular monolith

Dans ce projet, certains modules peuvent avoir besoin d'integrite referentielle SQL
vers des tables d'un autre module (ex: `market_data.market_feeds.instrument_id`
vers `market_structure.instruments.id`).

Regle adoptee:

- autoriser la FK en base pour garantir l'integrite des donnees,
- conserver la communication metier inter-modules via `api/` facade,
- autoriser les imports de tables Drizzle cross-module uniquement pour les FK de schema.

Implementation recommandee:

- declarer la FK cross-module avec `references()` dans `infrastructure/adapter/outbound/persistence/drizzle/model/*`,
- limiter l'import cross-module aux definitions de tables (pas de repositories, pas de services,
  pas de logique metier),
- documenter explicitement la FK cross-module dans l'epic du module.

Ce compromis preserve:

- la robustesse data (contraintes SQL dans schema genere automatiquement),
- des frontieres metier propres (le couplage reste strictement persistence/schema).

## 3) Assemblage applicatif

Au boot:

1. `Application` construit logger + runtime jobs (`pg-boss` + adapters sender/worker).
2. `Application` choisit le runtime (`api`, `ws`, `worker`).
3. Les modules sont instancies et enregistres dans `ModuleManager`.
4. `ModuleManager` appelle `init`, puis `start`.
5. A l'arret, `stop` est appele en ordre inverse.

Cette mecanique garantit un boot deterministe et une fermeture propre des ressources.

## 4) Eventing et jobs

La gestion des jobs suit un pattern module-first avec un systeme transverse dedie.

### Systeme transverse `systems/jobs`

- `src/systems/jobs/core/` expose les contrats minimaux partages:
    - `JobSender`
    - `JobWorker`
    - `JobPayloadParser`
    - `JobDefinition` (name-only)
    - `JobHandler`
    - `JobContext` (vide pour MVP)
    - `Worker` (contrat de cycle de vie worker cote module)
- `src/systems/jobs/pg-boss/` contient l'adaptation concrete `pg-boss`:
    - `PgBossJobSender`
    - `PgBossJobWorker`
- `src/systems/jobs/parser/` contient les parseurs runtime (ex: `ZodJobPayloadParser`).

Regles:

- Aucun module ne depend directement de `pg-boss`.
- `pg-boss` est encapsule dans `systems/jobs`.
- Le core jobs reste etroit (`send`, `work`, parsing), sans recopier toute la surface `pg-boss`.

### Pattern module pour les jobs

Chaque module qui utilise des jobs possede son arbre dedie en infra:

```text
infrastructure/
  job/
    payload/
    definition/
    handler/
    sender/
    worker/
```

- `payload/`: type + schema de payload.
- `definition/`: nom de job (`JobDefinition`).
- `handler/`: adapters entrants fins qui deleguent a l'application.
- `sender/`: implementation des ports applicatifs metier basee sur `JobSender`.
- `worker/`: classe `*Worker` qui enregistre les handlers avec `JobWorker` et peut faire le bootstrap du module worker.

### Contexte runtime

- `RuntimeContext` expose `jobSender`.
- `WorkerRuntimeContext` expose en plus `jobWorker`.
- `Application` instancie `pg-boss`, puis `PgBossJobSender` et `PgBossJobWorker`.

Voir aussi: `docs/technical/jobs-worker-pattern.md`.

## 5) Pourquoi ce compromis

Cette architecture combine:

- **vitesse de livraison** d'un monolithe modulaire,
- **qualite de conception** de la clean architecture,
- **evolutivite** vers des modules plus riches sans refonte globale.

Elle est adaptee au stade actuel du projet: progresser vite sur les domaines metier tout en verrouillant des frontieres propres des maintenant.

## 6) Pattern pagination curseur

Ce backend utilise la **pagination par curseur opaque** (cursor-based pagination). Le pattern est decrit ci-dessous et doit etre suivi dans tous les modules qui implementent une liste paginee.

### Responsabilites

| Couche                                           | Responsabilite                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `application/query`                              | Clamp du limit, decode du curseur entrant, owne l'ordre de tri (`SORT` constant), encode le `nextCursor`, retourne `Page<T>`                                     |
| `application/repository` (port)                  | Accepte `limit: number`, `cursor: CursorPayload \| null`, `sort: SortField[]` (tous requis, sans valeurs par defaut). Retourne `{ data: T[]; hasMore: boolean }` |
| `infrastructure/adapter/outbound/persistence`    | Execute la requete avec `DrizzleCursorApplier.buildWhere()` + `buildOrderBy()`. Retourne `{ data, hasMore }` sans encoder le curseur.                            |
| `infrastructure/adapter/inbound/http/controller` | Attrape `InvalidCursorError` → `InvalidPaginationCursorError` (400)                                                                                              |
| `infrastructure/adapter/inbound/http/mapper`     | Utilise `PageResponseMapper<Input, Output>` pour convertir `Page<T>` → `CursorPageResponse<T>` (snake_case HTTP)                                                 |
| `infrastructure/adapter/inbound/http/schema`     | Compose `paginationQuerySchema` via `t.Composite`                                                                                                                |

### Types systeme (`src/systems/pagination/`)

- `Page<T>` — type in-process: `{ data: T[]; nextCursor: string | null; hasMore: boolean }` (camelCase)
- `CursorPageResponse<T>` — type HTTP wire: `{ data: T[]; next_cursor: string | null; has_more: boolean }` (snake_case)
- `CursorPayload` — payload decode: `{ sort: SortField[]; values: unknown[] }`
- `SortField` — `{ field: string; direction: SortDirection }`
- `CursorPaginator` — `clampLimit()`, `encodeCursor()`, `decodeCursor()` (throw `InvalidCursorError`)
- `DrizzleCursorApplier` — `buildWhere(table, cursor)`, `buildOrderBy(table, sort)`
- `PageResponseMapper<Input, Output>` — `src/systems/http/mapper/page-response-mapper.ts`
- `paginationQuerySchema` — `src/systems/pagination/schema/pagination-query-schema.ts`
- `InvalidPaginationCursorError` — `src/systems/http/errors/invalid-pagination-cursor.ts`

### Exemple (module `thesis`)

```typescript
// application/query/list-theses.ts
const THESIS_SORT: SortField[] = [
    { field: "createdAt", direction: SortDirection.ASC },
    { field: "id", direction: SortDirection.ASC },
];

async execute(input): Promise<Page<Thesis>> {
    const limit = this.paginator.clampLimit(input.limit);
    const cursor = input.cursor ? this.paginator.decodeCursor(input.cursor) : null;
    const { data, hasMore } = await this.repository.list({ ...input, limit, cursor, sort: THESIS_SORT });
    const last = data.at(-1);
    const nextCursor = hasMore && last
        ? this.paginator.encodeCursor({ sort: THESIS_SORT, values: [last.createdAt, last.id.value] })
        : null;
    return { data, nextCursor, hasMore };
}

// application/repository/thesis-repository.ts (port)
list(input: { limit: number; cursor: CursorPayload | null; sort: SortField[]; ... }): Promise<{ data: Thesis[]; hasMore: boolean }>;

// infrastructure/adapter/outbound/persistence/drizzle/repository/drizzle-thesis-repository.ts
async list(input): Promise<{ data: Thesis[]; hasMore: boolean }> {
    // use input.sort (no hardcoded sort), DrizzleCursorApplier.buildWhere/buildOrderBy
    // return { data, hasMore } — NO cursor encoding
}
```

### Regles non negociables

- Le repo **ne jamais encoder le curseur** ni avoir de sort hardcode: il execute generiquement.
- La query **owne le sort** (constante `MODULE_SORT`) et **encode le nextCursor**.
- `Page<T>` (camelCase) est le type in-process; `CursorPageResponse<T>` (snake_case) est uniquement le wire format HTTP.
- Le controller attrape `InvalidCursorError` et le traduit en `InvalidPaginationCursorError` (400).
- Le schema HTTP compose toujours `paginationQuerySchema` via `t.Composite`.

## 7) Regles de contribution

Quand vous ajoutez une fonctionnalite:

1. Placez la logique metier dans `domain`/`application`, pas dans les adapters.
2. Colocalisez les types `Input`/`Output` dans chaque command/query et utilisez `application/dto` pour les DTO applicatifs internes.
3. Gardez les dependances dirigees vers le coeur metier.
4. Enregistrez le module dans `Application` si nouveau module.
5. Documentez les decisions structurantes dans `docs/` (epics/ADR/docs techniques).
