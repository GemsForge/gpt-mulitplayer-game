# Table View Contracts

Status: refinement proposal grounded in the existing repository documentation.

This document consolidates the Table View, View Column Configuration, and View
Query Configuration contracts before further persistence or API work. It does
not authorize a live-database migration or change canonical personal records.

## 1. Ownership and boundaries

- A Table View is Hub-scoped presentation metadata for an existing logical
  SQLite table.
- A View never copies, recreates, mutates, or deletes the canonical records or
  schema of its target table.
- A View owns its column and query configuration metadata.
- The API validates logical table and column identifiers against the live
  schema; those references are not physical foreign keys.
- Repository migrations support isolated development, FIT, and disposable
  local databases only. Normal API startup must not migrate the personal
  database.
- Routes validate requests and map responses; services own database behavior;
  models and DTOs define persistence and transport shapes.

## 2. Table View contract

### 2.1 Persistence fields

`TableViews` contains:

| Field | Type / rule | Contract |
| --- | --- | --- |
| `ViewID` | Stable identifier | Required identity; never reassigned during updates. |
| `HubID` | Hub identifier | Required owner; all child metadata must remain in the same Hub scope. |
| `TableName` | Exact logical identifier | Required target table; no fuzzy matching or automatic substitution. |
| `Name` | Non-empty text | User-facing view name within the owning scope. |
| `ViewType` | Closed vocabulary | `Table`, `List`, `Gallery`, or `Grid`. |
| `IsDefault` | Boolean | At most one default for each `(HubID, TableName)`. |
| `SortOrder` | Ordered numeric value | Stable ordering for views within the owning scope. |
| `ConfigurationVersion` | Positive version | Supports deterministic contract/configuration evolution. |
| `CreatedAt` | Timestamp | Creation audit field; immutable after creation. |
| `UpdatedAt` | Timestamp | Last successful metadata update. |

### 2.2 Invariants

- A View references exactly one Hub and one logical table.
- A partial unique constraint permits at most one default View for each
  `(HubID, TableName)` while allowing multiple non-default Views.
- Supported `ViewType` values are rejected when malformed or outside the
  controlled vocabulary.
- Deleting a View may delete only its owned configuration metadata.
- Deleting a View must never delete target-table records.

## 3. View Column Configuration contract

### 3.1 Persistence fields

`ViewColumnConfigurations` contains one row per configured View/Column pair:

| Field | Type / rule | Contract |
| --- | --- | --- |
| `ViewColumnID` | Stable identifier | Required identity. |
| `ViewID` | View identifier | Required owner; must reference the same Hub scope. |
| `ColumnName` | Exact logical identifier | Required live-schema reference; not a physical FK. |
| `IsVisible` | Boolean | Controls presentation only. |
| `SortOrder` | Non-negative ordered value | Determines sibling column order. |
| `Width` | Nullable pixel width | Optional presentation hint; null means no saved width. |

### 3.2 Invariants

- `(ViewID, ColumnName)` is unique.
- Hidden columns remain represented in metadata and can be restored.
- Column order is deterministic and independent for each View.
- One View’s configuration cannot mutate another View’s configuration.
- Width is presentation metadata and cannot alter the canonical Table schema.
- Missing or stale columns are preserved and reported as unavailable; they are
  not silently removed or replaced.

## 4. View Query Configuration contract

### 4.1 Persistence fields

`ViewQueryConfigurations` stores a server-validated query tree. Each node has
an owning View and an explicit node kind:

| Node kind | Children | Purpose |
| --- | --- | --- |
| `Group` | Conditions or Groups | Boolean filter composition. |
| `Condition` | None | Typed comparison against one logical column. |
| `Sort` | None | Ordered result sorting. |
| `RecordGroup` | None | Result grouping, separate from Boolean filtering. |

Common metadata includes a stable node identifier, `ViewID`, optional parent
identifier, node kind, sibling `SortOrder`, and the node-specific operator,
column, direction, or value fields.

### 4.2 Tree invariants

