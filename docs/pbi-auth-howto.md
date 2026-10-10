# Jak zdobyć token PBI (dev / prod) — instrukcja krok po kroku

Postman ma problemy z "Authorize using browser" dla tego Keycloaka (podmienia
`redirect_uri` na własny `https://oauth.pstmn.io/v1/callback`, który nie jest
zarejestrowany jako dozwolony callback — dostajesz błąd `Invalid parameter:
redirect_uri`). Zamiast walczyć z Postmanem, token zdobywamy ręcznie przez
przeglądarkę + curl (flow PKCE). To jest w pełni powtarzalne i działa za
każdym razem.

## 0. Wymagania

- Dostęp VPN/tunel do sieci PSNC/DARIAH (patrz sekcja FoxyProxy niżej) — bez
  tego strona logowania Keycloak może się nie załadować.
- `python3` (do wygenerowania PKCE code_verifier/code_challenge).
- `curl`.

## 1. Skonfiguruj FoxyProxy (tunel SOCKS5 przez serwer `pp`)

1. Odpal tunel SSH z lokalnego komputera:

   ```bash
   ssh -D 8080 -N -q -C -p 6624 -i ~/.ssh/id_dariah_opi_wojciech_kasperski wkasperski@193.0.123.200
   ```

   Zostaw to okno/konsolę otwartą — tunel musi działać przez cały czas
   logowania.

2. W przeglądarce zainstaluj rozszerzenie **FoxyProxy** (Chrome/Firefox).
3. Otwórz ustawienia FoxyProxy → **Add New Proxy**:
   - Typ: **SOCKS5**
   - Host/IP: `127.0.0.1`
   - Port: `8080`
   - Zaznacz "Send DNS through SOCKS proxy" (ważne — inaczej DNS leci mimo
     tunelu i część hostów PSNC się nie rozwiąże).
4. Włącz ten proxy w FoxyProxy (tryb "Use this proxy for all URLs" na czas
   logowania, potem możesz wyłączyć).
5. Sprawdź połączenie (z lokalnego terminala, NIE przez tunel):

   ```bash
   curl -sv https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/auth
   ```

   Oczekiwany efekt: handshake TLS OK, odpowiedź 400 (brak parametrów) — to
   znaczy, że host jest osiągalny. Jeśli wolisz zweryfikować dokładnie przez
   tunel, rób to z maszyny, na której tunel faktycznie działa.

## 2. Wygeneruj PKCE code_verifier / code_challenge

```bash
python3 - <<'EOF'
import base64, hashlib, secrets

code_verifier = secrets.token_urlsafe(64)
code_challenge = base64.urlsafe_b64encode(
    hashlib.sha256(code_verifier.encode()).digest()
).decode().rstrip("=")

print("code_verifier:", code_verifier)
print("code_challenge:", code_challenge)
EOF
```

Zapisz sobie `code_verifier` (potrzebny w kroku 4) i `code_challenge`
(potrzebny w kroku 3).

## 3. Zbuduj link do logowania i otwórz go w przeglądarce (z włączonym FoxyProxy)

### DEV

```
https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/auth
  ?response_type=code
  &client_id=pbi-dev.apps.dcw1.paas.psnc.pl
  &state=manualtest
  &scope=profile%20openid
  &redirect_uri=https%3A%2F%2Fpbi-dev.apps.dcw1.paas.psnc.pl%2Fauth%2Flogin
  &code_challenge=<CODE_CHALLENGE_Z_KROKU_2>
  &code_challenge_method=S256
```

### PROD

```
https://login.dariah.pl/realms/pbi/protocol/openid-connect/auth
  ?response_type=code
  &client_id=pbi.dariah.pl
  &state=manualtest
  &scope=profile%20openid
  &redirect_uri=https%3A%2F%2Fpbi.dariah.pl%2Fauth%2Flogin
  &code_challenge=<CODE_CHALLENGE_Z_KROKU_2>
  &code_challenge_method=S256
```

Wklej cały link (bez łamań linii) do paska adresu przeglądarki z włączonym
FoxyProxy. Zaloguj się swoimi danymi.

## 4. Po zalogowaniu: wyciągnij `code` z przekierowanego URL-a

