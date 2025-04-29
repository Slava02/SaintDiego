from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram_dialog import DialogManager, StartMode

from src.states.registration import VolunteerRegistration
from src.services.volunteer import VolunteerService
from src.utils.validators import validate_full_name, validate_birth_date
from src.states.menu import MainMenu

router = Router()
volunteer_service = VolunteerService()


@router.message(Command("start"))
async def cmd_start(message: types.Message, state: FSMContext, dialog_manager: DialogManager):
    """Обработчик команды /start"""
    # Проверяем, зарегистрирован ли пользователь
    volunteer = await volunteer_service.get_volunteer(message.from_user.id)
    
    if volunteer:
        # Если пользователь уже зарегистрирован, показываем главное меню
        await message.answer("Вы уже зарегистрированы. Используйте /menu для доступа к функциям.")
        await dialog_manager.start(MainMenu.main, mode=StartMode.RESET_STACK)
        return
    
    # Если пользователь не зарегистрирован, начинаем процесс регистрации
    await message.answer(
        "👋 Добро пожаловать в систему записи для волонтеров благотворительной организации!\n\n"
        "Для начала работы необходимо пройти регистрацию.\n"
        "Пожалуйста, введите ваше ФИО (Имя Отчество Фамилия):"
    )
    await state.set_state(VolunteerRegistration.waiting_for_full_name)


@router.message(VolunteerRegistration.waiting_for_full_name)
async def process_full_name(message: types.Message, state: FSMContext):
    """Обработка ввода ФИО"""
    is_valid, error_message, name_parts = validate_full_name(message.text)
    
    if not is_valid:
        await message.answer(f"❌ {error_message}\nПожалуйста, введите ФИО в формате: Имя Отчество Фамилия")
        return
    
    # Сохраняем ФИО в состоянии
    first_name, middle_name, last_name = name_parts
    await state.update_data(
        first_name=first_name,
        middle_name=middle_name,
        last_name=last_name
    )
    
    # Запрашиваем дату рождения
    await message.answer(
        "✅ ФИО принято!\n\n"
        "Теперь, пожалуйста, введите вашу дату рождения в формате ДД.ММ.ГГГГ:"
    )
    await state.set_state(VolunteerRegistration.waiting_for_birth_date)


@router.message(VolunteerRegistration.waiting_for_birth_date)
async def process_birth_date(message: types.Message, state: FSMContext, dialog_manager: DialogManager):
    """Обработка ввода даты рождения"""
    is_valid, error_message, birth_date = validate_birth_date(message.text)
    
    if not is_valid:
        await message.answer(f"❌ {error_message}\nПожалуйста, введите дату в формате ДД.ММ.ГГГГ")
        return
    
    # Получаем сохраненные данные
    user_data = await state.get_data()
    
    try:
        # Создаем волонтера
        volunteer = await volunteer_service.create_volunteer(
            tg_id=message.from_user.id,
            tg_login=message.from_user.username or str(message.from_user.id),
            first_name=user_data["first_name"],
            middle_name=user_data["middle_name"],
            last_name=user_data["last_name"]
        )
        
        await message.answer(
            "✅ Регистрация успешно завершена!\n\n"
            "Теперь вы можете использовать все функции бота.\n"
            "Используйте /menu для доступа к основным функциям."
        )
        
    except Exception as e:
        await message.answer(
            "❌ Произошла ошибка при регистрации. Пожалуйста, попробуйте позже или обратитесь к администратору."
        )
    
    # Сбрасываем состояние
    await state.clear() 