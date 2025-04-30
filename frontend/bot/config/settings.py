from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Токен бота
    bot_token: SecretStr

    # Токен API
    api_token: SecretStr

    # URL API
    api_url: str

    # ID чата волонтеров
    volunteers_chat_id: int

    # Настройки для загрузки переменных окружения
    model_config = SettingsConfigDict(
        # env_file=".env",  # Убрали явное указание файла
        env_file_encoding="utf-8",
        extra="allow",  # Разрешаем дополнительные поля
        env_prefix="",  # Без префикса для переменных окружения
        validate_default=True,  # Валидируем значения по умолчанию
    )


# Создаем экземпляр настроек
config = Settings()