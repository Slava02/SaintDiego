from aiogram_dialog import Window, Dialog
from aiogram_dialog.widgets.text import Format, Const, Multi, Case, Jinja
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
import logging

logger = logging.getLogger(__name__)

# Main menu window
main_menu = Window(
    Format("👋 Главное меню\n\nВыберите действие:"),
    Column(
        Button(Const("👤 Мой профиль"), id="profile", on_click=on_profile_click),
        SwitchInlineQueryCurrentChat(
            Const("🔍 Записать посетителя"),
            id="search_client",
            switch_inline_query=Const("")
        ),
        Start(
            Const("➕ Новый посетитель"),
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
           "ID: {client_id}"),
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

# Селекторы для select_service_window
def is_too_long_ago(data, case, manager):
    """Проверяет, есть ли статус TOO_LONG_AGO"""
    status = data.get("status", "")
    result = status == "TOO_LONG_AGO"
    logger.info(f"is_too_long_ago: status={status}, result={result}")
    return result

def is_client_blocked(data, case, manager):
    """Проверяет, заблокирован ли посетитель"""
    is_blocked = data.get("is_blocked", False)
    result = is_blocked == True
    logger.info(f"is_client_blocked: is_blocked={is_blocked}, result={result}")
    return result

def is_new_client(data, case, manager):
    """Проверяет, является ли клиент новым"""
    is_new = data.get("is_new", False)
    result = is_new == True
    logger.info(f"is_new_client: is_new={is_new}, result={result}")
    return result

def is_already_booked(data, case, manager):
    """Проверяет, записан ли клиент на все доступные услуги"""
    is_booked = data.get("is_already_booked", False)
    result = is_booked == True
    logger.info(f"is_already_booked: is_booked={is_booked}, result={result}")
    return result

# Service selection window using Jinja
service_selection_template = Jinja("""
{% if is_new %}
    <b>👋 Новый посетитель!</b>
    
    Доступно только <i>первичное собеседование</i>.
    {% if not services %}
        <i>(Клиент уже записан на эту услугу)</i>
    {% endif %}
{% elif is_blocked %}
    <b>🚫 Посетитель заблокирован.</b>
    Причина: {{ blocked_reason }}
    
    Доступно только <i>повторное собеседование</i>.
    {% if not services %}
        <i>(Клиент уже записан на эту услугу)</i>
    {% endif %}
{% elif status == "TOO_LONG_AGO" %}
    <b>⚠️ Посетитель слишком давно не был у нас!</b>
    
    Доступно только <i>повторное собеседование</i>.
    {% if not services %}
        <i>(Клиент уже записан на эту услугу)</i>
    {% endif %}
{% elif is_already_booked %}
    <b>ℹ️ Клиент уже записан на все доступные услуги.</b>
    
    Попробуйте проверить историю записей клиента.
{% elif not services %}
    <b>ℹ️ В данный момент нет доступных для записи услуг.</b>
    
    Попробуйте проверить историю записей клиента.
{% else %}
    <b>Выберите услугу:</b>
{% endif %}
""")

select_service_window = Window(
    service_selection_template, # Jinja template for conditional text
    Column(
        Select( 
            Format("{item[name]}"),
            id="services",
            item_id_getter=lambda x: str(x["id"]),
            items="services",
            on_click=on_service_selected,
        ),
        Row(
            Button(Const("◀️ Назад"), id="back", on_click=on_back_to_client_profile),
        ),
    ),
    state=MainMenu.select_service,
    getter=get_services_data,
    parse_mode=ParseMode.HTML # Set parse mode for the window
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
    Column(
        Select(
            Format("{item[datetime]:%Y-%m-%d %H:%M:%S}"),
            id="times",
            item_id_getter=lambda x: str(x["id"]),
            items="events",
            on_click=on_time_selected
        ),
        Row(
            Button(Const("◀️ Назад"), id="back", on_click=on_back_to_date),
        ),
    ),
    state=MainMenu.select_time,
    getter=get_events_data
)

# Booking confirmation window
confirm_booking_window = Window(
    Format("Подтвердите запись:\n\n"
           "👤 Посетитель: {client_full_name}\n"
           "📋 Услуга: {service_name}\n"
           "📅 Дата: {selected_date}\n"
           "⏰ Время: {event_time}\n"
           "📍 Место: {location_name}\n"
           "🏠 Адрес: {location_address}"),
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