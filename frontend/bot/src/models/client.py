from datetime import datetime
from typing import Optional, Tuple, Dict
from thefuzz import fuzz
import re


class Client:
    def __init__(
        self,
        id: int,
        first_name: str,
        middle_name: str,
        last_name: str,
        is_homeless: bool = False,
        photo_name: Optional[str] = None,
        birth_date: Optional[datetime] = None,
        gender: Optional[int] = None,
        is_new: bool = True,
        is_blocked: bool = False,
        blocked_at: Optional[datetime] = None,
        blocked_reason: Optional[str] = None
    ):
        self.id = id
        self.first_name = first_name or ""
        self.middle_name = middle_name or ""
        self.last_name = last_name or ""
        self.is_homeless = is_homeless
        self.photo_name = photo_name
        self.birth_date = birth_date
        self.gender = gender
        self.is_new = is_new
        self.is_blocked = is_blocked
        self.blocked_at = blocked_at
        self.blocked_reason = blocked_reason
        
        # Предварительная обработка строк для поиска
        self._search_name = self._normalize_name(f"{self.last_name} {self.first_name} {self.middle_name}")
        self._search_name_reversed = self._normalize_name(f"{self.first_name} {self.middle_name} {self.last_name}")
        
        # Кэш для хранения результатов сравнения
        self._similarity_cache: Dict[str, int] = {}

    @staticmethod
    def _normalize_name(name: str) -> str:
        """
        Нормализация имени для поиска:
        - Приведение к нижнему регистру
        - Удаление лишних пробелов
        - Удаление специальных символов
        """
        if not name:
            return ""
            
        # Приводим к нижнему регистру и удаляем лишние пробелы
        name = name.lower().strip()
        # Удаляем специальные символы, оставляем только буквы и пробелы
        name = re.sub(r'[^а-яёa-z\s]', '', name)
        # Заменяем множественные пробелы на один
        name = re.sub(r'\s+', ' ', name)
        return name

    @classmethod
    def from_dict(cls, data: dict) -> 'Client':
        """Создание объекта Client из словаря"""
        # Преобразуем строковые даты в объекты datetime
        birth_date = None
        if data.get('birth_date'):
            try:
                birth_date = datetime.fromisoformat(data['birth_date'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                pass

        blocked_at = None
        if data.get('blocked_at'):
            try:
                blocked_at = datetime.fromisoformat(data['blocked_at'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                pass

        return cls(
            id=data['id'],
            first_name=data.get('first_name', ''),
            middle_name=data.get('middle_name', ''),
            last_name=data.get('last_name', ''),
            is_homeless=data.get('is_homeless', False),
            photo_name=data.get('photo_name'),
            birth_date=birth_date,
            gender=data.get('gender'),
            is_new=data.get('is_new', True),
            is_blocked=data.get('is_blocked', False),
            blocked_at=blocked_at,
            blocked_reason=data.get('blocked_reason')
        )

    def to_dict(self) -> dict:
        """Преобразование объекта Client в словарь"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'is_homeless': self.is_homeless,
            'photo_name': self.photo_name,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'gender': self.gender,
            'is_new': self.is_new,
            'is_blocked': self.is_blocked,
            'blocked_at': self.blocked_at.isoformat() if self.blocked_at else None,
            'blocked_reason': self.blocked_reason
        }

    @property
    def full_name(self) -> str:
        """Полное ФИО"""
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()

    @property
    def search_name(self) -> str:
        """Имя для поиска (в нижнем регистре)"""
        return self._search_name

    def get_similarity_score(self, search_query: str) -> int:
        """
        Вычисляет степень схожести с поисковым запросом
        Возвращает максимальный score из различных методов сравнения
        """
        # Если поисковый запрос пустой, возвращаем 0
        if not search_query or not search_query.strip():
            return 0
            
        # Если имя клиента пустое, возвращаем 0
        if not self._search_name or not self._search_name.strip():
            return 0
            
        # Нормализуем поисковый запрос
        search_query = self._normalize_name(search_query)
        
        # Если после нормализации запрос пустой, возвращаем 0
        if not search_query:
            return 0
        
        # Проверяем кэш
        if search_query in self._similarity_cache:
            return self._similarity_cache[search_query]
        
        # Используем различные методы сравнения и берем максимальный score
        scores = [
            fuzz.ratio(search_query, self._search_name),
            fuzz.ratio(search_query, self._search_name_reversed),
            fuzz.partial_ratio(search_query, self._search_name),
            fuzz.partial_ratio(search_query, self._search_name_reversed),
            fuzz.token_sort_ratio(search_query, self._search_name),
            fuzz.token_sort_ratio(search_query, self._search_name_reversed),
            fuzz.token_set_ratio(search_query, self._search_name),
            fuzz.token_set_ratio(search_query, self._search_name_reversed)
        ]
        
        # Сохраняем результат в кэш
        max_score = max(scores)
        self._similarity_cache[search_query] = max_score
        
        return max_score 