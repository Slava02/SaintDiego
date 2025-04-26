import aiohttp
from datetime import datetime
from typing import List, Dict, Optional
import logging
import json

from config import settings
from src.models.client import Client
from src.models.service import Service
from src.models.event import Event


class BookingService:
    def __init__(self):
        self.api_url = settings.api_url
        self.headers = {
            "Authorization": f"Bearer {settings.api_token.get_secret_value()}"
        }
        self.logger = logging.getLogger(__name__)

    async def get_available_services(self, client_id: int, page: int = 1, per_page: int = 10) -> Dict:
        """Получение списка доступных услуг для клиента"""
        url = f"{self.api_url}/clients/{client_id}/services"
        params = {"page": page, "per_page": per_page}
        
        self.logger.info(f"Requesting available services: {url} with params {params}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self.headers) as response:
                response_text = await response.text()
                self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                
                if response.status == 200:
                    data = await response.json()
                    self.logger.info(f"Parsed response data: {data}")
                    
                    # Преобразуем список услуг в объекты Service
                    services = []
                    for item in data.get("items", []):
                        service = Service(
                            id=item["id"],
                            name=item["name"],
                            description=item.get("description"),
                            duration=item.get("duration"),
                            capacity=item.get("capacity"),
                            price=item.get("price")
                        )
                        services.append(service)
                        self.logger.info(f"Created service object: {service}")
                    
                    result = {
                        "services": services,
                        "total": data.get("total", 0),
                        "page": page,
                        "per_page": per_page,
                        "total_pages": data.get("total_pages", 0)
                    }
                    self.logger.info(f"Returning result: {result}")
                    return result
                    
                self.logger.error(f"Failed to get services: {response_text}")
                return {"services": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    async def get_service_events(self, service_id: int, page: int = 1, per_page: int = 10) -> Dict:
        """Получение списка событий для услуги"""
        url = f"{self.api_url}/events/services/{service_id}"
        params = {"page": page, "per_page": per_page}
        
        self.logger.info(f"Requesting service events: {url} with params {params}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self.headers) as response:
                response_text = await response.text()
                self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                
                if response.status == 200:
                    data = await response.json()
                    # Преобразуем список событий в объекты Event
                    events = [Event.from_dict(event) for event in data.get("items", [])]
                    return {
                        "items": events,
                        "total": data.get("total", 0),
                        "page": page,
                        "per_page": per_page,
                        "total_pages": data.get("total_pages", 0)
                    }
                self.logger.error(f"Failed to get events: {response_text}")
                return {"items": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    async def book_event(self, event_id: int, participant_id: int, volunteer_id: int) -> bool:
        """Запись на событие"""
        url = f"{self.api_url}/events/{event_id}/participants"
        data = {
            "participant_id": participant_id,
            "volunteer_id": volunteer_id
        }
        
        self.logger.info(f"Booking event: {url} with data {json.dumps(data)}")
        
        async with aiohttp.ClientSession() as session:
            async with session.put(url, json=data, headers=self.headers) as response:
                response_text = await response.text()
                self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                
                if response.status == 204:
                    return True
                # TODO: выводить сообщение о том, что мест уже нет, если 409
                self.logger.error(f"Failed to book event: {response_text}")
                return False

