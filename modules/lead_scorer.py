def score_lead(lead):
    score = 0
    reasons = []

    platform = (lead.get("platform") or "").lower()
    name = (lead.get("name") or "").lower()
    profile_url = lead.get("profile_url") or ""
    notes = (lead.get("notes") or "").lower()

    # Platform scoring
    if "upwork" in platform:
        score += 30
        reasons.append("Upwork +30")

    if "linkedin" in platform:
        score += 20
        reasons.append("LinkedIn +20")

    if profile_url:
        score += 10
        reasons.append("Profile URL +10")

    # Keyword scoring
    keywords = ["hire", "developer", "ai", "project", "need", "looking", "startup"]

    combined_text = f"{name} {notes}"

    if any(k in combined_text for k in keywords):
        score += 30
        reasons.append("Intent keywords +30")

    # Founder / CEO signal
    if "founder" in platform or "ceo" in platform:
        score += 20
        reasons.append("Founder/CEO signal +20")

    # Tier logic
    if score >= 70:
        tier = "hot"
    elif 40 <= score < 70:
        tier = "warm"
    else:
        tier = "cold"

    return {
        "score": score,
        "tier": tier,
        "reason": " | ".join(reasons)
    }