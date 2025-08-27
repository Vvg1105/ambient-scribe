from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.ws import router as ws_router
import uvicorn

app = FastAPI()

# Enable permissive CORS for local development; tighten for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)