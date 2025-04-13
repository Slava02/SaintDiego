import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram_dialog import setup_dialogs

from handlers import start, profile
from dialogs.main_menu_new import main_menu

from config_reader import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger(__name__)

async def main():
    # Initialize bot and dispatcher
    bot = Bot(config.bot_token.get_secret_value())
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)
    
    # Register handlers
    dp.include_router(start.router)
    dp.include_router(profile.router)
    
    # Register dialogs
    dp.include_router(main_menu)
    setup_dialogs(dp)
    
    try:
        logger.info("Starting bot...")
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"Error in main: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main()) 