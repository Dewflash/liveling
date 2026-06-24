from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlmodel import Session

from app.models.journal import JournalEntry
from app.repository.journal_repo import JournalRepository


class JournalService:
    UPLOAD_DIR = Path("uploads")

    @staticmethod
    def _save_image(file: UploadFile | None) -> str | None:
        if file is None:
            return None

        JournalService.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "").suffix or ".bin"
        filename = f"{uuid4()}{suffix}"
        destination = JournalService.UPLOAD_DIR / filename

        with destination.open("wb") as output:
            output.write(file.file.read())

        return str(destination)

    @staticmethod
    def add_entry(
        session: Session,
        task_id: UUID,
        text_note: str | None,
        image_file: UploadFile | None,
    ) -> JournalEntry:
        image_url = JournalService._save_image(image_file)
        entry = JournalEntry(task_id=task_id, text_note=text_note, image_url=image_url)
        return JournalRepository.create_entry(session, entry)
