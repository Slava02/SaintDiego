import logging
from datetime import datetime, date
from aiogram_dialog.widgets.kbd.calendar_kbd import (
    CalendarDaysView,
    CalendarMonthView,
    CalendarYearsView,
    CalendarScope,
    CalendarScopeView,
    CalendarUserConfig,
    CalendarConfig,
    DialogManager,
    Calendar,
)
from aiogram_dialog.widgets.text import Format, Case

logger = logging.getLogger(__name__)

class CustomCalendarDaysView(CalendarDaysView):
    def __init__(self, callback_generator, config):
        super().__init__(
            callback_generator,
            date_text=Case(
                {
                    True: Format("✅{date:%d}"),
                    False: Format("{date:%d}"),
                },
                selector=self._is_date_available_selector,
            ),
            header_text=Format("> {date: %B %Y} <"),
        )
        self.logger = logging.getLogger(__name__)

    def _is_date_available_selector(self, data: dict, case: Case, manager: DialogManager) -> bool:
        """Called for each date, returns True/False for Case."""
        current_date = data["date"]
        dialog_data = manager.current_context().dialog_data
        self.logger.debug(f"Selector checking date: {current_date}, dialog_data keys: {dialog_data.keys()}")
        
        events = dialog_data.get("events", [])
        self.logger.debug(f"Events in dialog_data: {events}")
        
        is_available = self._is_date_available(current_date, events)
        self.logger.debug(f"Selector result for {current_date}: {is_available}")
        return is_available

    def _is_date_available(self, date_to_check: date, events: list) -> bool:
        """Checks if the date is available for booking (main logic)"""
        self.logger.info(f"_is_date_available checking date: {date_to_check}")
        
        if not events:
            self.logger.info("No events available")
            return False
        
        if date_to_check < datetime.now().date():
            self.logger.info(f"Date {date_to_check} is in the past")
            return False
        
        try:
            event_dates = []
            for event in events:
                try:
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
        
        available_events = []
        for event in events:
            try:
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
            firstweekday=1,  # Monday as first day of week
            min_date=min_date,  # Minimum date - today
            max_date=max_date,  # Maximum date - last available date
        ) 