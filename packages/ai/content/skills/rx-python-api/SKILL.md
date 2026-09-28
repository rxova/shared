---
name: rx-python-api
description: Builds a Python API with FastAPI and uv, covering pydantic models, dependency injection for database and auth, async Postgres, CORS, background tasks, pytest with httpx, uvicorn and a Dockerfile. Use when the backend is Python (often because of ML or data libraries) or an existing FastAPI app needs structure or tests.
---

# rx-python-api

FastAPI gives validation and docs from type hints. Keep models, dependencies and routes in
separate modules from the start; it costs nothing and saves the refactor at hour 20.

## When to use

- The backend needs Python libraries (ML, data, scraping).
- A FastAPI app has globals for the database session, no tests, or CORS errors.

## Choices

| Need                                     | Use                                               |
| ---------------------------------------- | ------------------------------------------------- |
| Package and venv management              | `uv`                                              |
| ORM with models close to pydantic        | SQLModel                                          |
| Full ORM, complex queries                | SQLAlchemy 2.x async                              |
| Raw speed, handwritten SQL               | asyncpg                                           |
| Work after the response (email, webhook) | `BackgroundTasks`                                 |
| Long or retried jobs                     | a real queue (arq, Celery, a platform job runner) |

## Steps

1. **Create:** `uv init api && cd api && uv add "fastapi[standard]" "sqlalchemy[asyncio]" asyncpg pydantic-settings`
   and `uv add --dev pytest pytest-asyncio httpx`.
2. **Run:** `uv run fastapi dev app/main.py` (reload on); production:
   `uv run fastapi run app/main.py` or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. **Settings** with `pydantic-settings` reading env and `.env`; commit `.env.example`.
4. **Dependencies:** a `get_session` that yields an `AsyncSession`, a `current_user` that
   verifies the bearer token. Inject with `Depends`; override them in tests.
5. **CORS:** `CORSMiddleware` with an explicit origin list from settings.
6. **Background tasks:** add a `BackgroundTasks` parameter and call `.add_task(fn, ...)`.
7. **Docs** are at `/docs`; use them as the demo's API explorer.

## Example

```python
# app/main.py
from typing import Annotated, AsyncIterator
from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

class Settings(BaseSettings):
    database_url: str  # postgresql+asyncpg://user:pass@host:5432/db
    cors_origins: list[str] = ["http://localhost:5173"]  # env value is JSON: '["https://..."]'
    api_token: str

settings = Settings()
engine = create_async_engine(settings.database_url, pool_pre_ping=True)
Session = async_sessionmaker(engine, expire_on_commit=False)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

async def get_session() -> AsyncIterator[AsyncSession]:
    async with Session() as session:
        yield session

def current_user(authorization: Annotated[str | None, Header()] = None) -> str:
    if authorization != f"Bearer {settings.api_token}":
        raise HTTPException(status_code=401, detail="Invalid token")
    return "demo-user"

class NoteIn(BaseModel):
    text: str = Field(min_length=1, max_length=500)

class NoteOut(NoteIn):
    id: int

def notify(note_id: int) -> None:
    print(f"note {note_id} created")

@app.get("/health")
async def health() -> dict[str, bool]:
    return {"ok": True}

@app.post("/notes", status_code=201, response_model=NoteOut)
async def create_note(body: NoteIn, tasks: BackgroundTasks,
                      user: Annotated[str, Depends(current_user)],
                      db: Annotated[AsyncSession, Depends(get_session)]) -> NoteOut:
    # insert with db here; fake id for the sketch
    note = NoteOut(id=1, text=body.text)
    tasks.add_task(notify, note.id)
    return note
```

```python
# tests/test_notes.py  (pytest-asyncio; set asyncio_mode = "auto" in pyproject)
import os
from httpx import ASGITransport, AsyncClient
from app.main import app

async def test_rejects_empty_note():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post("/notes", json={"text": ""},
                         headers={"Authorization": f"Bearer {os.environ['API_TOKEN']}"})
    assert r.status_code == 422
```

```dockerfile
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
RUN uv sync --frozen --no-dev
ENV PATH="/app/.venv/bin:$PATH"
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

## Gotchas

- A blocking call (requests, a sync DB driver, heavy CPU) inside `async def` stalls every
  request. Use `def` for sync endpoints (FastAPI runs them in a thread pool) or async libs.
- Validation errors are 422, not 400; front ends should read `detail`.
- `allow_origins=["*"]` with `allow_credentials=True` does not work in browsers.
- Background tasks die with the process; do not use them for anything that must happen.
- Replace dependencies in tests with `app.dependency_overrides[get_session] = fake`.

## Verify it works

- `uv run pytest` passes; `curl localhost:8000/health` returns `{"ok":true}`.
- `/docs` loads and a request with a bad body returns 422 with field details.
- `docker build -t api . && docker run -p 8000:8000 --env-file .env api` serves `/health`.
