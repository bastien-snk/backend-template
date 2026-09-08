# Coding Conventions

## Modeling

- Define types in the narrowest scope that owns their meaning.
- Promote a type only when it has independent domain meaning, multiple consumers, or is part of a public module contract.
- Do not add domain properties for serialization, persistence, display, indexing, or a single consumer.
- Timestamps belong in the domain only when a business rule depends on them.

## Errors and Contracts

- Use `*Error` names for errors.
- Module facades translate internal errors to stable, namespaced `ModuleApiError` codes.
- Commands and queries do not call each other across module boundaries.

## Integration Events

Integration events are public, past-tense facts published after durable state changes. Their contracts belong in the producer module's `api/event/`; application events remain internal.
