# Telegram Bot for Volunteer Registration

Бот для регистрации волонтеров и записи бездомных людей в центры социальной поддержки.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл .env в корневой директории проекта:
```
BOT_TOKEN=your_bot_token_here
API_URL=http://localhost:8080/v1
```

## Запуск

```bash
python src/bot.py
```

## Структура проекта

- `config/` - конфигурационные файлы
- `src/` - исходный код бота
  - `handlers/` - обработчики команд
  - `keyboards/` - клавиатуры и кнопки
  - `services/` - сервисный слой
  - `models/` - модели данных
  - `utils/` - вспомогательные функции
- `tests/` - тесты 