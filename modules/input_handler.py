def get_lead_input():
    while True:
        name = input("Enter name: ").strip()
        platform = input("Enter platform (LinkedIn / Upwork / Other): ").strip()
        profile_url = input("Enter profile URL: ").strip()

        if name and platform and profile_url:
            return {
                "name": name,
                "platform": platform,
                "profile_url": profile_url
            }