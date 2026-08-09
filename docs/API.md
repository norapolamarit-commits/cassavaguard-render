# CassavaGuard AI — REST API

Base URL: `http://127.0.0.1:8800` · Interactive docs: `/api/docs` and
`/api/redoc` in development. API docs are disabled by default in production.

All `/api/*` requests are logged (method, path, status, duration) to the `logs` table.
Logs have a bounded retention limit. The shipped application uses
`AUTH_REQUIRED=false`, so domain routes resolve to the shared internal application
user without an `Authorization` header. Set `AUTH_REQUIRED=true` only when restoring
the legacy account flow.

Always-public routes: `/api/health`, login/register/forgot/reset, `/api/models`,
`/api/models/active`, `/api/models/compare`, `/api/models/readiness`, and
`/api/predict/classes`.

## Auth
| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | `{email,password,full_name,language}` | legacy account mode only; SPA does not use it |
| POST | `/api/auth/login` | form `username,password` (OAuth2) | legacy account mode only |
| POST | `/api/auth/login-json` | `{email,password}` | legacy account mode only |
| POST | `/api/auth/forgot` | `{email}` | generic response; emails an expiring link when SMTP is configured |
| POST | `/api/auth/reset` | `{token,new_password}` | token is hashed at rest, single-use, and expires |
| GET/PATCH | `/api/auth/me` | — / `{full_name,language}` | shared app user when `AUTH_REQUIRED=false` |

## Dashboard
`GET /api/dashboard/kpis` · `/risk-distribution` · `/health-by-field`

Farmer responses contain only fields owned by the current user. Researchers and
Admins have read access across fields.

## Fields
`GET /api/fields` · `GET /api/fields/geojson` · `POST /api/fields` · `GET /api/fields/{id}`
(field detail fuses weather + soil + NDVI series + predicted risks + recommendations)

Researchers are read-only. Farmers may create and access their own fields;
Admins may access all fields.

## AI Prediction
| Method | Path | Form fields |
|--------|------|-------------|
| POST | `/api/predict/image` | `file`, `source` (leaf/plant/canopy), `field_id?` |
| POST | `/api/predict/csv` | `file`, `field_id?` |
| GET | `/api/predict/classes` | class list |

Image probabilities contain only `healthy`, `cbb`, `cbsd`, `cmd`, and `cgm`.
`auxiliary_findings` contains independently thresholded model heads such as
`brown_leaf_spot`; these values do not sum with or alter the five-way `probs`.
`requires_review`, `review_reasons`, `quality`, `supported_classes`, and
`unsupported_classes` disclose the deployment and image-quality gates. Auxiliary
findings are persisted separately in history.

## Satellite
`/api/satellite/meta` · `/status` · `/{id}/timeline?months=` · `/{id}/grid?index=&date=`
· `/{id}/passes` · `/{id}/compare?index=&date_a=&date_b=`

## Weather
`/api/weather/current` · `/history?days=` · `/forecast?days=` · `/summary` (each accepts `field_id` or `lat`+`lon`)

## Soil
`GET /api/soil/{id}` · `GET /api/soil/{id}/moisture?days=` ·
`GET /api/soil/{id}/samples` · `POST /api/soil/{id}/samples` ·
`GET /api/soil` (cross-field comparison)

Sample body: `{sampled_at, source: lab|sensor|field_kit, lab_name?, texture?,
ph?, om_pct?, n_ppm?, p_ppm?, k_ppm?, cec?, moisture_pct?, notes?}`.
At least one measured metric is required. Missing metrics remain `null`.

Weather, satellite, and soil responses carry a `data_source` object. In live
mode, provider failure is HTTP 503 and is never replaced by synthetic values.

## Notifications
`GET /api/notifications?unread_only=` · `POST /api/notifications/{id}/read` · `POST /api/notifications/read-all`

Read state is stored per user.

## History
`GET /api/history/predictions?q=&top_class=&field_id=&source=&limit=`
· `GET /api/history/predictions/{id}` · `GET /api/history/predictions/export.csv`

Farmer history is restricted to the current user's predictions. Image and
heatmap URLs are short-lived signed `/api/files/{prediction_id}/{asset}` links.

## Models / System
`/api/models` · `/api/models/active` · `/api/models/compare` ·
`/api/models/readiness` · protected `/api/models/system` ·
protected `/api/models/self-test`

`self-test` loads all 15 published artifacts (CNN, Brown Leaf Spot auxiliary,
eight classical and five disabled experimental fusion models), verifies each
hash/class/feature contract and runs a probability smoke test. Fusion rows report
`experimental=true` and `serving_eligible=false`. `readiness` reports the correct
multi-head task and data/model status for all 13 display classes.

`GET /api/logs` is Admin-only.

## Admin

`GET /api/admin/users` · `PATCH /api/admin/users/{id}/role` with
`{role: admin|researcher|farmer}`. Both routes are Admin-only, and the last
Admin cannot demote their own account.
