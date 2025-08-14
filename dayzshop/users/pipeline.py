def get_steam_user_data(backend, details, response, uid, *args, **kwargs):
    if backend.name == "steam":
        # Извлекаем SteamID из URL (например: "https://steamcommunity.com/openid/id/76561198148381028")
        steamid = uid.split("/")[-1]
        return {"username": f"steam_{steamid}", "steamid": steamid}
    return {}
