import config
from utils.logger import get_logger
from modules.csv_manager import init_csv, save_lead, read_leads, update_leads
from modules.lead_collector import collect_lead
from modules.ai_enricher import generate_message
from modules.lead_scorer import score_lead


def main():
    logger = get_logger(__name__)

    init_csv()

    logger.info("Lead Engine Started")
    logger.info(f"Model: {config.MODEL_NAME}")

    # 1. Collect lead
    lead = collect_lead()

    # 2. Score lead
    scoring = score_lead(lead)

    # 3. Attach scoring
    lead["score"] = scoring["score"]
    lead["tier"] = scoring["tier"]

    # 4. Save BEFORE message generation
    save_lead(lead)

    # 5. Generate message
    message = generate_message(lead)

    # 6. Update only last lead safely
    leads = read_leads()

    if leads:
        for l in reversed(leads):
            if l.get("name") == lead.get("name") and l.get("profile_url") == lead.get("profile_url"):
                l["message"] = message
                l["status"] = "ready"
                l["score"] = lead["score"]
                l["tier"] = lead["tier"]
                break

        update_leads(leads)

    # 7. Logging insights
    logger.info(f"Score: {lead['score']} | Tier: {lead['tier']}")
    logger.info(message)


if __name__ == "__main__":
    main()