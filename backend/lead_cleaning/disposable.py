"""Known disposable / temporary email domains (subset; extend as needed)."""

from __future__ import annotations

DISPOSABLE_EMAIL_DOMAINS: frozenset[str] = frozenset(
    {
        "mailinator.com",
        "guerrillamail.com",
        "guerrillamailblock.com",
        "sharklasers.com",
        "yopmail.com",
        "yopmail.fr",
        "tempmail.com",
        "temp-mail.org",
        "10minutemail.com",
        "10minutemail.net",
        "throwaway.email",
        "trashmail.com",
        "fakeinbox.com",
        "getairmail.com",
        "maildrop.cc",
        "mailnesia.com",
        "mintemail.com",
        "moakt.com",
        "mytemp.email",
        "spam4.me",
        "dispostable.com",
        "emailondeck.com",
        "getnada.com",
        "mailcatch.com",
        "mailnull.com",
        "spamgourmet.com",
        "tempail.com",
        "tmpmail.org",
        "burnermail.io",
        "duck.com",  # often used as alias; optional — remove if too aggressive
    }
)


def is_disposable_domain(domain: str) -> bool:
    d = (domain or "").strip().lower().lstrip("@")
    if not d:
        return False
    if d in DISPOSABLE_EMAIL_DOMAINS:
        return True
    # Subdomain match e.g. foo.yopmail.com
    parts = d.split(".")
    if len(parts) >= 2:
        root = ".".join(parts[-2:])
        if root in DISPOSABLE_EMAIL_DOMAINS:
            return True
    return False
