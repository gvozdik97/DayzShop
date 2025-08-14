from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class SteamUserForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Удаляем ненужные поля для Steam-аутентификации
        self.fields.pop('password1')
        self.fields.pop('password2')
        # username будет заполняться автоматически из Steam

    class Meta:
        model = User
        fields = ['username']  # Оставляем только username для совместимости

    def save(self, commit=True):
        # Переопределяем сохранение - пароль не нужен
        user = super().save(commit=False)
        user.set_unusable_password()  # Устанавливаем "неиспользуемый" пароль
        if commit:
            user.save()
        return user