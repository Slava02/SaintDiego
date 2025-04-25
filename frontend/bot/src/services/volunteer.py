import aiohttp
from datetime import datetime
from typing import Optional

from config import settings


class VolunteerService:
    def __init__(self):
        self.api_url = settings.api_url
        self.headers = {
            "Authorization": f"Bearer {settings.api_token.get_secret_value()}"
        }

    async def create_volunteer(
        self,
        tg_id: int,
        tg_login: str,
        first_name: str,
        middle_name: str,
        last_name: str,
    ) -> dict:
        """Создание нового волонтера"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.api_url}/volunteers",
                json={
                    "tg_id": tg_id,
                    "tg_login": tg_login,
                    "first_name": first_name,
                    "middle_name": middle_name,
                    "last_name": last_name,
                },
                headers=self.headers
            ) as response:
                if response.status == 201:
                    return await response.json()
                raise Exception(f"Failed to create volunteer: {await response.text()}")

    async def get_volunteer(self, tg_id: int) -> Optional[dict]:
        """Получение волонтера по tg_id"""
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.api_url}/volunteers/{tg_id}",
                headers=self.headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    return None
                
                error_text = await response.text()
                raise Exception(f"Failed to get volunteer: {error_text}")