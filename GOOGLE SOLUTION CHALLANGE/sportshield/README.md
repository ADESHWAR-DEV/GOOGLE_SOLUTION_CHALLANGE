# AthletiChain AI

A platform that protects athletes from unauthorized use of sports media content through **blockchain ownership verification**, **AI fraud detection**, and **authenticity certification**.

Built for the Google Solution Challenge.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Firebase project (free tier)
- MetaMask wallet with Mumbai MATIC

### 1. Clone & Install

```bash
cd sportshield

# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# AI Engine (optional standalone)
cd ../ai-engine
pip install -r requirements.txt

# Smart Contracts
cd ../contracts
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local          # Frontend
cp .env.example backend/.env        # Backend
```

Fill in your Firebase credentials, Polygon RPC URL, and contract address.

### 3. Deploy Smart Contract (First Time)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network polygonMumbai
```

Save the deployed contract address into your `.env` files.

### 4. Run Services

```bash
# Terminal 1 - Backend API
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - AI Engine (optional)
cd ai-engine
python src/api.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database / Auth / Storage | Firebase (Auth, Firestore, Storage) |
| Blockchain | Polygon Mumbai Testnet, Solidity |
| AI Detection | OpenCV, TensorFlow, image hashing, ORB matching |
| Deployment | Vercel (frontend), Render (backend) |

---

## Features

1. **Authentication** - Firebase Auth with roles (Athlete, Buyer, Admin)
2. **Athlete Dashboard** - Upload, manage, and track earnings
3. **Smart Contract** - `registerAsset`, `transferOwnership`, `buyAsset`, `distributeRoyalty`, `freezeAsset`
4. **AI Fraud Detection** - Perceptual hashing, ORB similarity, histogram matching, deepfake probability
5. **C2PA-Inspired Metadata** - Creator, timestamp, ownership history, verification status, authenticity badge
6. **Marketplace** - Browse, filter, and purchase verified assets
7. **Admin Dashboard** - View fraud reports, freeze suspicious assets, approve disputes

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Current user |
| POST | `/api/v1/assets/upload-asset` | Upload & mint asset |
| POST | `/api/v1/assets/detect-fraud` | AI fraud detection |
| POST | `/api/v1/assets/buy-asset` | Purchase asset |
| GET | `/api/v1/assets` | List marketplace assets |
| GET | `/api/v1/assets/{asset_id}` | Asset details |
| POST | `/api/v1/assets/freeze-asset` | Admin freeze asset |
| GET | `/api/v1/violations` | List fraud violations |
| POST | `/api/v1/violations/dispute` | Resolve dispute |

---

## Folder Structure

```
sportshield/
├── frontend/          # Next.js app
│   ├── src/app/       # Pages (login, signup, dashboard, marketplace, admin, asset, verify)
│   ├── src/components/
│   ├── src/context/   # Auth context
│   └── src/lib/       # Firebase client
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── config/firebase.py
│   │   ├── routes/    # auth, assets, violations
│   │   └── services/  # blockchain, ai, storage
│   └── requirements.txt
├── contracts/         # Solidity + Hardhat
│   ├── contracts/SportShieldNFT.sol
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── ai-engine/         # Standalone AI detection
│   ├── src/detection/detector.py
│   └── src/api.py
└── docs/              # Documentation
```

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

### Smart Contract
Already deployed on Polygon Mumbai. Update `CONTRACT_ADDRESS` in backend `.env`.

---

## Demo Walkthrough

1. **Sign Up** as an Athlete at `/signup`
2. **Log In** at `/login`
3. **Dashboard** - Click "Register New Asset", upload an image, set price & royalty
4. **Marketplace** - Browse your asset at `/marketplace`
5. **Asset Detail** - Click an asset to see C2PA badge, blockchain record, ownership history
6. **Verify** - Go to `/verify` and enter an asset ID to check authenticity
7. **Admin** - Log in as admin, go to `/admin` to view and freeze fraud reports

---

## License

MIT - Built for Google Solution Challenge
