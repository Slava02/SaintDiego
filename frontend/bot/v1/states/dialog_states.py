from aiogram.filters.state import StatesGroup, State

class MainMenuSG(StatesGroup):
    """States for main menu dialog"""
    main = State()
    profile = State()
    edit_profile = State()

class RegistrationSG(StatesGroup):
    """States for registration process"""
    waiting_for_name = State()
    waiting_for_photo = State() 