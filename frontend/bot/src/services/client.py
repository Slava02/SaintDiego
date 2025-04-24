import aiohttp
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Tuple
import logging
import aiocron
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

from config import settings
from src.models.client import Client


class ClientService:
    def __init__(self):
        self.api_url = settings.api_url
        self.headers = {
            "Authorization": f"Bearer {settings.api_token.get_secret_value()}"
        }
        self.clients: Dict[int, Client] = {}  # Кэш клиентов
        self.cron_job = None
        self.logger = logging.getLogger(__name__)
        self._search_cache: Dict[str, List[Tuple[Client, int]]] = {}
        self._executor = ThreadPoolExecutor(max_workers=4)

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