from aiogram import Router, types
from aiogram.filters import Command
from aiogram_dialog import DialogManager, StartMode

from src.states.menu import MainMenu

router = Router()

@router.message(Command("menu"))
async def cmd_menu(message: types.Message, dialog_manager: DialogManager):
    """
    Обработчик команды /menu
    Открывает главное меню
    """
    await dialog_manager.start(MainMenu.main, mode=StartMode.RESET_STACK) 