# cart/tests.py
from django.test import TestCase
from django.contrib.auth.models import User


class AnonymousCartTest(TestCase):
    def test_session_cart(self):
        # Создаем корзину для анонима
        session = self.client.session
        session.save()
        response = self.client.get("/cart/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue("cart" in response.context)
