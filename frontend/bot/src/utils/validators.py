from datetime import datetime
from typing import Tuple, Optional


def validate_full_name(full_name: str) -> Tuple[bool, Optional[str], Optional[Tuple[str, str, str]]]:
    """
    Валидация ФИО
    Возвращает: (is_valid, error_message, (first_name, middle_name, last_name))
    """
    parts = full_name.strip().split()
    
    if len(parts) != 3:
        return False, "ФИО должно состоять из трех слов (Имя Отчество Фамилия)", None
    
    first_name, middle_name, last_name = parts
    
    # Проверка на минимальную длину
    if len(first_name) < 2 or len(middle_name) < 2 or len(last_name) < 2:
        return False, "Каждое слово в ФИО должно содержать минимум 2 буквы", None
    
    # Проверка на наличие только букв
    if not all(part.isalpha() for part in parts):
        return False, "ФИО должно содержать только буквы", None
    
    return True, None, (first_name, middle_name, last_name)


def validate_birth_date(date_str: str) -> Tuple[bool, Optional[str], Optional[datetime]]:
    """
    Валидация даты рождения
    Возвращает: (is_valid, error_message, datetime_object)
    """
    try:
        # Пробуем разные форматы даты
        formats = ["%d.%m.%Y", "%d-%m-%Y", "%Y-%m-%d"]
        date_obj = None
        
        for fmt in formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                break
            except ValueError:
                continue
        
        if date_obj is None:
            return False, "Неверный формат даты. Используйте формат ДД.ММ.ГГГГ", None
        
        # Проверка на возраст (например, не моложе 18 лет)
        min_age = 18
        max_age = 100
        age = (datetime.now() - date_obj).days / 365.25
        
        if age < min_age:
            return False, f"Возраст должен быть не менее {min_age} лет", None
        if age > max_age:
            return False, f"Возраст должен быть не более {max_age} лет", None
        
        return True, None, date_obj
        
    except Exception as e:
        return False, f"Ошибка при обработке даты: {str(e)}", None 