Po udanym logowaniu przeglądarka przekieruje Cię na
`https://pbi-dev.apps.dcw1.paas.psnc.pl/auth/login?state=manualtest&code=...`
(lub stronę może nie znaleźć — to normalne, liczy się sam URL w pasku
adresu). Skopiuj wartość parametru `code` z tego URL-a.

**Uwaga: kod wygasa bardzo szybko (ok. 60 sekund)** — od razu przejdź do
kroku 5.

## 5. Wymień `code` na tokeny (curl)

### DEV

```bash
curl -s -X POST https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/token \
  -d grant_type=authorization_code \
  -d client_id=pbi-dev.apps.dcw1.paas.psnc.pl \
  -d redirect_uri=https://pbi-dev.apps.dcw1.paas.psnc.pl/auth/login \
  -d code=<CODE_Z_KROKU_4> \
  -d code_verifier=<CODE_VERIFIER_Z_KROKU_2>
```

### PROD

```bash
curl -s -X POST https://login.dariah.pl/realms/pbi/protocol/openid-connect/token \
  -d grant_type=authorization_code \
  -d client_id=pbi.dariah.pl \
  -d redirect_uri=https://pbi.dariah.pl/auth/login \
  -d code=<CODE_Z_KROKU_4> \
  -d code_verifier=<CODE_VERIFIER_Z_KROKU_2>
```

Odpowiedź zawiera `access_token`, `refresh_token`, `id_token`,
`expires_in` (zwykle 300s = 5 minut dla access tokena, refresh token żyje
dłużej, ale też wygasa — patrz `refresh_expires_in`).

## 6. Użyj `access_token` w Ethnopedii

W UI mappera PBI wklej `access_token` w pole tokena (nagłówek
`X-PBI-Access-Token` wysyłany do backendu Ethnopedii). Backend korzysta z
niego do wywołań `GET/POST` do PBI REST API.

## 7. Odśwież token, gdy wygaśnie (bez ponownego logowania w przeglądarce)

Dopóki `refresh_token` jest ważny, nie trzeba przechodzić przez przeglądarkę
ponownie:

```bash
# DEV
curl -s -X POST https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/token \
  -d grant_type=refresh_token \
  -d client_id=pbi-dev.apps.dcw1.paas.psnc.pl \
  -d refresh_token=<REFRESH_TOKEN>

# PROD
curl -s -X POST https://login.dariah.pl/realms/pbi/protocol/openid-connect/token \
  -d grant_type=refresh_token \
  -d client_id=pbi.dariah.pl \
  -d refresh_token=<REFRESH_TOKEN>
```

## Ściąga — wszystkie adresy

| | DEV | PROD |
|---|---|---|
| Auth URL | `https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/auth` | `https://login.dariah.pl/realms/pbi/protocol/openid-connect/auth` |
| Token URL | `https://keycloak-dev.pcss.pl/realms/pbi-dev/protocol/openid-connect/token` | `https://login.dariah.pl/realms/pbi/protocol/openid-connect/token` |
| Client ID | `pbi-dev.apps.dcw1.paas.psnc.pl` | `pbi.dariah.pl` |
| Redirect/Callback URI | `https://pbi-dev.apps.dcw1.paas.psnc.pl/auth/login` | `https://pbi.dariah.pl/auth/login` |
| PBI REST API base | `https://dariah-hub-dev.apps.dcw1.paas.psnc.pl/api` | nieznane — `https://pbi.dariah.pl/api` serwuje front-end (Next.js), nie REST API; wymaga ustalenia z PSNC/Marcinem (patrz niżej) |

## ⚠️ Znany problem: PROD base URL REST API nieznany

`https://pbi.dariah.pl/api/ros/` zwraca 404 (i front-end HTML na `/api/`).
Zalogowanie się i zdobycie tokenu produkcyjnego (kroki 1–7 powyżej) **działa
niezależnie** od tego problemu — ale żeby faktycznie wysłać dane do PROD,
najpierw trzeba ustalić z administratorem PBI (Marcin Heliński / PSNC), pod
jakim adresem stoi realne REST API dla produkcji (analogicznie do
`https://dariah-hub-dev.apps.dcw1.paas.psnc.pl/api` na dev). Backend
Ethnopedii ma to skonfigurowane jako zmienną `PBI_API_BASE_URL` — gdy adres
będzie znany, wystarczy go ustawić dla środowiska `prod` w konfiguracji
backendu.
