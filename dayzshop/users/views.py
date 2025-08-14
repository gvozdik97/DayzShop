from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
import requests
from urllib.parse import urlencode
from users.forms import SteamUserForm
from django.conf import settings
from social_django.utils import psa
from social_core.exceptions import AuthForbidden
import logging
from django.contrib import messages
from django.contrib.auth.decorators import login_required


logger = logging.getLogger(__name__)


# def steam_login(request):
#     if request.user.is_authenticated:
#         return redirect(settings.LOGOUT_REDIRECT_URL)
    
#     params = {
#         'openid.ns': 'http://specs.openid.net/auth/2.0',
#         'openid.mode': 'checkid_setup',
#         'openid.return_to': request.build_absolute_uri('/auth/steam/callback/'),
#         'openid.realm': request.build_absolute_uri('/'),
#         'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
#         'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
#     }
    
#     steam_login_url = f"https://steamcommunity.com/openid/login?{urlencode(params)}"
#     return redirect(steam_login_url)

# def steam_callback(request):
#     if request.user.is_authenticated:
#         return redirect(settings.LOGOUT_REDIRECT_URL)
    
#     # Проверка ответа Steam
#     params = {
#         'openid.ns': request.GET.get('openid.ns'),
#         'openid.mode': 'check_authentication',
#         'openid.op_endpoint': request.GET.get('openid.op_endpoint'),
#         'openid.claimed_id': request.GET.get('openid.claimed_id'),
#         'openid.identity': request.GET.get('openid.identity'),
#         'openid.return_to': request.GET.get('openid.return_to'),
#         'openid.response_nonce': request.GET.get('openid.response_nonce'),
#         'openid.assoc_handle': request.GET.get('openid.assoc_handle'),
#         'openid.signed': request.GET.get('openid.signed'),
#         'openid.sig': request.GET.get('openid.sig'),
#     }
    
#     response = requests.post('https://steamcommunity.com/openid/login', data=params)
#     if 'is_valid:true' not in response.text:
#         return redirect('login')
    
#     # Извлечение SteamID
#     steamid = request.GET.get('openid.identity').split('/')[-1]
    
#     # Получение данных профиля
#     profile_url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={settings.STEAM_API_KEY}&steamids={steamid}"
#     profile_data = requests.get(profile_url).json()
#     player = profile_data['response']['players'][0]
    
#     # Создание/обновление пользователя
#     form = SteamUserForm({
#         'username': player.get('personaname', steamid)
#     })
#     if form.is_valid():
#         user = form.save(commit=False)
#         user.steamid = steamid
#         user.avatar = player.get('avatarfull', '')
#         user.save()
#         login(request, user)

#     return redirect(settings.LOGIN_REDIRECT_URL)

def steam_login(request):
    return redirect('social:begin', backend='steam')

@psa('social:complete')
def steam_callback(request):
    # Эта функция автоматически обработает Steam-аутентификацию
    return redirect('profile')  # Перенаправление после успешного входа

@login_required
def profile(request):
    return render(request, 'users/profile.html', {
        'user': request.user,
        'steamid': request.user.steamid  # Если у вас есть поле steamid в модели
    })

@login_required
def logout_view(request):
    logout(request)
    return redirect('shop:index')