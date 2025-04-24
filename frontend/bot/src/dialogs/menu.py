import logging
from aiogram_dialog import Dialog, Window, DialogManager, StartMode
from aiogram_dialog.widgets.text import Format, Const, Text, Case
from aiogram_dialog.widgets.kbd import Button, Row, Column, ScrollingGroup, Calendar, Select, Start
from aiogram_dialog.widgets.input import MessageInput
from aiogram.types import Message, InlineKeyboardButton
from datetime import datetime, date

from src.states.menu import MainMenu
from src.services.volunteer import VolunteerService
from src.services.booking import BookingService
from src.utils.validators import validate_full_name
from src.dialogs.new_client import NewClientSG, new_client_dialog
from aiogram_dialog.widgets.kbd.calendar_kbd import (
    CalendarDaysView,
    CalendarMonthView,
    CalendarScopeView,
    CalendarYearsView,
    CalendarScope,
    CalendarUserConfig,
    CalendarConfig,
)

logger = logging.getLogger(__name__)


class CustomCalendarDaysView(CalendarDaysView):
    def __init__(self, callback_generator, config):
        super().__init__(
            callback_generator,
            date_text=Case(
                {
                    True: Format("✅ {date:%d}"),
                    False: Format("{date:%d}"),
                },
                selector=self._is_date_available_selector,
            ),
            header_text=Format("> {date: %B %Y} <"),
        )
        self.logger = logging.getLogger(__name__)

    def _is_date_available_selector(self, data: dict, case: Case, manager: DialogManager) -> bool:
        """Вызывается для каждой даты, возвращает True/False для Case."""
        current_date = data["date"]
        dialog_data = manager.current_context().dialog_data
        self.logger.debug(f"Selector checking date: {current_date}, dialog_data keys: {dialog_data.keys()}")
        
        # Получаем события из dialog_data
        events = dialog_data.get("events", [])
        self.logger.debug(f"Events in dialog_data: {events}")
        
        # Вызываем наш существующий метод проверки
        is_available = self._is_date_available(current_date, events)
        self.logger.debug(f"Selector result for {current_date}: {is_available}")
        return is_available

    def _is_date_available(self, date_to_check: date, events: list) -> bool:
        """Проверяет, доступна ли дата для записи (основная логика)"""
        self.logger.info(f"_is_date_available checking date: {date_to_check}")
        
        if not events:
            self.logger.info("No events available")
            return False
        
        # Проверяем, что дата не в прошлом
        if date_to_check < datetime.now().date():
            self.logger.info(f"Date {date_to_check} is in the past")
            return False
        
        # Проверяем, что дата не дальше последней доступной даты
        try:
            # Преобразуем все даты событий в объекты date для корректного сравнения
            event_dates = []
            for event in events:
                try:
                    # Проверяем, является ли datetime строкой или объектом datetime
                    if isinstance(event["datetime"], str):
                        event_date = datetime.fromisoformat(event["datetime"]).date()
                    else:
                        event_date = event["datetime"].date()
                    event_dates.append(event_date)
                except (AttributeError, TypeError) as e:
                    self.logger.error(f"Error processing event date: {e}, event: {event}")
                    continue
            
            if not event_dates:
                self.logger.warning("No valid event dates found")
                return False
                
            last_event_date = max(event_dates)
            self.logger.info(f"Event dates: {event_dates}")
            self.logger.info(f"Last available event date: {last_event_date}")
            
            if date_to_check > last_event_date:
                self.logger.info(f"Date {date_to_check} is beyond last available date")
                return False
        except ValueError as e:
            self.logger.warning(f"Could not determine last_event_date: {e}")
            return False
        
        # Проверяем, есть ли события на эту дату
        available_events = []
        for event in events:
            try:
                # Проверяем, является ли datetime строкой или объектом datetime
                if isinstance(event["datetime"], str):
                    event_date = datetime.fromisoformat(event["datetime"]).date()
                else:
                    event_date = event["datetime"].date()
                    
                if event_date == date_to_check:
                    available_events.append(event)
            except (AttributeError, TypeError) as e:
                self.logger.error(f"Error checking event date: {e}, event: {event}")
                continue
                
        self.logger.info(f"Found {len(available_events)} events for date {date_to_check}")
        if available_events:
            self.logger.info(f"Available events for {date_to_check}: {available_events}")
        return bool(available_events)

