# Synology Deployment

`docker-compose.yml` deployt das Portfolio auf der Synology über Container Manager / Portainer.

## Funktionsweise

- **`portfolio`**: klont bei jedem (Neu-)Start das Repository frisch, baut es (`npm install && npm run build`) und serviert `dist/angular-portfolio/browser` per `http-server` auf Port `4200`. Der gebaute Commit-Hash wird nach `/status/commit` geschrieben (geteiltes Volume `portfolio_status`).
- **`portfolio-watcher`**: prüft alle `CHECK_INTERVAL` Sekunden (Standard: 60) per `git ls-remote`, ob es auf dem `BRANCH` (Standard: `main`) einen neueren Commit als den zuletzt gebauten gibt. Falls ja, wird der `portfolio`-Container per Docker-Socket neu gestartet, wodurch er den Build-Vorgang erneut durchläuft.

Dadurch wird das Portfolio automatisch neu gebaut, sobald ein neuer Commit auf `main` gepusht wird – ganz ohne eingehenden Webhook, also auch ohne Portfreigabe auf der Synology nötig.

## Anpassen

Alle relevanten Werte lassen sich über die `environment`-Variablen des `portfolio-watcher`-Service anpassen:

- `REPO_URL` – Repository-URL
- `BRANCH` – zu beobachtender Branch
- `CHECK_INTERVAL` – Prüfintervall in Sekunden
- `TARGET_CONTAINER` – Name des Containers, der neu gestartet werden soll

## Deploy

Im Container Manager / per SSH:

```bash
docker compose -f infra/synology/docker-compose.yml up -d
```
