import logging
from aiogram_dialog import DialogManager
from src.services.booking import BookingService
from src.states.menu import MainMenu

logger = logging.getLogger(__name__)

async def on_profile_click(callback, button, manager: DialogManager):
    """Handle profile button click"""
    await manager.switch_to(MainMenu.profile)

async def on_back_to_main(callback, button, manager: DialogManager):
    """Handle back to main menu button click"""
    await manager.switch_to(MainMenu.main)

async def on_back_to_service(callback, button, manager: DialogManager):
    """Handle back to service selection window"""
    await manager.switch_to(MainMenu.select_service)

async def on_back_to_date(callback, button, manager: DialogManager):
    """Handle back to date selection window"""
    await manager.switch_to(MainMenu.select_date)

async def on_service_selected(callback, button, manager: DialogManager, item):
    """Handle service selection"""
    logger.info(f"Service selected: item={item}")
    
    service_id = int(callback.data.split(":")[1])
    
    services = manager.dialog_data.get("services", [])
    service = next((s for s in services if s["id"] == service_id), None)
    
    if service:
        service_name = service["name"]
        logger.info(f"Found service: id={service_id}, name={service_name}")
        
        manager.dialog_data["service_id"] = service_id
        manager.dialog_data["service_name"] = service_name
        
        await manager.switch_to(MainMenu.select_date)
    else:
        logger.error(f"Service not found: id={service_id}")
        await callback.message.answer("❌ Произошла ошибка при выборе услуги")

async def on_date_selected(callback, button, manager: DialogManager, item):
    """Handle date selection"""
    selected_date = item
    logger.info(f"Date selected: {selected_date}")
    
    manager.dialog_data["selected_date"] = selected_date
    await manager.switch_to(MainMenu.select_time)

async def on_time_selected(callback, button, manager: DialogManager, item):
    """Handle time selection"""
    logger.info(f"Time selected: item={item}")
    
    event_id = int(callback.data.split(":")[1])
    
    events = manager.dialog_data.get("events", [])
    event = next((e for e in events if e["id"] == event_id), None)
    
    if event:
        event_time = event["datetime"]
        logger.info(f"Found event: id={event_id}, time={event_time}")
        
        manager.dialog_data["event_id"] = event_id
        manager.dialog_data["event_time"] = event_time
        
        await manager.switch_to(MainMenu.confirm_booking)
    else:
        logger.error(f"Event not found: id={event_id}")
        await callback.message.answer("❌ Произошла ошибка при выборе времени")

async def on_confirm_booking(callback, button, manager: DialogManager):
    """Handle booking confirmation"""
    booking_service = BookingService()
    event_id = manager.dialog_data["event_id"]
    client_id = manager.dialog_data["client_id"]
    volunteer_id = manager.event.from_user.id
    
    logger.info(f"Confirming booking: event_id={event_id}, client_id={client_id}, volunteer_id={volunteer_id}")
    
    success = await booking_service.book_event(
        event_id=event_id,
        participant_id=client_id,
        volunteer_id=volunteer_id
    )
    
    if not success:
        await callback.message.answer("❌ Произошла ошибка при создании записи")
    
    await manager.switch_to(MainMenu.main)

async def process_new_client_result(start_data, result, manager: DialogManager):
    """Handle new client creation result"""
    if result:
        manager.dialog_data["client_id"] = result["client_id"]
        await manager.switch_to(MainMenu.select_service) 