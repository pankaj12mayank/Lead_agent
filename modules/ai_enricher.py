import requests
import config
import subprocess
import time
from utils.logger import get_logger


logger = get_logger(__name__)


def ensure_ollama_ready():
    for _ in range(3):
        try:
            requests.get("http://localhost:11434", timeout=2)
            return
        except Exception:
            time.sleep(1)

    try:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception:
        logger.error("Failed to start Ollama server")
        return

    for _ in range(10):
        try:
            requests.get("http://localhost:11434", timeout=2)
            break
        except Exception:
            time.sleep(1)

    try:
        subprocess.run(
            ["ollama", "pull", config.MODEL_NAME],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception:
        logger.error("Failed to pull model")


def generate_message(lead):
    try:
        with open("prompts/message_prompt.txt", "r", encoding="utf-8") as f:
            template = f.read()

        final_prompt = template.replace("{name}", lead.get("name", "")).replace(
            "{platform}", lead.get("platform", "")
        )

        if config.FREE_API_MODE:
            return f"Hi {lead.get('name', '')}, I can help with your project."

        if config.USE_OLLAMA:
            ensure_ollama_ready()

            try:
                logger.info(f"Sending request to Ollama with model: {config.MODEL_NAME}")

                response = requests.post(
                    config.OLLAMA_URL,
                    json={
                        "model": config.MODEL_NAME,
                        "prompt": final_prompt,
                        "stream": False,
                    },
                    timeout=60,
                )

                response.raise_for_status()
                data = response.json()

                if "response" in data:
                    return data["response"].strip()

                return ""

            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
                logger.error("Ollama connection failed")
                return ""

            except Exception:
                logger.error("Invalid response from Ollama")
                return ""

        return ""

    except Exception:
        logger.error("Message generation failed")
        return ""