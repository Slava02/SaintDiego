from dataclasses import dataclass
from typing import Dict, Optional
from datetime import datetime

from .location import Location

@dataclass
class Event:
    """Модель события"""
    id: int
    service_id: int
    service_name: str
    datetime: datetime
    capacity: int
    participants_count: int
    location: Location
    time_slot_service_id: Optional[int] = None

    @classmethod
    def from_dict(cls, data: Dict) -> 'Event':
        """Создание объекта из словаря"""
        return cls(
            id=data["id"],
            service_id=data["serviceTypeId"],
            service_name=data["serviceName"],
            datetime=datetime.fromisoformat(data["datetime"].replace("Z", "+00:00")),
            capacity=data["capacity"],
            participants_count=data["participantsCount"],
            location=Location.from_dict(data["location"]),
            time_slot_service_id=data.get("timeSlotServiceId")
        )

    def to_dict(self) -> Dict:
        """Преобразование объекта в словарь"""
        return {
            "id": self.id,
            "serviceTypeId": self.service_id,
            "serviceName": self.service_name,
            "datetime": self.datetime.isoformat(),
            "capacity": self.capacity,
            "participantsCount": self.participants_count,
            "location": self.location.to_dict(),
            "timeSlotServiceId": self.time_slot_service_id
        } 