# AI Future Timeline Generator

AI-powered timeline generator that visualizes potential futures for individuals, companies, and technologies.

## Features

- 🤖 **AI-Powered Generation** - Advanced AI analyzes trends and generates plausible future scenarios
- 📊 **Interactive Visualization** - Beautiful, animated timeline with detailed milestone cards
- 🌍 **7 Languages** - English, Chinese, Japanese, German, French, Korean, Spanish
- 💳 **Freemium Model** - 3 free generations, then paid plans

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Python FastAPI
- **AI**: LLM via llm-proxy.densematrix.ai
- **Payment**: Creem MoR
- **Deployment**: Docker

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

```bash
docker compose up -d --build
```

## Environment Variables

See `.env.example` for required variables.

## License

MIT
