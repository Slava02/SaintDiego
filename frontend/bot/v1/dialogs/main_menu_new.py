from typing import Any, Dict

from aiogram_dialog import Dialog, Window, DialogManager
from aiogram_dialog.widgets.kbd import Button, Back, Row
from aiogram_dialog.widgets.text import Const, Format
from aiogram_dialog.widgets.media import DynamicMedia
from aiogram.types import CallbackQuery
from aiogram.enums import ContentType
from aiogram_dialog.api.entities import MediaAttachment, MediaId

from states.dialog_states import MainMenuSG
from storage.volunteers import volunteers_db

async def get_profile_data(dialog_manager: DialogManager, **kwargs) -> Dict[str, Any]:
    """Get profile data for the current user"""
    user_id = dialog_manager.event.from_user.id
    volunteer = volunteers_db.get(user_id, {})
    photo_file_id = volunteer.get("photo_file_id")
    
    data = {
        "full_name": volunteer.get("full_name", "Не указано"),
    }
    
    if photo_file_id:
        data["photo"] = MediaAttachment(
            ContentType.PHOTO,
            file_id=MediaId(photo_file_id)
        )
    
    return data

async def on_profile_click(callback: CallbackQuery, button: Button, manager: DialogManager) -> None:
    """Handle profile button click"""
    user_id = callback.from_user.id
    if user_id not in volunteers_db:
        await callback.answer("Вы не зарегистрированы. Используйте /start для регистрации.")
        return
    await manager.switch_to(MainMenuSG.profile)

async def on_edit_photo_click(callback: CallbackQuery, button: Button, manager: DialogManager) -> None:
    """Handle edit photo button click"""
    manager.dialog_data["edit_type"] = "photo"
    await callback.message.answer("Пожалуйста, отправьте новое фото для профиля")
    await manager.switch_to(MainMenuSG.edit_profile)

async def on_edit_name_click(callback: CallbackQuery, button: Button, manager: DialogManager) -> None:
    """Handle edit name button click"""
    manager.dialog_data["edit_type"] = "name"
    await callback.message.answer("Пожалуйста, отправьте ваше новое ФИО")
    await manager.switch_to(MainMenuSG.edit_profile)

# Main menu dialog
main_menu = Dialog(
    # Main window
    Window(
        Const("👋 Добро пожаловать в главное меню!"),
        Button(Const("👤 Мой профиль"), id="profile", on_click=on_profile_click),
        state=MainMenuSG.main,
    ),
    
    # Profile window
    Window(
        Format("👤 Профиль\n\nФИО: {full_name}"),
        DynamicMedia("photo"),
        Row(
            Button(Const("✏️ Редактировать фото"), id="edit_photo", on_click=on_edit_photo_click),
            Button(Const("✏️ Редактировать имя"), id="edit_name", on_click=on_edit_name_click),
        ),
        Back(Const("⬅️ Назад")),
        state=MainMenuSG.profile,
        getter=get_profile_data
    ),
    
    # Edit profile window
    Window(
        Const("Редактирование профиля"),
        Back(Const("⬅️ Отмена")),
        state=MainMenuSG.edit_profile,
    ),
) 