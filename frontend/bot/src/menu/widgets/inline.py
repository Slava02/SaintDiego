from aiogram.types import InlineKeyboardButton
from aiogram_dialog import DialogManager
from aiogram_dialog.widgets.kbd import SwitchInlineQuery
from aiogram_dialog.widgets.text import Text


class SwitchInlineQueryCurrentChat(SwitchInlineQuery):
    """Custom widget for inline query in current chat"""
    async def _render_keyboard(
            self,
            data: dict,
            manager: DialogManager,
    ) -> list[list[InlineKeyboardButton]]:
        return [
            [
                InlineKeyboardButton(
                    text=await self.text.render_text(data, manager),
                    switch_inline_query_current_chat=await self.switch_inline.render_text(
                        data, manager,
                    ),
                ),
            ],
        ] 