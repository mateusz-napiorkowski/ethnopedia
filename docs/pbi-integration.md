# Integracja PBI

Ethnopedia może wysyłać rekordy kolekcji do PBI jako Research Objects. Backend działa jako przelotka: czyta rekordy z MongoDB, mapuje pola kategorii Ethnopedii na payload PBI i zapisuje mapowanie `artwork._id -> PBI RO identifier` w kolekcji `pbisyncs`.

## Konfiguracja backendu

Domyślne wartości są zgodne ze środowiskiem PBI dev:

```env
PBI_API_BASE_URL=https://dariah-hub-dev.apps.dcw1.paas.psnc.pl/api
PBI_DEFAULT_RESEARCH_AREA=Astronomy
```

Autoryzacja MVP obsługuje trzy warianty:

1. `X-PBI-Access-Token` wysłany z UI mappera — token z Postmana, używany tylko dla danego requestu.
2. `PBI_BEARER_TOKEN` w env — pomocniczo do testów serwerowych.
3. `PBI_API_KEY` w env — docelowo, gdy PBI udostępni klucze API.

Tokenów/API key nie należy commitować ani logować.

## Endpointy Ethnopedii

- `GET /api/v1/pbi/status` — connectivity/config status.
- `GET /api/v1/pbi/collections/:collectionId/preview` — lista pól i przykładowe rekordy.
- `POST /api/v1/pbi/collections/:collectionId/sync/preview` — dry-run payloadów PBI.
- `POST /api/v1/pbi/collections/:collectionId/sync` — realna synchronizacja do PBI.
- `GET /api/v1/pbi/syncs?collectionId=...` — zapisane statusy synchronizacji.

## ID rekordów

Backend zawsze dodaje `artwork._id` do adnotacji PBI jako:

```json
{
  "property": "http://purl.org/dc/terms/identifier",
  "value": ["<ethnopediaArtworkId>"]
}
```

Dzięki temu można później znaleźć RO w PBI przez:

```http
GET /api/triples?predicate=http://purl.org/dc/terms/identifier&object=<ethnopediaArtworkId>
```

## Deployment CKC

Workflow `.github/workflows/deploy-ckc.yml` jest manualny (`workflow_dispatch`). Wymaga sekretów:

- `CKC_SSH_HOST`
- `CKC_SSH_USER`
- `CKC_SSH_PRIVATE_KEY`
- opcjonalnie `CKC_SSH_PORT` — domyślnie `6624`

Workflow nie wykonuje `git reset`, `git pull`, `stash` ani `checkout` na istniejącym repo serwera. Kopiuje pliki przez `rsync` bez `--delete` i wyklucza lokalne override'y CKC:

- `docker-compose.yml`
- `frontend/package.json`
- `frontend/package-lock.json`
- `mongodb_scripts/backup.sh`
- `mongodb_data/`
- `backups/`

Przed kopiowaniem zapisuje snapshot statusu i diffów lokalnych override'ów w `~/ethnopedia-deploy-backups/`.
