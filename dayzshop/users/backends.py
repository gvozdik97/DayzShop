from social_core.backends.steam import SteamOpenId

class CustomSteamOpenId(SteamOpenId):
    def get_user_details(self, response):
        try:
            return super().get_user_details(response)
        except Exception as e:
            print(f"Error getting user details: {e}")
            return {}