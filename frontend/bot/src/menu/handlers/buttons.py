import logging
from aiogram_dialog import DialogManager
from src.services.booking import BookingService
from src.states.menu import MainMenu
from aiogram.types import CallbackQuery
from aiogram_dialog.widgets.kbd import Button

logger = logging.getLogger(__name__)

async def on_profile_click(callback, button, manager: DialogManager):
    """Handle profile button click"""
    await manager.switch_to(MainMenu.profile)

async def on_back_to_main(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle back to main button click"""
    await manager.switch_to(MainMenu.main)

async def on_back_to_service(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle back to service selection button click"""
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

async def process_new_client_result(data: dict, manager: DialogManager):
    """Process result of new client dialog"""
    client_id = data.get("client_id")
    if client_id:
        # Save client ID in dialog_data
        manager.dialog_data["client_id"] = client_id
        # Switch to service selection
        await manager.switch_to(MainMenu.select_service)

# Новые обработчики для истории записей клиента

async def on_view_client_history(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle view client history button click"""
    # Reset page counter
    manager.dialog_data["history_page"] = 1
    await manager.switch_to(MainMenu.client_booking_history)

async def on_back_to_client_profile(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle back to client profile button click"""
    await manager.switch_to(MainMenu.client_profile)

async def on_next_history_page(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle next history page button click"""
    current_page = manager.dialog_data.get("history_page", 1)
    total_pages = manager.dialog_data.get("total_pages", 1)
    
    if current_page < total_pages:
        manager.dialog_data["history_page"] = current_page + 1
    
    await manager.switch_to(MainMenu.client_booking_history)

async def on_prev_history_page(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Handle previous history page button click"""
    current_page = manager.dialog_data.get("history_page", 1)
    
    if current_page > 1:
        manager.dialog_data["history_page"] = current_page - 1
    
    await manager.switch_to(MainMenu.client_booking_history) 