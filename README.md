# WindCast Command Centre

WindCast is a responsive dashboard for Great Britain wind generation forecasts. Forecast data comes from the public Elexon BMRS WINDFOR feed; observed wind generation comes from the FUELHH feed.

## Run the application locally

### Requirements

- Node.js LTS and npm
- Python 3.12 and pip
- Internet access to reach Elexon BMRS for live forecast and actual data

Start the Django backend in **Terminal 1**:

```powershell
cd C:\reint_assigment_backend
py -3.12 -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "local-development-secret-change-me"
python manage.py migrate
python manage.py runserver 8000
```

Start the Next.js frontend in **Terminal 2**:

```powershell
cd C:\reint_assigment
npm install
$env:WINDCAST_BACKEND_URL = "http://localhost:8000"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Keep both terminals running. The Next.js API routes proxy requests to Django, and Django fetches the live Elexon data. Stop either server with `Ctrl+C` in its terminal.

### Production build

```powershell
npm run lint
npm run build
npm run start
```

The production app runs at `http://localhost:3000`. To install the PWA, open the production app over HTTPS or localhost and select **Install WindCast** from the browser menu.

## Screens and displayed data

### 1. Start screen

The WindCast logo and **Continue** button are shown. Continue opens the Welcome screen. Google sign-in is not configured; this button advances the demo onboarding flow.

### 2. Welcome screen

This screen introduces WindCast and its Elexon data source. **Continue** opens the forecast dashboard.

### 3. Forecast dashboard

- **Peak forecast:** the highest published forecast value for the next UK calendar day, with its time.
- **Expected average:** the average of available Elexon forecast points for that day.
- **Forecast coverage:** the number of forecast points returned by Elexon.
- **Recommended buffer:** shown as `—` because a reserve/procurement model is not configured.
- **Day-ahead prediction:** peak, average, and point count. **Open full prediction** lists all returned forecast points.
- **Accuracy & reliability:** MAPE, MAE, and Bias are calculated by the backend from forecast points matched to observed FUELHH wind generation. Values appear after matching actual data is available. MAPE is a percentage; MAE and Bias are in MW. The matched-period count is shown below each value.
- **Today → tomorrow:** Today actual is the average observed wind generation returned for today. Tomorrow guess is the next-day forecast average.
- **At a glance:** displays up to five of the day's highest forecast points.
- **WindCast Assistant:** open the chat with the button at the lower-right corner.

Times use UK local time. Daylight-saving transitions may have 46 or 50 half-hour settlement periods.

## WindCast Assistant

Open the chat and ask about a date, peak, or average forecast. For example:

- `What was yesterday's windcast?`
- `What is tomorrow's peak wind forecast?`
- `Tell me today's average generation`
- `What was yesterday's highest MW?`

The chatbot answers from the latest revised Elexon forecast. It does not recreate the exact forecast as originally published on a past date. Confidence, forecast accuracy, and reserve questions are not answered with invented estimates.

## API routes

### `GET /api/windcast?date=YYYY-MM-DD`

The Next.js proxy calls Django `GET /api/v1/public/windcast/?date=YYYY-MM-DD`. Django returns the latest revised WINDFOR points for the requested UK date. If `date` is omitted, it defaults to tomorrow in UK time. The response includes `date`, `source`, `updatedAt`, `periods`, and `summary`. Each period includes its number, UK-local time, and forecast MW. If Elexon has not published data, `periods` is empty and a `message` is returned. Upstream errors return HTTP `502`.

### `GET /api/performance?date=YYYY-MM-DD`

The Next.js proxy calls Django `GET /api/v1/public/performance/?date=YYYY-MM-DD`. If `date` is omitted, Django uses today's UK date. Django fetches WINDFOR and FUELHH, matches observed wind values to forecast intervals, and returns `actualAverageMW`, `actualPeriods`, and `accuracy` (`mapePercent`, `maeMW`, `biasMW`, and `matchedPeriods`). If actual values have not arrived for forecast intervals yet, the affected metrics are `null` until matching observations are available.

### `POST /api/chat`

Send a JSON request body:

```json
{ "question": "What was yesterday's windcast?" }
```

The Next.js proxy forwards the question to Django `POST /api/v1/public/assistant/`. The answer is grounded in Elexon forecast data. If the backend or Elexon is unavailable, the API reports an error instead of making up forecast values.

Elexon endpoints are public and do not require an API key. See the [Elexon WINDFOR API documentation](https://bmrs.elexon.co.uk/api-documentation/endpoint/forecast/generation/wind/latest). Django retrieves data from Elexon; Next.js proxies browser requests to Django.

## Data notes and limitations

- These are GB-wide wind generation values, not local wind-farm or regional forecasts.
- Historical dates use Elexon's latest revised forecast; the app does not reconstruct the as-published forecast history.
- Accuracy metrics are computed only for intervals with both a forecast and an observed FUELHH wind value. Accuracy may be unavailable before actual values are published.
- Elexon does not provide model confidence bounds. The dashboard does not invent confidence or reserve values.
- The login screen is demo onboarding; account sign-in and Google authentication are not configured.
- In development, the service worker is unregistered to avoid stale HMR files. In production, the PWA can open its cached app shell offline, but live forecast, actual, and chat requests need internet access. API responses are not cached by the service worker.

## Project files

```text
app/
├── api/
│   ├── chat/route.ts          # Forecast-grounded assistant proxy
│   ├── performance/route.ts   # Live actual and accuracy proxy
│   └── windcast/route.ts      # Live WINDFOR forecast proxy
├── components/
│   ├── Features.tsx           # Forecast dashboard and assistant UI
│   ├── Login.tsx              # Start screen
│   └── Welcome.tsx            # Welcome/onboarding screen
├── globals.css                # Global styles
├── layout.tsx                 # Root layout and metadata
├── manifest.ts                # PWA manifest
└── page.tsx                   # Login → Welcome → dashboard flow
public/
├── logo.png
└── sw.js                      # Versioned app-shell service worker
```
