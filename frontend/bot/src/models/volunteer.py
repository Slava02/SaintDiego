from dataclasses import dataclass
from typing import Optional


@dataclass
class Volunteer:
    """Модель волонтера"""
    tg_id: int
    tg_login: str
    first_name: str
    middle_name: str
    last_name: str

    @classmethod
    def from_dict(cls, data: dict) -> 'Volunteer':
        """Создание объекта из словаря"""
        return cls(
            tg_id=data["tg_id"],
            tg_login=data["tg_login"],
            first_name=data["first_name"],
            middle_name=data["middle_name"],
            last_name=data["last_name"],
        )

    def to_dict(self) -> dict:
        """Преобразование объекта в словарь"""
        return {
            "tg_id": self.tg_id,    
            "tg_login": self.tg_login,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
        } 