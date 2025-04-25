import logging
from datetime import datetime
from aiogram_dialog import DialogManager
from src.services.volunteer import VolunteerService
from src.services.booking import BookingService

logger = logging.getLogger(__name__)

async def get_main_menu_data(dialog_manager: DialogManager, **kwargs):
    """Get data for main menu window"""
    return {
        "volunteer_id": dialog_manager.event.from_user.id
    }

async def get_profile_data(dialog_manager: DialogManager, **kwargs):
    """Get data for profile window"""
    volunteer_service = VolunteerService()
    volunteer = await volunteer_service.get_volunteer(dialog_manager.event.from_user.id)
    return {
        "volunteer": volunteer
    }

async def get_services_data(dialog_manager: DialogManager, **kwargs):
    """Get data for services selection window"""
    booking_service = BookingService()
    client_id = dialog_manager.dialog_data.get("client_id")
    page = dialog_manager.dialog_data.get("service_page", 1)
    
    logger.info(f"Getting services data for client_id={client_id}, page={page}")
    
    services_data = await booking_service.get_available_services(client_id, page=page)
    logger.info(f"Received services data: {services_data}")
    
    services = []
    for service in services_data.get("services", []):
        service_dict = {
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "duration": service.duration,
            "capacity": service.capacity,
            "price": service.price
        }
        services.append(service_dict)
        logger.info(f"Created service dict: {service_dict}")
    
    dialog_manager.dialog_data["services"] = services
    
    return {
        "services": services,
        "current_page": page,
        "total_pages": services_data.get("total_pages", 1)
    }

async def get_events_data(dialog_manager: DialogManager, **kwargs):
    """Get data for events selection window"""
    booking_service = BookingService()
    service_id = dialog_manager.dialog_data.get("service_id")
    page = dialog_manager.dialog_data.get("event_page", 1)
    
    logger.info(f"Getting events data for service_id={service_id}, page={page}")
    
    events_data = await booking_service.get_service_events(service_id, page=page)
    logger.info(f"Received events data: {events_data}")
    
    events = []
    for event in events_data.get("items", []):
        event_dict = {
            "id": event.id,
            "datetime": event.datetime,
            "service_id": event.service_id,
            "service_name": event.service_name,
            "capacity": event.capacity,
            "participants_count": event.participants_count
        }
        events.append(event_dict)
        logger.info(f"Created event dict: {event_dict}")
    
    events_by_date = {}
    for event in events:
        date_key = event["datetime"].date()
        if date_key not in events_by_date:
            events_by_date[date_key] = []
        events_by_date[date_key].append(event)
    
    dialog_manager.dialog_data["events"] = events
    dialog_manager.dialog_data["events_by_date"] = events_by_date
    
    selected_date = dialog_manager.dialog_data.get("selected_date")
    
    if selected_date:
        if isinstance(selected_date, str):
            selected_date = datetime.fromisoformat(selected_date).date()
        filtered_events = events_by_date.get(selected_date, [])
    else:
        filtered_events = events
    
    return {
        "events": filtered_events,
        "current_page": page,
        "total_pages": events_data.get("total_pages", 1),
        "selected_date": dialog_manager.dialog_data.get("selected_date", ""),
        "service_name": dialog_manager.dialog_data.get("service_name", ""),
        "event_time": dialog_manager.dialog_data.get("event_time", "")
    } 