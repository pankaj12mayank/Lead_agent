from modules.input_handler import get_lead_input


def collect_lead():
    lead = get_lead_input()
    lead["message"] = ""
    lead["status"] = "new"
    return lead


def collect_leads_bulk(n):
    leads = []

    for _ in range(n):
        lead = collect_lead()
        leads.append(lead)

    return leads