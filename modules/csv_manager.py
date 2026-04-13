import os
import pandas as pd
import config


COLUMNS = ["name", "platform", "profile_url", "message", "status"]


def init_csv():
    try:
        if not os.path.exists(config.CSV_FILE_PATH):
            os.makedirs(os.path.dirname(config.CSV_FILE_PATH), exist_ok=True)
            df = pd.DataFrame(columns=COLUMNS)
            df.to_csv(config.CSV_FILE_PATH, index=False)
    except Exception:
        pass


def save_lead(lead_dict):
    try:
        if not os.path.exists(config.CSV_FILE_PATH):
            init_csv()

        df = pd.DataFrame([lead_dict])
        df.to_csv(
            config.CSV_FILE_PATH,
            mode="a",
            header=not os.path.exists(config.CSV_FILE_PATH) or os.stat(config.CSV_FILE_PATH).st_size == 0,
            index=False
        )
    except Exception:
        pass


def read_leads():
    try:
        if not os.path.exists(config.CSV_FILE_PATH):
            return []

        df = pd.read_csv(config.CSV_FILE_PATH)
        return df.to_dict(orient="records")
    except Exception:
        return []


def update_leads(leads_list):
    try:
        os.makedirs(os.path.dirname(config.CSV_FILE_PATH), exist_ok=True)

        df = pd.DataFrame(leads_list)

        for col in COLUMNS:
            if col not in df.columns:
                df[col] = ""

        df = df[COLUMNS]

        temp_path = config.CSV_FILE_PATH + ".tmp"
        df.to_csv(temp_path, index=False)

        os.replace(temp_path, config.CSV_FILE_PATH)

    except Exception:
        pass