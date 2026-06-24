from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.external import router as external_router
from app.api.v1.forest import router as forest_router
from app.api.v1.journal import router as journal_router
from app.api.v1.rpg import router as rpg_router
from app.api.v1.shop import router as shop_router
from app.api.v1.tasks import router as task_router
from app.api.v1.users import router as users_router
from app.db.session import create_db_and_tables

app = FastAPI(title="Liveling Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


app.include_router(task_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(shop_router, prefix="/api/v1")
app.include_router(journal_router, prefix="/api/v1")
app.include_router(external_router, prefix="/api/v1")
app.include_router(forest_router, prefix="/api/v1")
app.include_router(rpg_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
