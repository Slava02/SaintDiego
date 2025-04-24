from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class Service:
    """Модель услуги"""
    id: int
    name: str
    description: Optional[str] = None
    duration: Optional[int] = None  # в минутах
    capacity: Optional[int] = None
    price: Optional[float] = None

    @classmethod
    def from_dict(cls, data: Dict) -> 'Service':
        """Создание объекта из словаря"""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data.get("description"),
            duration=data.get("duration"),
            capacity=data.get("capacity"),
            price=data.get("price")
        )

    def to_dict(self) -> Dict:
        """Преобразование объекта в словарь"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "duration": self.duration,
            "capacity": self.capacity,
            "price": self.price
        } 