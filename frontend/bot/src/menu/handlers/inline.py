import logging
from typing import List
from aiogram import Router, F
from aiogram.types import InlineQuery, InlineQueryResultArticle, InputTextMessageContent, Message
from aiogram_dialog import DialogManager, StartMode
from src.states.menu import MainMenu
from src.services.client import ClientService
from src.menu.dialogs.new_client import NewClientSG
from aiogram.filters import Command

logger = logging.getLogger(__name__)

# Get singleton instance of ClientService
client_service = ClientService()

# Create router for inline handlers
router = Router()

@router.inline_query()
async def process_inline_query(inline_query: InlineQuery):
    """Обработка inline-запроса для поиска клиентов"""
    logger.info(f"Processing inline query: {inline_query.query}")
    query = inline_query.query.strip()
    
    results = []
    if not query:
        # Если запрос пустой, показываем текст с инструкцией и кнопку создания нового клиента
        results.append(
            InlineQueryResultArticle(
                id="instruction",
                title="✍️ Введите ФИО посетителя",
                input_message_content=InputTextMessageContent(
                    message_text="Введите ФИО посетителя"
                ),
                description="Вводить можно с ошибками"
            )
        )
        results.append(
            InlineQueryResultArticle(
                id="new_client",
                title="➕ Нажмите, если посетитель не найден",
                input_message_content=InputTextMessageContent(
                    message_text="/new_client"
                ),
                description="Создать нового посетителя"
            )
        )
    else:
        # Ищем похожих клиентов
        similar_clients = client_service.find_client_by_name(
            full_name=query,
            min_similarity=85,
            limit=5
        )
        # Добавляем найденных клиентов
        for client, similarity in similar_clients:
            results.append(
                InlineQueryResultArticle(
                    id=f"client_{client.id}",
                    title=client.full_name,
                    input_message_content=InputTextMessageContent(
                        message_text=f"/client_{client.id}"
                    ),
                    description=f"ID: {client.id}"
                )
            )
        # Кнопка создания нового клиента
        results.append(
            InlineQueryResultArticle(
                id="new_client",
                title="➕ Создать нового посетителя",
                input_message_content=InputTextMessageContent(
                    message_text="/new_client"
                ),
                description="Нажмите, если посетитель не найден"
            )
        )
    await inline_query.answer(results, cache_time=1)

@router.message(F.text == "/new_client")
async def create_new_client(message: Message, dialog_manager: DialogManager):
    """Обработка создания нового клиента через команду из inline-результата"""
    logger.info("Starting new client dialog from inline result")
    try:
        await message.delete()
    except Exception:
        pass
    await dialog_manager.start(NewClientSG.input_name)

@router.message(F.text.startswith("/client_"))
async def handle_client_selection(message: Message, dialog_manager: DialogManager):
    """Handle client selection via /client_<id> command from inline query."""
    logger.info(f"Initial dialog_data: {dialog_manager.dialog_data}")
    # Delete the service message
    try:
        await message.delete()
    except Exception:
        pass
    # Extract client ID from command
    client_id_str = message.text.removeprefix("/client_")
    if not client_id_str.isdigit():
        logger.error(f"Invalid client ID in command: {message.text}")
        await message.answer("❌ Неверный ID клиента.")
        return
    client_id = int(client_id_str)
    logger.info(f"Selected client ID: {client_id}")
    # Reload cache if needed
    if not client_service.clients:
        logger.info("Client cache empty, reloading from API.")
        await client_service.update_clients()
   
   
    # Start client profile dialog with start_data
    logger.info(f"Starting client profile dialog with start_data: {client_id}")
    await dialog_manager.start(
        state=MainMenu.client_profile,
        data={"client_id": client_id}
    ) 