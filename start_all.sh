#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функция для вывода цветных сообщений
print_message() {
    echo -e "${2}${1}${NC}"
}

# Функция для отображения заголовков шагов
print_step_header() {
    local step=$1
    local title=$2
    echo ""
    print_message "╔════════════════════════════════════════════════════════════╗" "${BLUE}"
    print_message "║ ЭТАП ${step}: ${title}" "${BLUE}"
    print_message "╚════════════════════════════════════════════════════════════╝" "${BLUE}"
}

# Функция для отображения статуса выполнения
print_status() {
    local status=$1
    local message=$2
    
    if [ $status -eq 0 ]; then
        print_message "✅ ${message}" "${GREEN}"
    else
        print_message "❌ ${message}" "${RED}"
        exit 1
    fi
}

# Функция для проверки доступности базы данных
check_db_availability() {
    local max_attempts=30
    local attempt=1
    local sleep_time=3
    
    while [ $attempt -le $max_attempts ]; do
        print_message "⏳ Проверка доступности базы данных (попытка $attempt/$max_attempts)..." "${YELLOW}"
        
        # Проверяем доступность MySQL через контейнер
        if docker exec -i mks-db mysql -u homeless -p12345ghJkbn -e "SELECT 1" &>/dev/null; then
            print_message "✅ База данных готова и доступна!" "${GREEN}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep $sleep_time
    done
    
    print_message "❌ База данных не стала доступной после $max_attempts попыток" "${RED}"
    return 1
}

# Устанавливаем текущую директорию как корень проекта
PROJECT_ROOT=$(pwd)

# ШАГ 1: Запуск базы данных
print_step_header "1" "Запуск контейнера с базой данных"
cd "$PROJECT_ROOT/db/local_db"
print_message "📁 Переход в директорию: $(pwd)" "${CYAN}"
print_message "🚀 Запуск контейнера с базой данных..." "${YELLOW}"
docker-compose down
docker-compose up -d
status=$?
print_status $status "База данных запущена"

# Ожидаем, пока база данных станет доступной
check_db_availability
db_ready=$?
print_status $db_ready "База данных инициализирована и готова к использованию"

# ШАГ 2: Выполнение миграций
print_step_header "2" "Миграция базы данных"
cd "$PROJECT_ROOT/db"
print_message "📁 Переход в директорию: $(pwd)" "${CYAN}"

print_message "🔄 Выполнение миграции init..." "${YELLOW}"
go run migrateCLI/migration.go migrate init
status_init=$?
print_status $status_init "Миграция init выполнена"

sleep 2

print_message "🔄 Выполнение миграции up..." "${YELLOW}"
go run migrateCLI/migration.go migrate up
status_up=$?
print_status $status_up "Миграция up выполнена"

# ШАГ 3: Сборка контейнеров бэкенда
print_step_header "3" "Сборка контейнеров бэкенда"
cd "$PROJECT_ROOT/backend"
print_message "📁 Переход в директорию: $(pwd)" "${CYAN}"
print_message "🏗️ Запуск процесса сборки..." "${YELLOW}"
bash build.sh
status=$?
print_status $status "Сборка контейнеров бэкенда завершена"

# ШАГ 4: Запуск бэкенда
print_step_header "4" "Запуск контейнеров бэкенда"
print_message "🚀 Запуск контейнеров бэкенда..." "${YELLOW}"
docker-compose down
docker-compose up -d
status=$?
print_status $status "Контейнеры бэкенда запущены"

# ШАГ 5: Сборка и запуск бота
print_step_header "5" "Сборка и запуск контейнера бота"
cd "$PROJECT_ROOT/frontend/bot"
print_message "📁 Переход в директорию: $(pwd)" "${CYAN}"
print_message "🏗️ Сборка контейнера бота..." "${YELLOW}"
docker-compose build
status_build=$?
print_status $status_build "Контейнер бота собран"

print_message "🚀 Запуск контейнера бота..." "${YELLOW}"
docker-compose down
docker-compose up -d
status_up=$?
print_status $status_up "Контейнер бота запущен"

# Финальное сообщение
echo ""
print_message "╔════════════════════════════════════════════════════════════╗" "${GREEN}"
print_message "║               ПРИЛОЖЕНИЕ УСПЕШНО ЗАПУЩЕНО!                 ║" "${GREEN}"
print_message "╚════════════════════════════════════════════════════════════╝" "${GREEN}"
echo ""
print_message "Для просмотра логов контейнеров используйте:" "${CYAN}"
print_message "  • База данных:  docker logs db" "${CYAN}"
print_message "  • API Gateway:  docker logs api" "${CYAN}"
print_message "  • Бот:          docker logs saint_egidio_bot" "${CYAN}"
echo "" 