from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram_dialog import DialogManager

from states.registration import RegistrationState
from states.dialog_states import MainMenuSG
from keyboards.profile import get_profile_keyboard
from storage.volunteers import volunteers_db

router = Router()

def get_name_keyboard(full_name: str) -> ReplyKeyboardMarkup:
    """Create keyboard with user's full name button"""
    keyboard = [
        [KeyboardButton(text=full_name)]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)

def get_photo_keyboard() -> ReplyKeyboardMarkup:
    """Create keyboard for photo selection"""
    keyboard = [
        [KeyboardButton(text="Использовать мою аватарку")]
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)

async def delete_previous_messages(bot, chat_id: int, message_id: int):
    """Delete both bot's message and user's response"""
    try:
        # Delete bot's message
        await bot.delete_message(chat_id=chat_id, message_id=message_id - 1)
    except:
        pass  # Ignore if message not found
    try:
        # Delete user's message
        await bot.delete_message(chat_id=chat_id, message_id=message_id)
    except:
        pass  # Ignore if message not found

@router.message(Command("start"))
async def cmd_start(message: Message, state: FSMContext, dialog_manager: DialogManager):
    user_id = message.from_user.id
    
    # Check if user exists in database
    if user_id in volunteers_db:
        await dialog_manager.start(MainMenuSG.main)
    else:
        # Start registration process
        await state.set_state(RegistrationState.waiting_for_name)
        
        # Create keyboard with user's full name if available
        if message.from_user.full_name:
            await message.answer(
                "Добро пожаловать! Для регистрации в качестве волонтёра, пожалуйста, укажите ваше ФИО или нажмите кнопку:",
                reply_markup=get_name_keyboard(message.from_user.full_name)
            )
        else:
            await message.answer(
                "Добро пожаловать! Для регистрации в качестве волонтёра, пожалуйста, укажите ваше ФИО:"
            )

@router.message(RegistrationState.waiting_for_name)
async def process_name(message: Message, state: FSMContext):
    # Delete previous messages
    await delete_previous_messages(message.bot, message.chat.id, message.message_id)
    
    # Store name and move to photo state
    await state.update_data(full_name=message.text)
    await state.set_state(RegistrationState.waiting_for_photo)
    
    await message.answer(
        "Спасибо! Теперь, пожалуйста, отправьте вашу фотографию "
        "или используйте текущую аватарку:",
        reply_markup=get_photo_keyboard()
    )

@router.message(RegistrationState.waiting_for_photo)
async def process_photo(message: Message, state: FSMContext, dialog_manager: DialogManager):
    # Delete previous messages
    await delete_previous_messages(message.bot, message.chat.id, message.message_id)
    
    if message.text == "Использовать мою аватарку":
        # Get user's profile photo
        photos = await message.bot.get_user_profile_photos(message.from_user.id)
        if photos.photos:
            photo = photos.photos[0][-1]  # Get the largest photo
            await state.update_data(photo_file_id=photo.file_id)
            await complete_registration(message, state, dialog_manager)
        else:
            await message.answer(
                "Извините, не удалось получить вашу аватарку. "
                "Пожалуйста, отправьте фотографию вручную."
            )
    elif message.photo:
        # Store photo file_id
        await state.update_data(photo_file_id=message.photo[-1].file_id)
        await complete_registration(message, state, dialog_manager)
    else:
        await message.answer(
            "Пожалуйста, отправьте фотографию или нажмите кнопку 'Использовать мою аватарку'"
        )

async def complete_registration(event: Message, state: FSMContext, dialog_manager: DialogManager):
    # Delete previous messages
    await delete_previous_messages(event.bot, event.chat.id, event.message_id)
    
    # Get all registration data
    data = await state.get_data()
    user_id = event.from_user.id
    
    # Store in temporary database
    volunteers_db[user_id] = {
        "full_name": data["full_name"],
        "photo_file_id": data["photo_file_id"]
    }
    
    # Clear state
    await state.clear()
    
    # Start main menu dialog
    await dialog_manager.start(MainMenuSG.main)