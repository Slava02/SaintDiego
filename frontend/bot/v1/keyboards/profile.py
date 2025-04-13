from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def get_profile_keyboard() -> InlineKeyboardMarkup:
    """Create keyboard for profile actions"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="👤 Мой профиль",
                callback_data="view_profile"
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)