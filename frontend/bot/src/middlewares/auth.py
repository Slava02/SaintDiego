import logging
from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, TelegramObject
from src.services.volunteer import VolunteerService
from src.models.volunteer import Volunteer
from config import settings

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseMiddleware):
    """
    Middleware для проверки авторизации пользователя.
    Проверяет, зарегистрирован ли пользователь как волонтер и является ли участником чата.
    """
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        # Проверяем, что событие - это сообщение
        if not isinstance(event, Message):
            return await handler(event, data)

        # Получаем ID пользователя
        user_id = event.from_user.id

        # Проверяем, является ли пользователь участником чата
        try:
            chat_id = settings.volunteers_chat_id
            logger.info(f"Checking membership for user_id={user_id} in chat_id={chat_id}")
            chat_member = await event.bot.get_chat_member(chat_id=chat_id, user_id=user_id)
            
            if chat_member.status == "left" or chat_member.status == "kicked":
                logger.warning(f"User {user_id} is not an active member of the chat {chat_id} (status: {chat_member.status})")
                await event.answer("❌ Вы должны быть участником чата для доступа к функционалу записи.")
                return
                
            logger.info(f"User {user_id} is a member of the chat {chat_id} with status {chat_member.status}")
        except Exception as e:
            logger.error(f"Error checking chat membership for user {user_id} in chat {chat_id}: {e}", exc_info=True)
            await event.answer("❌ Произошла ошибка при проверке доступа к чату.")
            return
        
        # Добавляем информацию о волонтере в данные 
            # data["volunteer"] = volunteer
            # logger.info(f"Authorized access: user_id={user_id}, volunteer={volunteer}")
        
        return await handler(event, data) 