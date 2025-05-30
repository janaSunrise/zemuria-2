# Zemuria Chat Backend

A FastAPI backend integrated with Langflow for AI-powered chat functionality using OpenAI models.

## 🚀 Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your OpenAI API key to `.env`:**
   ```bash
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

## 🌐 Access

- **Langflow UI**: http://localhost:7860
- **FastAPI Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 Import Your Flow

1. Go to http://localhost:7860
2. Import the `zem.json` flow file
3. Configure your OpenAI API key in the flow components

## 🛑 Stop Services

```bash
docker-compose down
```

That's it. Simple.
