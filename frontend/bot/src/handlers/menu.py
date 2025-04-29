from aiogram import Router, types
from aiogram.filters import Command
from aiogram_dialog import DialogManager, StartMode
from src.states.menu import MainMenu
from src.models.volunteer import Volunteer
import logging

logger = logging.getLogger(__name__)
router = Router()

@router.message(Command("menu"))
async def cmd_menu(message: types.Message, dialog_manager: DialogManager):
    """
    Обработчик команды /menu
    Открывает главное меню для авторизованных пользователей
    """
    await dialog_manager.start(MainMenu.main, mode=StartMode.RESET_STACK) 