import aiohttp
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Tuple
import logging
import aiocron
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import json

from config import settings
from src.models.client import Client


class ClientService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ClientService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.api_url = settings.api_url
        self.headers = {
            "Authorization": f"Bearer {settings.api_token.get_secret_value()}",
            #"Host": "localhost:8080"  # Добавляем хост-заголовок
        }
        self.clients: Dict[int, Client] = {}  # Кэш клиентов
        self.cron_job = None
        self.logger = logging.getLogger(__name__)
        self._search_cache: Dict[str, List[Tuple[Client, int]]] = {}
        self._executor = ThreadPoolExecutor(max_workers=4)
        self._initialized = True

    async def start(self):
        """Запуск сервиса и настройка периодического обновления"""
        # Первоначальная загрузка клиентов
        await self.update_clients()
        
        # Настраиваем cron-задачу на ежедневное обновление в 3:00
        self.cron_job = aiocron.crontab('0 3 * * *', func=self.update_clients)
        self.logger.info("Client service started with daily update at 3:00 AM")

    async def stop(self):
        """Остановка сервиса"""
        if self.cron_job:
            self.cron_job.stop()
            self.logger.info("Client service stopped")
        self._executor.shutdown(wait=True)

    async def update_clients(self):
        """Обновление списка клиентов"""
        self.logger.info("Starting clients update")
        try:
            page = 1
            per_page = 100  # Максимальное количество клиентов на странице
            total_updated = 0
            
            while True:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.api_url}/clients",
                        params={"page": page, "per_page": per_page},
                        headers=self.headers
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            clients_data = data.get("clients", [])
                            
                            # Обновляем кэш
                            for client_data in clients_data:
                                client = Client.from_dict(client_data)
                                self.clients[client.id] = client
                            
                            total_updated += len(clients_data)
                            
                            # Проверяем, есть ли еще страницы
                            if len(clients_data) < per_page:
                                break
                            
                            page += 1
                        else:
                            self.logger.error(f"Failed to update clients: {await response.text()}")
                            break
            
            # Очищаем кэш поиска при обновлении данных
            self._search_cache.clear()
            self.logger.info(f"Successfully updated {total_updated} clients")
                            
        except Exception as e:
            self.logger.error(f"Error updating clients: {e}")

    def _calculate_similarity(self, client: Client, search_query: str) -> Tuple[Client, int]:
        """Вычисление схожести для одного клиента"""
        return client, client.get_similarity_score(search_query)

    def find_client_by_name(
        self,
        full_name: str,
        min_similarity: int = 80,
        limit: int = 5
    ) -> List[Tuple[Client, int]]:
        """
        Поиск клиента по ФИО с использованием нечеткого поиска
        
        Args:
            full_name: ФИО для поиска
            min_similarity: Минимальный процент схожести (0-100)
            limit: Максимальное количество результатов
            
        Returns:
            Список кортежей (клиент, процент схожести), отсортированный по убыванию схожести
        """
        # Проверяем кэш поиска
        cache_key = f"{full_name}:{min_similarity}:{limit}"
        if cache_key in self._search_cache:
            return self._search_cache[cache_key]

        # Вычисляем схожесть параллельно для всех клиентов
        futures = [
            self._executor.submit(self._calculate_similarity, client, full_name)
            for client in self.clients.values()
        ]
        
        # Собираем результаты
        results = []
        for future in futures:
            client, score = future.result()
            if score >= min_similarity:
                results.append((client, score))
        
        # Сортируем по убыванию схожести
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Ограничиваем количество результатов
        results = results[:limit]
        
        # Сохраняем в кэш
        self._search_cache[cache_key] = results
        
        return results

    def get_client_by_id(self, client_id: int) -> Optional[Client]:
        """Получение клиента по ID"""
        return self.clients.get(client_id)

    async def create_client(self, first_name: str, middle_name: str, last_name: str) -> Optional[Client]:
        """Создание нового клиента"""
        url = f"{self.api_url}/clients"
        data = {
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
        }
        
        self.logger.info(f"Creating client: {url} with data {json.dumps(data)}")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=self.headers) as response:
                response_text = await response.text()
                self.logger.info(f"Response from {url}: {response.status} - {response_text}")
                
                if response.status == 201:
                    data = await response.json()
                    client = Client.from_dict(data)
                    # Устанавливаем is_new=True для нового клиента
                    client.is_new = True
                    # Добавляем клиента в локальное хранилище
                    self.clients[client.id] = client
                    # Очищаем кэш поиска
                    self._search_cache.clear()
                    self.logger.info(f"Created new client with is_new=True: {client}")
                    return client
                self.logger.error(f"Failed to create client: {response_text}")
                return None 