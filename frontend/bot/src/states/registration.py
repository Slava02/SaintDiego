from aiogram.fsm.state import State, StatesGroup


class VolunteerRegistration(StatesGroup):
    """Состояния для регистрации волонтера"""
    waiting_for_full_name = State()  # Ожидание ввода ФИО
    waiting_for_birth_date = State()  # Ожидание ввода даты рождения
    checking_chat_membership = State()  # Проверка членства в чатах 