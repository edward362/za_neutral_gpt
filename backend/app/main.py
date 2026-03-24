import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("neutralgpt")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("NeutralGPT API starting up...")
    logger.info(f"Default provider: {settings.DEFAULT_PROVIDER}")
    logger.info(f"OpenAI key set: {bool(settings.OPENAI_API_KEY)}")
    logger.info(f"Anthropic key set: {bool(settings.ANTHROPIC_API_KEY)}")
    logger.info(f"Google key set: {bool(settings.GOOGLE_API_KEY)}")
    yield
    logger.info("NeutralGPT API shutting down...")


app = FastAPI(
    title="NeutralGPT API",
    description="The AI that won't kiss your ass.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
origins = settings.CORS_ORIGINS.split(",")
logger.info(f"CORS origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "neutralgpt"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
