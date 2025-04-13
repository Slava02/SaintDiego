from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram_dialog import DialogManager

from keyboards.profile import get_profile_keyboard
from states.dialog_states import MainMenuSG
from storage.volunteers import volunteers_db

router = Router()

@router.message(Command("profile"))
async def show_profile(message: Message, dialog_manager: DialogManager):
    user_id = message.from_user.id
    
    if user_id not in volunteers_db:
        await message.answer(
            "Вы не зарегистрированы. Пожалуйста, используйте команду /start для регистрации."
        )
        return
    
    await dialog_manager.start(MainMenuSG.main)

@router.message(F.photo, F.state == MainMenuSG.edit_profile)
async def handle_new_photo(message: Message, dialog_manager: DialogManager):
    user_id = message.from_user.id
    if user_id not in volunteers_db:
        await message.answer("Вы не зарегистрированы. Используйте /start для регистрации.")
        return
    
    edit_type = dialog_manager.dialog_data.get("edit_type")
    if edit_type != "photo":
        await message.answer("Пожалуйста, отправьте фото")
        return
    
    volunteers_db[user_id]["photo_file_id"] = message.photo[-1].file_id
    await message.answer("✅ Фото профиля успешно обновлено!")
    await dialog_manager.switch_to(MainMenuSG.profile)

@router.message(F.text, F.state == MainMenuSG.edit_profile)
async def handle_new_name(message: Message, dialog_manager: DialogManager):
    user_id = message.from_user.id
    if user_id not in volunteers_db:
        await message.answer("Вы не зарегистрированы. Используйте /start для регистрации.")
        return
    
    edit_type = dialog_manager.dialog_data.get("edit_type")
    if edit_type != "name":
        await message.answer("Пожалуйста, отправьте текст")
        return
    
    volunteers_db[user_id]["full_name"] = message.text
    await message.answer("✅ ФИО успешно обновлено!")
    await dialog_manager.switch_to(MainMenuSG.profile)

@router.callback_query(F.data == "view_profile")
async def view_profile(callback: CallbackQuery):
    user_id = callback.from_user.id
    
    if user_id not in volunteers_db:
        await callback.answer("Вы не зарегистрированы. Используйте /start для регистрации.")
        return
    
    volunteer = volunteers_db[user_id]
    await callback.message.answer_photo(
        photo=volunteer["photo_file_id"],
        caption=f"👤 {volunteer['full_name']}\n\nВыберите действие:",
        reply_markup=get_profile_keyboard()
    )
    await callback.answer()

@router.callback_query(F.data == "view_bookings")
async def view_bookings(callback: CallbackQuery):
    # TODO: Implement bookings view
    await callback.answer("Функция просмотра записей будет доступна в ближайшее время!")