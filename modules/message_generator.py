from modules.csv_manager import read_leads, update_leads
from modules.ai_enricher import generate_message
from utils.logger import get_logger


logger = get_logger(__name__)


def process_leads():
    leads = read_leads()
    processed_count = 0

    for lead in leads:
        if not lead.get("message"):
            message = generate_message(lead)
            lead["message"] = message
            lead["status"] = "ready"
            processed_count += 1

    update_leads(leads)
    logger.info(f"Processed leads: {processed_count}")