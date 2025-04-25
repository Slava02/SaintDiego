from aiogram_dialog import Window, Dialog
from aiogram_dialog.widgets.text import Format, Const
from aiogram_dialog.widgets.kbd import Button, Row, Column, Select, Start
from src.states.menu import MainMenu
from src.menu.dialogs.new_client import NewClientSG, new_client_dialog
from src.menu.getters.data import (
    get_main_menu_data,
    get_profile_data,
    get_services_data,
    get_events_data
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
    process_new_client_result
)
from src.menu.widgets.calendar import CustomCalendar

# Main menu window
main_menu = Window(
    Format("👋 Главное меню\n\nВыберите действие:"),
    Column(
        Button(Const("👤 Мой профиль"), id="profile", on_click=on_profile_click),
        Start(
            Const("➕ Записать нового посетителя"),
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
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
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
    select_service_window,
    select_date_window,
    select_time_window,
    confirm_booking_window,
    on_process_result=process_new_client_result
) 