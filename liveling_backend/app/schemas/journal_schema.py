from pydantic import BaseModel


class JournalCreateResponse(BaseModel):
    id: str
    task_id: str
    image_url: str | None
    text_note: str | None
