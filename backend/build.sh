#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to show progress bar
show_progress() {
    local current=$1
    local total=$2
    local service=$3
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    # Clear the current line
    printf "\r\033[K"
    
    # Print progress bar with service name
    printf "["
    printf "%${completed}s" | tr " " "█"
    printf "%${remaining}s" | tr " " "░"
    printf "] %d%% Building %s service..." $percentage "$service"
}

# Function to build a service
build_service() {
    local service=$1
    local current=$2
    local total=$3
    
    show_progress $current $total "$service"
    
    if docker-compose build $service > /dev/null 2>&1; then
        # Clear the current line
        printf "\r\033[K"
        print_message "✅ $service service built successfully" "${GREEN}"
    else
        # Clear the current line
        printf "\r\033[K"
        print_message "❌ Failed to build $service service" "${RED}"
        exit 1
    fi
}

# Main build process
print_message "Starting build process..." "${YELLOW}"

# List of services to build
services=("api_gateway" "schedule" "services" "events" "auth" "clients" "volunteers")
total_services=${#services[@]}

# Build each service separately
for i in "${!services[@]}"; do
    build_service "${services[$i]}" $((i + 1)) $total_services
done

print_message "All services built successfully! 🎉" "${GREEN}" 