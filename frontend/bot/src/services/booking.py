import aiohttp
from datetime import datetime
from typing import List, Dict, Optional, Tuple
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
                    for item in data.get("services", []):
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
                        "total_pages": data.get("total_pages", 0),
                        "status": data.get("status")
                    }
                    self.logger.info(f"Returning result: {result}")
                    return result
                    
                self.logger.error(f"Failed to get services: {response_text}")
                return {"services": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    async def get_service_events(self, client_id: int, service_id: int, page: int = 1, per_page: int = 10) -> Dict:
        """Получение списка событий для услуги"""
        url = f"{self.api_url}/clients/{client_id}/services/{service_id}/events"
        params = {"page": page, "per_page": per_page}
        
        self.logger.info(f"Requesting service events: {url} with params {params}")
        self.logger.info(f"Headers: {self.headers}")
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params, headers=self.headers) as response:
                    response_text = await response.text()
                    self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                    
                    if response.status == 200:
                        data = await response.json()
                        self.logger.info(f"Parsed response data: {data}")
                        # Преобразуем список событий в объекты Event
                        events = []
                        for event in data.get("items", []):
                            try:
                                event_obj = Event.from_dict(event)
                                events.append(event_obj)
                                self.logger.info(f"Created event object: {event_obj}")
                            except Exception as e:
                                self.logger.error(f"Error creating event object from {event}: {str(e)}", exc_info=True)
                        
                        result = {
                            "items": events,
                            "total": data.get("total", 0),
                            "page": page,
                            "per_page": per_page,
                            "total_pages": data.get("total_pages", 0)
                        }
                        self.logger.info(f"Returning result: {result}")
                        return result
                    
                    self.logger.error(f"Failed to get events: {response_text}")
                    return {"items": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}
            except Exception as e:
                self.logger.error(f"Error in get_service_events: {str(e)}", exc_info=True)
                return {"items": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    async def book_event(self, event_id: int, participant_id: int, volunteer_id: int) -> Tuple[bool, str]:
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
                    return True, "✅ Запись успешно создана"
                elif response.status == 409:
                    return False, "❌ К сожалению, все места на это событие уже заняты"
                elif response.status == 422:
                    return False, "❌ Клиент уже записан на это событие"
                
                self.logger.error(f"Failed to book event: {response_text}")
                return False, "❌ Произошла ошибка при создании записи"

    async def get_client_events(self, client_id: int, history_limit: int = 5, page: int = 1, per_page: int = 10) -> Dict:
        """Получение списка событий клиента (предстоящих и прошедших)"""
        url = f"{self.api_url}/events"
        params = {
            "participant_id": client_id,
            "status": "upcoming",  # Сначала получаем предстоящие события
            "page": page, 
            "per_page": per_page
        }
        
        self.logger.info(f"Requesting client events: {url} with params {params}")
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self.headers) as response:
                response_text = await response.text()
                self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                
                if response.status == 200:
                    data = await response.json()
                    # Преобразуем список событий в объекты Event
                    upcoming_events = [Event.from_dict(event) for event in data.get("items", [])]
                    
                    # Получаем прошедшие события
                    params["status"] = "past"
                    async with session.get(url, params=params, headers=self.headers) as past_response:
                        if past_response.status == 200:
                            past_data = await past_response.json()
                            past_events = [Event.from_dict(event) for event in past_data.get("items", [])]
                        else:
                            self.logger.error(f"Failed to get past events: {await past_response.text()}")
                            past_events = []
                    
                    return {
                        "upcoming_events": upcoming_events,
                        "past_events": past_events,
                        "all_events": upcoming_events + past_events,
                        "total": data.get("total", 0),
                        "page": page,
                        "per_page": per_page,
                        "total_pages": data.get("total_pages", 0)
                    }
                
                self.logger.error(f"Failed to get client events: {response_text}")
                return {
                    "upcoming_events": [],
                    "past_events": [],
                    "all_events": [],
                    "total": 0,
                    "page": page,
                    "per_page": per_page,
                    "total_pages": 0
                }

