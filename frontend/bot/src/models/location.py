from dataclasses import dataclass
from typing import Dict


@dataclass
class Location:
    """Модель локации"""
    id: int
    name: str
    address: str

    @classmethod
    def from_dict(cls, data: Dict) -> 'Location':
        """Создание объекта из словаря"""
        return cls(
            id=data["id"],
            name=data["name"],
            address=data["address"]
        )

    def to_dict(self) -> Dict:
        """Преобразование объекта в словарь"""
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address
        }