from aiogram.fsm.state import StatesGroup, State


class MainMenu(StatesGroup):
    """Состояния главного меню"""
    main = State()  # Главное меню
    profile = State()  # Профиль волонтера
    new_client = State()  # Запись нового клиента
    new_client_name = State()  # Ввод ФИО нового клиента
    select_service = State()  # Выбор услуги
    select_date = State()  # Выбор даты
    select_time = State()  # Выбор времени
    confirm_booking = State()  # Подтверждение записи 