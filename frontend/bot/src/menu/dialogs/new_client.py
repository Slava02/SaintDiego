import logging
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message, CallbackQuery
from aiogram_dialog import Dialog, Window, DialogManager, StartMode
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog.widgets.kbd import Button, Row, Back, Select, Column
from aiogram_dialog.widgets.input import MessageInput, TextInput

from src.utils.validators import validate_full_name
from src.services.client import ClientService
from src.models.client import Client
from src.states.menu import MainMenu

logger = logging.getLogger(__name__)

# Get singleton instance of ClientService
client_service = ClientService()

class NewClientSG(StatesGroup):
    """States for new client dialog"""
    input_name = State()
    check_existing = State()
    confirm = State()

async def name_handler(message: Message, widget: MessageInput, manager: DialogManager):
    """Handle name input"""
    logger.info(f"Processing name input: {message.text}")
    
    is_valid, error_message, name_parts = validate_full_name(message.text)
    
    if not is_valid:
        logger.warning(f"Invalid name input: {error_message}")
        await message.answer(f"❌ {error_message}\nПожалуйста, введите ФИО в формате: Имя Отчество Фамилия")
        return
    
    first_name, middle_name, last_name = name_parts
    logger.info(f"Valid name parts: first_name={first_name}, middle_name={middle_name}, last_name={last_name}")
    
    # Save data in dialog_data
    manager.dialog_data["first_name"] = first_name
    manager.dialog_data["middle_name"] = middle_name
    manager.dialog_data["last_name"] = last_name
    
    # Check for existing clients
    existing_clients = client_service.find_client_by_name(
        full_name=f"{last_name} {first_name} {middle_name}",
        min_similarity=98,
        limit=3
    )
    
    if existing_clients:
        # Save existing clients for display
        manager.dialog_data["existing_clients"] = [
            {
                "id": client.id,
                "full_name": client.full_name,
                "birth_date": "НОВЫЙ" if client.is_new else (client.birth_date.strftime("%d.%m.%Y") if client.birth_date else ""),
                "is_new": client.is_new
            }
            for client, _ in existing_clients
        ]
        await manager.switch_to(NewClientSG.check_existing)
    else:
        await manager.switch_to(NewClientSG.confirm)
    
    await message.delete()

async def get_existing_clients_data(dialog_manager: DialogManager, **kwargs):
    """Get data for existing clients window"""
    return {
        "clients": dialog_manager.dialog_data.get("existing_clients", []),
        "first_name": dialog_manager.dialog_data.get("first_name"),
        "middle_name": dialog_manager.dialog_data.get("middle_name"),
        "last_name": dialog_manager.dialog_data.get("last_name"),
    }

async def get_name_data(dialog_manager: DialogManager, **kwargs):
    """Get data for name confirmation window"""
    return {
        "first_name": dialog_manager.dialog_data.get("first_name"),
        "middle_name": dialog_manager.dialog_data.get("middle_name"),
        "last_name": dialog_manager.dialog_data.get("last_name"),
    }

async def on_confirm(callback, button, manager: DialogManager):
    """Handle confirmation"""
    # Create new client
    client = await client_service.create_client(
        first_name=manager.dialog_data["first_name"],
        middle_name=manager.dialog_data["middle_name"],
        last_name=manager.dialog_data["last_name"]
    )
    
    if client:
        logger.info(f"Client created successfully: {client}")
        # Save client ID in dialog_data
        manager.dialog_data["client_id"] = client.id
        await manager.done({"client_id": client.id})
    else:
        logger.error("Failed to create client")
        await callback.message.answer("❌ Произошла ошибка при создании клиента")
        await manager.done()

async def on_create_new(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Обработчик нажатия кнопки создания нового клиента"""
    # Переходим к вводу имени
    await manager.switch_to(NewClientSG.input_name)

async def on_existing_client_selected(callback: CallbackQuery, select: Select, manager: DialogManager, item_id: str):
    """Обработчик выбора существующего клиента из списка"""
    # Находим выбранного клиента по ID
    clients = manager.dialog_data.get("existing_clients", [])
    selected_client = None
    for client in clients:
        if str(client["id"]) == item_id:
            selected_client = client
            break
    
    if not selected_client:
        # Если клиент не найден (что странно), возвращаемся к началу
        logger.error(f"Client with ID {item_id} not found in dialog_data")
        logger.debug(f"Available clients: {clients}")
        await manager.done()
        return
    
    logger.info(f"Selected existing client: {selected_client}")
    # Открываем окно профиля клиента
    await manager.start(
        state=MainMenu.client_profile,
        data={"selected_client": selected_client}
    )

# Name input dialog
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
        Format("Найдены похожие клиенты:\n\n"
               "Выберите существующего клиента или создайте нового:"),
        Column(
            Select(
                Format("{item[full_name]} ({item[birth_date]})"),
                id="existing_clients",
                item_id_getter=lambda x: str(x["id"]),
                items="clients",
                on_click=on_existing_client_selected
            ),
        ),
        Row(
            Back(Const("◀️ Назад")),
            Button(Const("➕ Создать нового"), id="create_new", on_click=on_create_new),
        ),
        state=NewClientSG.check_existing,
        getter=get_existing_clients_data,
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