import asyncio
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# Определяем путь к .env файлу
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    raise FileNotFoundError(f".env file not found at {env_path}")

# Загружаем переменные окружения из .env файла
load_dotenv(env_path)

# Проверяем наличие необходимых переменных окружения
required_vars = ['BOT_TOKEN', 'API_TOKEN', 'API_URL']
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram_dialog import setup_dialogs

from config import settings
from src.handlers.registration import router as registration_router
from src.handlers.menu import router as menu_router
from src.services.client import ClientService
from src.dialogs.menu import menu_dialog
from src.dialogs.new_client import new_client_dialog

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Инициализация бота и диспетчера
bot = Bot(
    token=settings.bot_token.get_secret_value(),
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()

# Инициализация сервисов
client_service = ClientService()

# Регистрация роутеров
dp.include_router(registration_router)
dp.include_router(menu_router)
dp.include_router(menu_dialog)
dp.include_router(new_client_dialog)

# Настройка диалогов
setup_dialogs(dp)

# Запуск бота
async def main():
    # Запускаем сервис клиентов
    await client_service.start()
    
    try:
        # Запускаем бота
        await dp.start_polling(bot)
    finally:
        # Останавливаем сервис клиентов при завершении
        await client_service.stop()

if __name__ == "__main__":
    asyncio.run(main())