#!/bin/bash

# start_services.sh - Script to deploy and start all backend microservices as systemd services
# This script should be run from the backend directory with sudo privileges

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Systemd directory
SYSTEMD_DIR="/etc/systemd/system"

# Get the absolute path to the project root (assuming we're in the backend folder)
PROJECT_ROOT=$(cd .. && pwd)
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Define all our services
SERVICES=(
    "schedule"
    "services"
    "events"
    "volunteers"
    "clients"
    "auth"
    "api_gateway"
)

# Function to create and configure a systemd service
create_systemd_service() {
    local service_name=$1
    local binary_path=$2
    local config_path=$3
    local service_file="${SYSTEMD_DIR}/${service_name}.service"
    
    echo -e "${BLUE}Creating systemd service file for ${service_name}...${NC}"
    
    # Create service file
    sudo bash -c "cat > $service_file" << EOF
[Unit]
Description=${service_name} microservice
After=network.target

[Service]
ExecStart=${binary_path} -config ${config_path}
WorkingDirectory=${PROJECT_ROOT}
Restart=on-failure
SyslogIdentifier=${service_name}

[Install]
WantedBy=multi-user.target
EOF
    echo -e "${GREEN}Created systemd service file: $service_file${NC}"

    # Enable the service
    sudo systemctl enable "${service_name}.service"
    echo -e "${GREEN}Enabled ${service_name} systemd service to restart automatically on machine boot${NC}"
}

# Function to build a service
build_service() {
    local service_name=$1
    local main_path=$2
    local output_path=$3
    
    echo -e "${BLUE}Building ${service_name} service...${NC}"
    
    # Ensure bin directory exists
    mkdir -p "$(dirname "${output_path}")"
    
    # For API Gateway which has a different structure
    if [ "$service_name" == "api_gateway" ]; then
        cd "${main_path}"
        go build -o "${output_path}"
        cd "${BACKEND_DIR}"
    else
        go build -o "${output_path}" "${main_path}"
    fi
    
    echo -e "${GREEN}Successfully built ${service_name} service at ${output_path}${NC}"
}

# Main execution
echo -e "${BLUE}Starting deployment of all microservices as systemd services...${NC}"

for service in "${SERVICES[@]}"; do
    echo -e "${YELLOW}===== Processing ${service} service =====${NC}"
    
    # Set paths based on service
    if [ "$service" == "api_gateway" ]; then
        binary_path="${BACKEND_DIR}/${service}/bin/${service}"
        main_path="${BACKEND_DIR}/${service}/cmd"
        config_path="${BACKEND_DIR}/${service}/configs/config.toml"
    else
        binary_path="${BACKEND_DIR}/${service}/bin/${service}"
        main_path="${BACKEND_DIR}/${service}/cmd/${service}/main.go"
        config_path="${BACKEND_DIR}/${service}/configs/config.toml"
    fi
    
    # Build the service
    build_service "$service" "$main_path" "$binary_path"
    
    # Create the systemd service
    create_systemd_service "$service" "$binary_path" "$config_path"
    
    # Restart the service
    echo -e "${BLUE}Restarting ${service} service...${NC}"
    sudo systemctl daemon-reload
    sudo systemctl restart "${service}.service"
    
    echo -e "${GREEN}✓ ${service} service deployed and started successfully${NC}"
    echo ""
done

echo -e "${GREEN}All microservices have been deployed and started as systemd services!${NC}"
echo -e "${YELLOW}You can use the following commands to manage services:${NC}"
echo -e "  sudo systemctl status [service-name]    - Check status of a service"
echo -e "  sudo systemctl restart [service-name]   - Restart a service"
echo -e "  sudo systemctl stop [service-name]      - Stop a service"
echo -e "  sudo systemctl start [service-name]     - Start a service"
echo -e "  journalctl -u [service-name] -f         - View service logs"

exit 0
