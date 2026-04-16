"""In-memory scraper job progress (thread-safe) for live UI polling."""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class JobState:
    job_id: str
    platform: str
    phase: str = "queued"
    message: str = ""
    page: int = 0
    leads_found: int = 0
    leads_target: int = 0
    duplicates_removed: int = 0
    max_scroll_rounds: int = 12
    delay_avg_seconds: float = 4.0
    started_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    messages: List[str] = field(default_factory=list)
    preview: List[Dict[str, Any]] = field(default_factory=list)
    completed: bool = False
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


_lock = threading.Lock()
_jobs: Dict[str, JobState] = {}


def create_job(
    job_id: str,
    platform: str,
    leads_target: int,
    *,
    max_scroll_rounds: int = 12,
    delay_avg_seconds: float = 4.0,
) -> JobState:
    st = JobState(
        job_id=job_id,
        platform=platform,
        leads_target=int(leads_target or 0),
        max_scroll_rounds=max(1, int(max_scroll_rounds or 12)),
        delay_avg_seconds=max(0.5, float(delay_avg_seconds or 4.0)),
    )
    with _lock:
        _jobs[job_id] = st
    return st


def get_job(job_id: str) -> Optional[JobState]:
    with _lock:
        return _jobs.get(job_id)


def _touch(st: JobState) -> None:
    st.updated_at = time.time()


def append_message(job_id: str, text: str) -> None:
    with _lock:
        st = _jobs.get(job_id)
        if not st:
            return
        st.messages.append(text)
        if len(st.messages) > 80:
            st.messages = st.messages[-80:]
        _touch(st)


def update_job(
    job_id: str,
    *,
    phase: Optional[str] = None,
    message: Optional[str] = None,
    page: Optional[int] = None,
    leads_found: Optional[int] = None,
    duplicates_removed: Optional[int] = None,
    preview_row: Optional[Dict[str, Any]] = None,
) -> None:
    with _lock:
        st = _jobs.get(job_id)
        if not st:
            return
        if phase is not None:
            st.phase = phase
        if message is not None:
            st.message = message
        if page is not None:
            st.page = int(page)
        if leads_found is not None:
            st.leads_found = int(leads_found)
        if duplicates_removed is not None:
            st.duplicates_removed = int(duplicates_removed)
        if preview_row is not None:
            keys = (
                "name",
                "full_name",
                "title",
                "company_name",
                "company",
                "url",
                "linkedin_url",
                "email",
                "source_platform",
            )
            slim = {k: preview_row[k] for k in keys if k in preview_row and preview_row[k]}
            if not slim:
                slim = dict(list(preview_row.items())[:10])
            st.preview.append(slim)
            if len(st.preview) > 60:
                st.preview = st.preview[-60:]
        _touch(st)


def complete_job(job_id: str, result: Dict[str, Any]) -> None:
    with _lock:
        st = _jobs.get(job_id)
        if not st:
            return
        st.completed = True
        st.phase = "completed"
        st.message = "Run finished"
        st.result = result
        _touch(st)


def fail_job(job_id: str, err: str) -> None:
    with _lock:
        st = _jobs.get(job_id)
        if not st:
            return
        st.completed = True
        st.phase = "failed"
        st.error = err
        st.message = err
        _touch(st)


def eta_seconds(job_id: str) -> Optional[float]:
    st = get_job(job_id)
    if not st or st.completed:
        return None
    if st.leads_found > 0:
        elapsed = max(0.001, time.time() - st.started_at)
        rate = st.leads_found / elapsed
        remaining = max(0, st.leads_target - st.leads_found)
        return round(remaining / max(rate, 0.01), 1)
    # No leads yet: rough ETA from scroll progress + configured delays
    if st.phase not in ("queued", "searching", "extracting_data", "saving_lead"):
        return None
    max_r = max(1, int(getattr(st, "max_scroll_rounds", 12) or 12))
    d_avg = float(getattr(st, "delay_avg_seconds", 4.0) or 4.0)
    page = int(st.page or 0)
    rounds_left = max(0, max_r - page)
    per_round = max(5.0, d_avg * 2.5)
    seconds = rounds_left * per_round
    if st.phase == "queued":
        seconds += max(8.0, d_avg * 2)
    if seconds <= 0:
        return round(max(8.0, d_avg * 3), 1)
    return round(max(10.0, seconds), 1)


class JobProgressSink:
    """Passed into ``BaseScraper`` when ``job_id`` is set."""

    def __init__(self, job_id: str) -> None:
        self.job_id = job_id

    def phase(
        self,
        phase: str,
        *,
        message: str = "",
        page: Optional[int] = None,
        leads_found: Optional[int] = None,
        duplicates_removed: Optional[int] = None,
    ) -> None:
        update_job(
            self.job_id,
            phase=phase,
            message=message,
            page=page,
            leads_found=leads_found,
            duplicates_removed=duplicates_removed,
        )
        if message:
            append_message(self.job_id, f"[{phase}] {message}")

    def lead_added(self, row: Dict[str, Any], count: int) -> None:
        update_job(self.job_id, phase="saving_lead", leads_found=count, preview_row=row, message=f"Collected {count} leads")


class NullProgressSink:
    def phase(self, *args: Any, **kwargs: Any) -> None:
        return

    def lead_added(self, *args: Any, **kwargs: Any) -> None:
        return