class CustomCalendar(Calendar):
    def _init_views(self) -> dict[CalendarScope, CalendarScopeView]:
        return {
            CalendarScope.DAYS: CustomCalendarDaysView(
                self._item_callback_data,
                self.config,
            ),
            CalendarScope.MONTHS: CalendarMonthView(
                self._item_callback_data,
                self.config,
            ),
            CalendarScope.YEARS: CalendarYearsView(
                self._item_callback_data,
                self.config,
            ),
        }

    async def _get_user_config(
            self,
            data: dict,
            manager: DialogManager,
    ) -> CalendarUserConfig:
        self.logger = logging.getLogger(__name__)
        events = data.get("events", [])
        self.logger.info(f"Getting user config with {len(events)} events")
        self.logger.info(f"Events data in config: {events}")
        
        min_date = datetime.now().date()
        max_date = max(
            (event["datetime"].date() for event in events),
            default=min_date
        )
        self.logger.info(f"Calendar date range: {min_date} to {max_date}")
        
        return CalendarUserConfig(
            firstweekday=1,  # Понедельник - первый день недели
            min_date=min_date,  # Минимальная дата - сегодня
            max_date=max_date,  # Максимальная дата - последняя доступная дата
        )


# Геттеры для окон
async def get_main_menu_data(dialog_manager: DialogManager, **kwargs):
    return {
        "volunteer_id": dialog_manager.event.from_user.id
    }

async def get_profile_data(dialog_manager: DialogManager, **kwargs):
    volunteer_service = VolunteerService()
    volunteer = await volunteer_service.get_volunteer(dialog_manager.event.from_user.id)
    return {
        "volunteer": volunteer
    }

async def get_services_data(dialog_manager: DialogManager, **kwargs):
    booking_service = BookingService()
    client_id = dialog_manager.dialog_data.get("client_id")
    page = dialog_manager.dialog_data.get("service_page", 1)
    
    logger.info(f"Getting services data for client_id={client_id}, page={page}")
    
    services_data = await booking_service.get_available_services(client_id, page=page)
    logger.info(f"Received services data: {services_data}")
    
    # Преобразуем объекты Service в словари для Select виджета
    services = []
    for service in services_data.get("services", []):
        service_dict = {
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "duration": service.duration,
            "capacity": service.capacity,
            "price": service.price
        }
        services.append(service_dict)
        logger.info(f"Created service dict: {service_dict}")
    
    # Сохраняем список услуг в dialog_data
    dialog_manager.dialog_data["services"] = services
    
    result = {
        "services": services,
        "current_page": page,
        "total_pages": services_data.get("total_pages", 1)
    }
    logger.info(f"Returning services data: {result}")
    return result

async def get_events_data(dialog_manager: DialogManager, **kwargs):
    booking_service = BookingService()
    service_id = dialog_manager.dialog_data.get("service_id")
    page = dialog_manager.dialog_data.get("event_page", 1)
    
    logger.info(f"Getting events data for service_id={service_id}, page={page}")
    
    events_data = await booking_service.get_service_events(service_id, page=page)
    logger.info(f"Received events data: {events_data}")
    
    # Преобразуем объекты Event в словари для Select виджета
    events = []
    for event in events_data.get("items", []):
        event_dict = {
            "id": event.id,
            "datetime": event.datetime,
            "service_id": event.service_id,
            "service_name": event.service_name,
            "capacity": event.capacity,
            "participants_count": event.participants_count
        }
        events.append(event_dict)
        logger.info(f"Created event dict: {event_dict}")
    
    # Группируем события по датам
    events_by_date = {}
    for event in events:
        date_key = event["datetime"].date()
        if date_key not in events_by_date:
            events_by_date[date_key] = []
        events_by_date[date_key].append(event)
    
    # Сохраняем события в dialog_data
    dialog_manager.dialog_data["events"] = events
    dialog_manager.dialog_data["events_by_date"] = events_by_date
    
    # Получаем выбранную дату
    selected_date = dialog_manager.dialog_data.get("selected_date")
    
    # Если дата выбрана, фильтруем события только для этой даты
    if selected_date:
        # Проверяем, является ли selected_date строкой или объектом date
        if isinstance(selected_date, str):
            selected_date = datetime.fromisoformat(selected_date).date()
        filtered_events = events_by_date.get(selected_date, [])
    else:
        filtered_events = events
    
    result = {
        "events": filtered_events,
        "current_page": page,
        "total_pages": events_data.get("total_pages", 1),
        "selected_date": dialog_manager.dialog_data.get("selected_date", ""),
        "service_name": dialog_manager.dialog_data.get("service_name", ""),
        "event_time": dialog_manager.dialog_data.get("event_time", "")
    }
    logger.info(f"Returning events data: {result}")
    return result

