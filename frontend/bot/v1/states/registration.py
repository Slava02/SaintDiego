from aiogram.fsm.state import State, StatesGroup

class RegistrationState(StatesGroup):
    """States for volunteer registration process"""
    waiting_for_name = State()
    waiting_for_photo = State() 