from django.contrib.auth.forms import UserCreationForm
from .models import User


class SteamUserForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("password1")
        self.fields.pop("password2")

    class Meta:
        model = User
        fields = ["username"]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_unusable_password()
        if commit:
            user.save()
        return user