- Each View has one non-empty filter root.
- Filter Groups use only `AND` or `OR`.
- A Group may contain same-View Conditions or Groups in sibling order.
- Conditions, Sort nodes, and RecordGroup nodes cannot have children.
- Parent references must exist, belong to the same View, and cannot self-reference.
- Indirect cycles are rejected before query translation.
- Sort and RecordGroup nodes are not Boolean filter expressions.
- Query translation executes only validated server vocabulary; arbitrary client
  SQL is never accepted or executed.

## 5. Operator and value contract

Comparison operators are a closed server vocabulary.

| Operator family | Operand cardinality | Example |
| --- | --- | --- |
| `IsNull`, `IsNotNull` | Zero | `Category IS NULL` |
| Ordinary comparison | One | `MonthlyAmount > 20` |
| `Between` | Two | `DueDate BETWEEN start AND end` |
| `In` | One or more | `Status IN (...)` |

Every value carries explicit `ValueType` metadata and a canonical encoding.
Representative values are:

| Value type | Canonical encoding |
| --- | --- |
| Text | UTF-8 text value |
| Integer | Canonical integer text |
| Decimal / Number | Canonical decimal text |
| Boolean | `true` or `false` |
| Date | `YYYY-MM-DD` |
| DateTime | Repository-approved canonical date-time format |
| Null | Database null, never the text `"null"` |

The server rejects values incompatible with the live column type, invalid
operator cardinality, malformed dates, and values that could represent SQL
fragments.

## 6. Schema-drift contract

- `TableName` and `ColumnName` are exact identifiers.
- If a table or column is removed or renamed, saved metadata remains preserved
  and becomes stale/unavailable.
- Errors identify the affected View and missing identifier.
- The API never guesses a similar name or silently reinterprets a reference.
- An intentional rename requires an explicit reviewed schema migration and the
  normal backup, confirmation, verification, and audit workflow.
- Schema-drift handling must not mutate or delete canonical personal records.

## 7. Ownership, deletion, and migration contract

```text
Hub
└── TableViews
    ├── ViewColumnConfigurations
    └── ViewQueryConfigurations
```

- Hub deletion cascades only to its owned Table Views and their metadata.
- View deletion cascades only to its column and query configuration rows.
- No cascade may cross into `Services`, `Transactions`, or another canonical
  data table.
- Foreign keys, indexes, default constraints, and cascade behavior must be
  verified in isolated SQLite/Fluent databases.
- The personal database selected by `DATABASE_PATH` remains outside automatic
  migration execution.

## 8. DTO and API boundary

DTOs must expose stable identifiers, ownership, presentation metadata, and
validated query semantics needed by clients. They must not expose persistence-
only implementation details or allow clients to submit arbitrary SQL.

The React Table Kit remains domain-neutral. It may consume typed record IDs,
property definitions, query state, selection state, and view configuration, but
feature adapters retain ownership of API transport, persistence, domain
formatting, permissions, and mutations.

## 9. Decisions still required before implementation readiness

The repository documents the core contract, but these details should be made
explicit in the child stories or linked authoritative documents:

1. The complete controlled vocabulary for comparison, sorting, grouping, and
   null operators.
2. The canonical DateTime encoding and timezone policy.
3. The exact DTO field list and which persistence timestamps/version fields are
   intentionally omitted.
4. The default-view promotion/deletion behavior when the current default is
   removed.
5. The authorized Hub deletion policy and whether Hub deletion is currently
   permitted at all.
6. The API error shape and status mapping for stale schema references,
   malformed trees, and incompatible values.

## 10. Verification sequence

1. Model and DTO round-trip tests for Table View and Column Configuration.
2. Query-tree shape, ownership, ordering, and cycle tests.
3. Typed value encoding and operator-cardinality tests.
4. Validation tests proving unsafe or incompatible expressions never reach
   query translation.
5. Default uniqueness and promotion/deletion tests.
6. View/Hub cascade tests proving canonical records remain untouched.
7. Schema-drift tests for missing tables, missing columns, and explicit renames.
8. Isolated migration and integration verification, followed by API/UI work.
