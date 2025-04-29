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
        await message.answer(f"❌ {error_message}\nПожалуйста, введите ФИО в формате: Имя Фамилия Отчество")
        return
    
    middle_name, first_name, last_name = name_parts
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
    name_data = {
        "first_name": dialog_manager.dialog_data.get("first_name"),
        "middle_name": dialog_manager.dialog_data.get("middle_name"),
        "last_name": dialog_manager.dialog_data.get("last_name"),
    }
    logger.info(f"Name data: {name_data}")
    """Get data for name confirmation window"""
    return name_data

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
        # Save client_id in dialog_data
        manager.dialog_data["client_id"] = client.id
        # Start client profile dialog with start_data
        await manager.start(
            state=MainMenu.client_profile,
            data={"client_id": client.id}
        )
    else:
        logger.error("Failed to create client")
        await callback.message.answer("❌ Произошла ошибка при создании посетителя ")
        await manager.done()

async def on_create_new(callback: CallbackQuery, button: Button, manager: DialogManager):
    """Обработчик нажатия кнопки создания нового клиента"""
    # Переходим к подтверждению введенных данных
    logger.info("Going to confirmation from 'create new' button")
    logger.info(f"Dialog data at this point: {manager.dialog_data}")
    await manager.switch_to(NewClientSG.confirm)

async def on_existing_client_selected(callback: CallbackQuery, select: Select, manager: DialogManager, item_id: str):
    """Обработчик выбора существующего клиента из списка"""
    client_id = int(item_id)
    logger.info(f"Selected existing client: {client_id}")
    
    # Save client_id in dialog_data
    manager.dialog_data["client_id"] = client_id
    
    # Открываем окно профиля клиента
    await manager.start(
        state=MainMenu.client_profile,
        data={"client_id": client_id}
    )

# Name input dialog
new_client_dialog = Dialog(
    Window(
        Const("Введите ФИО нового посетителя в формате:\nФамилия Имя Отчество"),
        MessageInput(
            func=name_handler,
            content_types=["text"]
        ),
        state=NewClientSG.input_name,
    ),
    Window(
        Format("Найдены похожие посетители:\n\n"
               "Выберите существующего посетителя или создайте нового:"),
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