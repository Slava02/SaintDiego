from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message
from aiogram_dialog import Dialog, Window, DialogManager
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog.widgets.kbd import Button, Row, Back
from aiogram_dialog.widgets.input import MessageInput
import logging

from src.utils.validators import validate_full_name
from src.services.booking import BookingService

logger = logging.getLogger(__name__)

class NewClientSG(StatesGroup):
    input_name = State()
    confirm = State()

async def name_handler(message: Message, widget: MessageInput, manager: DialogManager):
    """Обработчик ввода ФИО"""
    logger.info(f"Processing name input: {message.text}")
    
    is_valid, error_message, name_parts = validate_full_name(message.text)
    
    if not is_valid:
        logger.warning(f"Invalid name input: {error_message}")
        await message.answer(f"❌ {error_message}\nПожалуйста, введите ФИО в формате: Имя Отчество Фамилия")
        return
    
    first_name, middle_name, last_name = name_parts
    logger.info(f"Valid name parts: first_name={first_name}, middle_name={middle_name}, last_name={last_name}")
    
    # Сохраняем данные в dialog_data
    manager.dialog_data["first_name"] = first_name
    manager.dialog_data["middle_name"] = middle_name
    manager.dialog_data["last_name"] = last_name
    
    await message.delete()
    await manager.next()

async def get_name_data(dialog_manager: DialogManager, **kwargs):
    """Геттер для данных имени"""
    return {
        "first_name": dialog_manager.dialog_data.get("first_name"),
        "middle_name": dialog_manager.dialog_data.get("middle_name"),
        "last_name": dialog_manager.dialog_data.get("last_name"),
    }

async def on_confirm(callback, button, manager: DialogManager):
    """Обработчик подтверждения"""
    # Создаем нового клиента
    booking_service = BookingService()
    client = await booking_service.create_client(
        first_name=manager.dialog_data["first_name"],
        middle_name=manager.dialog_data["middle_name"],
        last_name=manager.dialog_data["last_name"]
    )
    
    if client:
        logger.info(f"Client created successfully: {client}")
        # Сохраняем ID клиента в dialog_data
        manager.dialog_data["client_id"] = client.id
        await manager.done({"client_id": client.id})
    else:
        logger.error("Failed to create client")
        await callback.message.answer("❌ Произошла ошибка при создании клиента")
        await manager.done()

# Диалог ввода ФИО
new_client_dialog = Dialog(
    Window(
        Const("Введите ФИО нового посетителя в формате:\nИмя Отчество Фамилия"),
        MessageInput(
            func=name_handler,
            content_types=["text"]
        ),
        state=NewClientSG.input_name,
    ),
    Window(
        Format("Проверьте данные:\n\n"
               "Имя: {first_name}\n"
               "Отчество: {middle_name}\n"
               "Фамилия: {last_name}"),
        Row(
            Back(Const("◀️ Назад")),
            Button(Const("✅ Подтвердить"), id="confirm", on_click=on_confirm),
        ),
        state=NewClientSG.confirm,
        getter=get_name_data,
    ),
) 