from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.journal_schema import JournalCreateResponse
from app.services.journal_service import JournalService

router = APIRouter(tags=["journal"])


@router.post("/tasks/{task_id}/journal", response_model=JournalCreateResponse)
async def create_journal_entry(
    task_id: UUID,
    text_note: str | None = Form(default=None),
    image_file: UploadFile | None = File(default=None),
    session: Session = Depends(get_session),
):
    entry = JournalService.add_entry(
        session=session,
        task_id=task_id,
        text_note=text_note,
        image_file=image_file,
    )
    return JournalCreateResponse(
        id=str(entry.id),
        task_id=str(entry.task_id),
        image_url=entry.image_url,
        text_note=entry.text_note,
    )
