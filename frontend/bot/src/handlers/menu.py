from aiogram import Router, types
from aiogram.filters import Command
from aiogram_dialog import DialogManager, StartMode
from src.services.volunteer import VolunteerService
from src.states.menu import MainMenu
import logging

logger = logging.getLogger(__name__)
router = Router()

@router.message(Command("menu"))
async def cmd_menu(message: types.Message, dialog_manager: DialogManager):
    """
    Обработчик команды /menu
    Открывает главное меню только для зарегистрированных пользователей
    """
    volunteer_service = VolunteerService()
    volunteer = await volunteer_service.get_volunteer(message.from_user.id)
    
    if not volunteer:
        logger.warning(f"Unauthorized access attempt: user_id={message.from_user.id}")
        await message.answer("❌ У вас нет доступа к этому боту. Пожалуйста, обратитесь к администратору.")
        return
    
    logger.info(f"Opening menu for volunteer: {volunteer}")
    await dialog_manager.start(MainMenu.main, mode=StartMode.RESET_STACK) 