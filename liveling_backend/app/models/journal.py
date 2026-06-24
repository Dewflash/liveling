from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class JournalEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    task_id: UUID = Field(foreign_key="task.id", index=True)
    image_url: Optional[str] = Field(default=None)
    text_note: Optional[str] = Field(default=None, max_length=4000)
