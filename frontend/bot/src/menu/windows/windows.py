from aiogram_dialog import Window, Dialog
from aiogram_dialog.widgets.text import Format, Const, Multi, Case
from aiogram_dialog.widgets.kbd import Button, Row, Column, Select, Start
from src.states.menu import MainMenu
from src.menu.dialogs.new_client import NewClientSG
from src.menu.getters.data import (
    get_main_menu_data,
    get_profile_data,
    get_services_data,
    get_events_data,
    get_client_profile_data,
    get_client_booking_history
)
from src.menu.handlers.buttons import (
    on_profile_click,
    on_back_to_main,
    on_back_to_service,
    on_back_to_date,
    on_service_selected,
    on_date_selected,
    on_time_selected,
    on_confirm_booking,
    process_new_client_result,
    on_view_client_history,
    on_back_to_client_profile,
    on_next_history_page,
    on_prev_history_page,
    on_book_service
)
from src.menu.widgets.calendar import CustomCalendar
from src.menu.widgets.inline import SwitchInlineQueryCurrentChat
from aiogram.enums import ParseMode

# Main menu window
main_menu = Window(
    Format("👋 Главное меню\n\nВыберите действие:"),
    Column(
        Button(Const("👤 Мой профиль"), id="profile", on_click=on_profile_click),
        SwitchInlineQueryCurrentChat(
            Const("🔍 Найти посетителя"),
            id="search_client",
            switch_inline_query=Const("")
        ),
        Start(
            Const("👤 Новый посетитель"),
            id="new_client",
            state=NewClientSG.input_name
        ),
    ),
    state=MainMenu.main,
    getter=get_main_menu_data
)

# Profile window
profile_window = Window(
    Format("👤 Профиль волонтера\n\n"
           "Имя: {volunteer[first_name]}\n"
           "Отчество: {volunteer[middle_name]}\n"
           "Фамилия: {volunteer[last_name]}"),
    Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
    state=MainMenu.profile,
    getter=get_profile_data
)

# Client profile window
client_profile_window = Window(
    Format("👤 Профиль посетителя\n\n"
           "ФИО: {full_name}\n"
           "Дата рождения: {birth_date}"),
    Column(
        Button(Const("📋 История записей"), id="client_history", on_click=on_view_client_history),
        Button(Const("📝 Записать"), id="book_service", on_click=on_book_service),
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
    ),
    state=MainMenu.client_profile,
    getter=get_client_profile_data
)

# Client booking history window
client_booking_history_window = Window(
    Format("📋 История записей посетителя\n👤 {full_name}\n\n"),
    Case(
        {
            True: Const("📆 <b>ПРЕДСТОЯЩИЕ ЗАПИСИ:</b>"),
            False: Const("")
        },
        selector=lambda data, case, manager: data.get("has_upcoming", False)
    ),
    Case(
        {
            True: Format("\n{upcoming_list}"),
            False: Const("")
        },
        selector=lambda data, case, manager: data.get("upcoming_list", "") != ""
    ),
    Case(
        {
            True: Const("\n\n📚 <b>ПРОШЕДШИЕ ЗАПИСИ:</b>"),
            False: Const("")
        },
        selector=lambda data, case, manager: data.get("has_past", False)
    ),
    Case(
        {
            True: Format("\n{past_list}"),
            False: Const("")
        },
        selector=lambda data, case, manager: data.get("past_list", "") != ""
    ),
    Case(
        {
            True: Const("\n\nУ посетителя нет записей"),
            False: Const("")
        },
        selector=lambda data, case, manager: not data.get("has_upcoming", False) and not data.get("has_past", False)
    ),
    Row(
        Button(Const("⬅️"), id="prev_page", on_click=on_prev_history_page, when="page > 1"),
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_client_profile),
        Button(Const("➡️"), id="next_page", on_click=on_next_history_page, when="page < total_pages"),
    ),
    Case(
        {
            True: Format("Страница {page} из {total_pages}"),
            False: Const("")
        },
        selector=lambda data, case, manager: data.get("page", 1) > 1 or data.get("page", 1) < data.get("total_pages", 1)
    ),
    parse_mode=ParseMode.HTML,
    state=MainMenu.client_booking_history,
    getter=get_client_booking_history
)

# Service selection window
select_service_window = Window(
    Format("Выберите услугу:"),
    Select(
        Format("{item[name]}"),
        id="services",
        item_id_getter=lambda x: str(x["id"]),
        items="services",
        on_click=on_service_selected
    ),
    Row(
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_client_profile),
    ),
    state=MainMenu.select_service,
    getter=get_services_data
)

# Date selection window
select_date_window = Window(
    Format("Выберите дату для услуги {service_name}:"),
    CustomCalendar(
        id="calendar",
        on_click=on_date_selected
    ),
    Button(Const("◀️ Назад"), id="back", on_click=on_back_to_service),
    state=MainMenu.select_date,
    getter=get_events_data
)

# Time selection window
select_time_window = Window(
    Format("Выберите время на {selected_date}:"),
    Select(
        Format("{item[datetime]:%Y-%m-%d %H:%M:%S}"),
        id="times",
        item_id_getter=lambda x: str(x["id"]),
        items="events",
        on_click=on_time_selected
    ),
    Row(
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_date),
        Button(Const("▶️ Вперед"), id="next", on_click=lambda c, b, m: m.switch_to(MainMenu.select_time))
    ),
    state=MainMenu.select_time,
    getter=get_events_data
)

# Booking confirmation window
confirm_booking_window = Window(
    Format("Подтвердите запись:\n\n"
           "Услуга: {service_name}\n"
           "Дата: {selected_date}\n"
           "Время: {event_time}"),
    Column(
        Button(Const("✅ Подтвердить"), id="confirm", on_click=on_confirm_booking),
        Button(Const("❌ Отмена"), id="cancel", on_click=on_back_to_main)
    ),
    state=MainMenu.confirm_booking,
    getter=get_events_data
)

# Create dialog
menu_dialog = Dialog(
    main_menu,
    profile_window,
    client_profile_window,
    client_booking_history_window,
    select_service_window,
    select_date_window,
    select_time_window,
    confirm_booking_window,
    on_process_result=process_new_client_result
) 