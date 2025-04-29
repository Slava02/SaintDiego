import logging
from datetime import datetime
from aiogram_dialog import DialogManager
from src.services.volunteer import VolunteerService
from src.services.booking import BookingService
from src.states.menu import MainMenu
from src.services.client import ClientService

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
    
    if not client_id:
        logger.error("No client_id found in dialog_data")
        return {
            "services": [],
            "current_page": page,
            "total_pages": 1
        }
    
    logger.info(f"Getting services data for client_id={client_id}, page={page}")
    
    # Получаем данные клиента из ClientService
    client_service = ClientService()
    client = client_service.get_client_by_id(client_id)
    
    if not client:
        logger.error(f"Client not found in ClientService: id={client_id}")
        return {
            "services": [],
            "current_page": page,
            "total_pages": 1
        }
    
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
        "total_pages": services_data.get("total_pages", 1),
        "status": services_data.get("status"),
        "is_blocked": client.is_blocked,
        "blocked_at": client.blocked_at,
        "blocked_reason": client.blocked_reason,
        "is_new": client.is_new
    }

async def get_events_data(dialog_manager: DialogManager, **kwargs):
    """Get data for events selection window"""
    booking_service = BookingService()
    service_id = dialog_manager.dialog_data.get("service_id")
    client_id = dialog_manager.dialog_data.get("client_id")
    page = dialog_manager.dialog_data.get("event_page", 1)
    
    if not service_id or not client_id:
        logger.error("No service_id or client_id found in dialog_data")
        return {
            "events": [],
            "current_page": page,
            "total_pages": 1
        }
    
    logger.info(f"Getting events data for service_id={service_id}, client_id={client_id}, page={page}")
    
    events_data = await booking_service.get_service_events(client_id, service_id, page=page)
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
    
    # Получаем данные клиента из ClientService
    client_service = ClientService()
    client = client_service.get_client_by_id(client_id)
    
    if not client:
        logger.error(f"Client not found in ClientService: id={client_id}")
        return {
            "events": filtered_events,
            "current_page": page,
            "total_pages": events_data.get("total_pages", 1),
            "selected_date": dialog_manager.dialog_data.get("selected_date", ""),
            "service_name": dialog_manager.dialog_data.get("service_name", ""),
            "event_time": dialog_manager.dialog_data.get("event_time", ""),
            "client_full_name": "Не указано"
        }
    
    return {
        "events": filtered_events,
        "current_page": page,
        "total_pages": events_data.get("total_pages", 1),
        "selected_date": dialog_manager.dialog_data.get("selected_date", ""),
        "service_name": dialog_manager.dialog_data.get("service_name", ""),
        "event_time": dialog_manager.dialog_data.get("event_time", ""),
        "client_full_name": client.full_name
    }

async def get_client_profile_data(dialog_manager: DialogManager, **kwargs):
    """Get data for client profile window"""
    logger.info("Getting client profile data")
    # Try to get client_id from start_data first, then from dialog_data
    client_id = None
    source = ""
    
    # Safely check start_data first (might be None when using switch_to)
    if hasattr(dialog_manager, 'start_data') and dialog_manager.start_data is not None:
        client_id = dialog_manager.start_data.get("client_id")
        source = "start_data"
        
    # Fallback to dialog_data if not found or start_data is None
    if not client_id:
        # Fallback to dialog_data
        client_id = dialog_manager.dialog_data.get("client_id")
        source = "dialog_data"

    logger.info(f"Retrieved client_id from {source}: {client_id}")
    
    if not client_id:
        logger.warning("No client_id found, returning blanks")
        # Return default placeholders to avoid KeyError
        return {
            "full_name": "Не указано",
            "client_id": "Не указан"
        }
    
    # Сохраняем client_id в dialog_data
    dialog_manager.dialog_data["client_id"] = client_id
    
    # Получаем данные клиента из ClientService
    client_service = ClientService()
    client = client_service.get_client_by_id(client_id)
    
    if not client:
        logger.error(f"Client not found in ClientService: id={client_id}")
        return {
            "full_name": "Не указано",
            "client_id": "Не указан"
        }
    
    profile_data = {
        "client_id": client.id,
        "full_name": client.full_name,
        "is_new": client.is_new
    }
    
    logger.info(f"Returning profile data: {profile_data}")
    return profile_data

async def get_client_booking_history(dialog_manager: DialogManager, **kwargs):
    """Get data for client booking history window"""
    logger.info("Getting client booking history")
    booking_service = BookingService()
    client_service = ClientService()
    
    # Get client_id from dialog_data
    client_id = dialog_manager.dialog_data.get("client_id")
    if not client_id:
        logger.warning("No client_id found in dialog_data, returning empty history")
        return {
            "client_id": None,
            "full_name": "Не указано",
            "upcoming_events": [],
            "past_events": [],
            "page": 1,
            "total_pages": 0
        }
    
    # Get client data from ClientService
    client = client_service.get_client_by_id(client_id)
    if not client:
        logger.error(f"Client not found in ClientService: id={client_id}")
        return {
            "client_id": client_id,
            "full_name": "Не указано",
            "upcoming_events": [],
            "past_events": [],
            "page": 1,
            "total_pages": 0
        }
    
    # Get page from dialog_data
    page = dialog_manager.dialog_data.get("history_page", 1)
    
    # Get client events
    events_data = await booking_service.get_client_events(
        client_id=client_id,
        history_limit=5,
        page=page,
        per_page=10
    )
    
    # Format event data for display
    upcoming_events = []
    for event in events_data.get("upcoming_events", []) or []:
        # Format as string with only datetime and service name
        event_str = f"🕓 {event.datetime.strftime('%d.%m.%Y %H:%M')} - {event.service_name}"
        upcoming_events.append(event_str)
    
    past_events = []
    for event in events_data.get("past_events", []) or []:
        # Format as string with only datetime and service name
        event_str = f"🕓 {event.datetime.strftime('%d.%m.%Y %H:%M')} - {event.service_name}"
        past_events.append(event_str)
    
    # Pre-join lists for easier display
    upcoming_list = "\n".join(upcoming_events) if upcoming_events else ""
    past_list = "\n".join(past_events) if past_events else ""
    
    # Make sure all required keys are present
    result = {
        "client_id": client_id,
        "full_name": client.full_name,
        "upcoming_events": upcoming_events or [],
        "past_events": past_events or [],
        "upcoming_list": upcoming_list or "",
        "past_list": past_list or "",
        "has_upcoming": len(upcoming_events) > 0,
        "has_past": len(past_events) > 0,
        "page": page or 1,
        "total_pages": events_data.get("total_pages", 0) or 1
    }
    
    logger.info(f"Returning client booking history: {result}")
    return result 