# Обработчики кнопок
async def on_profile_click(callback, button, manager: DialogManager):
    await manager.switch_to(MainMenu.profile)

async def on_back_to_main(callback, button, manager: DialogManager):
    await manager.switch_to(MainMenu.main)

async def on_service_selected(callback, button, manager: DialogManager, item):
    logger.info(f"Service selected: item={item}")
    
    # Получаем ID из callback.data (формат: "services:15")
    service_id = int(callback.data.split(":")[1])
    
    # Получаем данные услуги из dialog_data
    services = manager.dialog_data.get("services", [])
    service = next((s for s in services if s["id"] == service_id), None)
    
    if service:
        service_name = service["name"]
        logger.info(f"Found service: id={service_id}, name={service_name}")
        
        # Сохраняем данные в dialog_data
        manager.dialog_data["service_id"] = service_id
        manager.dialog_data["service_name"] = service_name
        
        await manager.switch_to(MainMenu.select_date)
    else:
        logger.error(f"Service not found: id={service_id}")
        await callback.message.answer("❌ Произошла ошибка при выборе услуги")

async def on_date_selected(callback, button, manager: DialogManager, item):
    selected_date = item
    logger.info(f"Date selected: {selected_date}")
    
    manager.dialog_data["selected_date"] = selected_date
    await manager.switch_to(MainMenu.select_time)

async def on_time_selected(callback, button, manager: DialogManager, item):
    logger.info(f"Time selected: item={item}")
    
    # Получаем ID из callback.data (формат: "times:15")
    event_id = int(callback.data.split(":")[1])
    
    # Получаем данные события из dialog_data
    events = manager.dialog_data.get("events", [])
    event = next((e for e in events if e["id"] == event_id), None)
    
    if event:
        event_time = event["datetime"]
        logger.info(f"Found event: id={event_id}, time={event_time}")
        
        manager.dialog_data["event_id"] = event_id
        manager.dialog_data["event_time"] = event_time
        
        await manager.switch_to(MainMenu.confirm_booking)
    else:
        logger.error(f"Event not found: id={event_id}")
        await callback.message.answer("❌ Произошла ошибка при выборе времени")

async def on_confirm_booking(callback, button, manager: DialogManager):
    booking_service = BookingService()
    event_id = manager.dialog_data["event_id"]
    client_id = manager.dialog_data["client_id"]
    volunteer_id = manager.event.from_user.id
    
    logger.info(f"Confirming booking: event_id={event_id}, client_id={client_id}, volunteer_id={volunteer_id}")
    
    success = await booking_service.book_event(
        event_id=event_id,
        participant_id=client_id,
        volunteer_id=volunteer_id
    )
    
    if not success:
        await callback.message.answer("❌ Произошла ошибка при создании записи")
    
    await manager.switch_to(MainMenu.main)

async def process_new_client_result(start_data, result, manager: DialogManager):
    """Обработчик результата создания нового клиента"""
    if result:
        manager.dialog_data["client_id"] = result["client_id"]
        await manager.switch_to(MainMenu.select_service)

# Главное меню
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

# Профиль волонтера
profile_window = Window(
    Format("👤 Профиль волонтера\n\n"
           "Имя: {volunteer[first_name]}\n"
           "Отчество: {volunteer[middle_name]}\n"
           "Фамилия: {volunteer[last_name]}"),
    Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
    state=MainMenu.profile,
    getter=get_profile_data
)

# Выбор услуги
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
        Button(Const("▶️ Вперед"), id="next", on_click=lambda c, b, m: m.switch_to(MainMenu.select_service))
    ),
    state=MainMenu.select_service,
    getter=get_services_data
)

# Выбор даты
select_date_window = Window(
    Format("Выберите дату для услуги {service_name}:"),
    CustomCalendar(
        id="calendar",
        on_click=on_date_selected
    ),
    Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
    state=MainMenu.select_date,
    getter=get_events_data
)

# Выбор времени
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
        Button(Const("◀️ Назад"), id="back", on_click=on_back_to_main),
        Button(Const("▶️ Вперед"), id="next", on_click=lambda c, b, m: m.switch_to(MainMenu.select_time))
    ),
    state=MainMenu.select_time,
    getter=get_events_data
)

# Подтверждение записи
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

# Создаем диалог
menu_dialog = Dialog(
    main_menu,
    profile_window,
    select_service_window,
    select_date_window,
    select_time_window,
    confirm_booking_window,
    on_process_result=process_new_client_result
) 