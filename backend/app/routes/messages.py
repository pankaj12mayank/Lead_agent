from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.deps import get_current_user, get_db
from backend.app.schemas.message import MessageResponse
from services import email_service, history_service, lead_orm_service, message_service, status_history_service
from settings.lead_schema import utc_now_iso

router = APIRouter(prefix="/messages", tags=["messages"])


def _subject_for_lead(lead) -> str:
    ai = lead_orm_service.lead_to_ai_dict(lead)
    return message_service.build_subject(ai)


@router.post("/generate/{lead_id}", response_model=MessageResponse)
def generate_message(
    lead_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> MessageResponse:
    row = lead_orm_service.get_lead(db, lead_id)
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found")
    ai = lead_orm_service.lead_to_ai_dict(row)
    subject = message_service.build_subject(ai)
    msg_lead = {**ai, "subject": subject}
    text = message_service.build_outreach_message(msg_lead)
    prev_status = str(row.status or "")
    row.personalized_message = text
    row.status = "follow_up_sent"
    row.updated_at = utc_now_iso()
    db.flush()
    if prev_status == "new":
        status_history_service.record_change(lead_id, "new", "follow_up_sent")
    history_service.record_event(
        lead_id,
        "message.generated",
        {"length": len(text or "")},
        user["id"],
    )
    db.commit()
    final = lead_orm_service.get_lead(db, lead_id) or row
    return MessageResponse(
        lead_id=lead_id,
        message=str(final.personalized_message or ""),
        email=str(final.email or ""),
        subject=subject,
        status=str(final.status or ""),
    )


@router.post("/send/{lead_id}", response_model=MessageResponse)
def send_message(
    lead_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> MessageResponse:
    row = lead_orm_service.get_lead(db, lead_id)
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found")
    body = str(row.personalized_message or "")
    to_addr = str(row.email or "").strip()
    if not to_addr:
        raise HTTPException(status_code=400, detail="Lead has no email; cannot send")
    subj = _subject_for_lead(row)
    ok = email_service.send_email(
        to_addr, subj, body, lead_id=lead_id, record_history=True
    )
    history_service.record_event(
        lead_id,
        "message.send_requested",
        {"to": to_addr, "success": ok},
        user["id"],
    )
    prev = str(row.status or "")
    final_row = row
    if ok and prev != "contacted":
        row.status = "contacted"
        row.last_contacted_at = utc_now_iso()
        row.updated_at = utc_now_iso()
        db.flush()
        status_history_service.record_change(lead_id, prev or "new", "contacted")
        db.commit()
        final_row = lead_orm_service.get_lead(db, lead_id) or row
    else:
        db.commit()
    return MessageResponse(
        lead_id=lead_id,
        message=body,
        email=to_addr,
        subject=subj,
        status=str(final_row.status or ""),
    )


@router.get("/{lead_id}", response_model=MessageResponse)
def get_message(
    lead_id: str,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
) -> MessageResponse:
    row = lead_orm_service.get_lead(db, lead_id)
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found")
    return MessageResponse(
        lead_id=lead_id,
        message=str(row.personalized_message or ""),
        email=str(row.email or ""),
        subject=_subject_for_lead(row),
        status=str(row.status or ""),
    )
