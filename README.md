# WindCast Command Centre

WindCast UK ke wind generation forecast ko dekhne aur uske baare mein sawaal poochne ke liye ek responsive web app hai. Forecast Elexon BMRS ke public WINDFOR feed se aata hai.

## App ko kaise chalayein

### Zaroori cheezein

- Node.js ka current LTS version aur npm
- Internet connection, taaki Elexon se live forecast aa sake

### Local development: backend aur frontend dono

Pehle Django backend ko **Terminal 1** mein start karein:

```powershell
cd C:\reint_assigment_backend
py -3.12 -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "local-development-secret-change-me"
python manage.py migrate
python manage.py runserver 8000
```

Uske baad frontend ko **Terminal 2** mein start karein:

```powershell
cd C:\reint_assigment
npm install
$env:WINDCAST_BACKEND_URL = "http://localhost:8000"
npm run dev
```

Browser mein [http://localhost:3000](http://localhost:3000) kholein. Forecast aur assistant requests ab Next.js ke `/api/` proxy se Django API (`localhost:8000`) par jaati hain; Django Elexon BMRS provider ko call karta hai. Dono servers chalte rehne chahiye. Band karne ke liye har terminal mein `Ctrl+C` dabayein.

### Production build

```powershell
npm run lint
npm run build
npm run start
```

`npm run start` ke baad site `http://localhost:3000` par khulegi. PWA install karne ke liye production build ko HTTPS ya localhost par kholkar browser menu se **Install WindCast** chunein.

## Screen-by-screen: kya dikhega

### 1. Start screen

WindCast logo aur **Continue** button dikhega. Button click karne par Welcome screen khulti hai. Is project mein Google sign-in configured nahi hai; Continue sirf app ka onboarding flow aage badhata hai.

### 2. Welcome screen

Welcome screen app ka purpose aur Elexon data source batati hai. **Continue** click karne par Forecast dashboard khulta hai.

### 3. Forecast dashboard

- **Peak forecast:** agle UK calendar din ka sabse bada published forecast aur settlement period.
- **Expected average:** Elexon ke available forecast periods ka average.
- **Forecast coverage:** Elexon se aaye forecast periods ki ginti.
- **Recommended buffer:** `—` jab tak procurement/reserve model configured na ho.
- **Day-ahead prediction:** peak, average aur available data points; **Open full prediction** se sabhi returned forecast periods.
- **Accuracy & reliability:** MAPE, MAE aur bias tabhi dikhaye ja sakte hain jab actual generation data connect ho. Abhi placeholders hain, fake scores nahi.
- **Today → tomorrow:** latest forecast summary. Actual generation na hone par aaj ka actual `—` rahega.
- **At a glance:** din ke paanch sabse bade forecast periods.
- **WindCast Assistant:** neeche daahine chat button se chatbot kholein.

Times UK settlement-period numbering se dikhte hain; daylight-saving change waale din period count 46 ya 50 ho sakta hai.

## Chatbot ka use

Chat kholkar din, peak, ya average ke baare mein sawaal likhein, phir send button dabayein. Examples:

- `Kal ki windcast kya thi?`
- `Tomorrow ka peak wind forecast kya hai?`
- `Aaj ka average generation batao`
- `Kal ka highest MW kitna tha?`

`kal` ke saath `thi/tha` ho to chatbot pichhla UK din leta hai; warna default agla UK din hai. Answer Elexon ke latest revised forecast par based hai—yeh historical snapshot nahi hai ki us din pehle kaunsa forecast publish hua tha. Confidence, accuracy, aur reserve ke baare mein chatbot batayega ki woh model/data abhi connected nahi hai.

## API routes

### `GET /api/windcast?date=YYYY-MM-DD`

Next.js proxy se Django `GET /api/v1/public/windcast/?date=YYYY-MM-DD` route tak jaata hai. Django Elexon WINDFOR se settlement date ka latest wind forecast mangta hai. `date` chhodne par agle UK calendar din ka data aata hai. Response mein `date`, `source`, `updatedAt`, `periods`, aur `summary` milte hain. Har period mein settlement-period number aur forecast MW hota hai. Data na mile to `periods` khaali aur `message` diya jata hai; provider error par API `502` return karti hai.

### `POST /api/chat`

JSON body bhejein:

```json
{ "question": "Kal ki windcast kya thi?" }
```

Next.js proxy Django `POST /api/v1/public/assistant/` ko sawaal bhejta hai. Response mein `answer`, `date`, `source`, aur `updatedAt` milte hain. Chatbot forecast API se data leta hai, isliye provider unavailable ho to woh fake result ke bajay error deta hai.

Elexon API public hai, API key ki zaroorat nahi. Source: [Elexon WINDFOR API docs](https://bmrs.elexon.co.uk/api-documentation/endpoint/forecast/generation/wind/latest). Django provider Elexon se data fetch karta hai; Next.js sirf Django backend ko proxy karta hai.

## Data aur current limits

- Feed GB-wide wind generation forecast hai, local wind farm ya regional forecast nahi.
- Elexon ka latest revised data past dates ke liye bhi mil sakta hai; app original as-published forecast history reconstruct nahi karta.
- Actual generation, forecast confidence, MAE/RMSE/MAPE, buying requirement, aur reserve recommendation calculate karne ke liye abhi doosra data source/model configure nahi hai.
- Login screen demo onboarding hai; accounts ya Google authentication wired up nahi hain.
- Development mode mein stale HMR se bachne ke liye service worker unregister hota hai. Production PWA mein cached app shell offline khul sakta hai, lekin live forecast/chat ko internet chahiye; API responses service worker cache nahi karta.

## Project files

```text
app/
├── api/
│   ├── chat/route.ts       # Forecast-grounded assistant endpoint
│   └── windcast/route.ts   # Elexon WINDFOR proxy and summary
├── components/
│   ├── Features.tsx        # Forecast dashboard and assistant UI
│   ├── Login.tsx           # Start screen
│   └── Welcome.tsx         # Welcome/onboarding screen
├── globals.css             # Global styling
├── layout.tsx              # Root layout and metadata
├── manifest.ts             # PWA manifest
└── page.tsx                # Login → Welcome → dashboard flow
public/
├── logo.png
└── sw.js                   # Versioned app-shell service worker
```
