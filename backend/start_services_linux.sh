#!/bin/bash

# =============================================================================
# Setup and Configuration
# =============================================================================

# Exit on any error
set -e

# Colors for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Directory setup
SYSTEMD_DIR="/etc/systemd/system"
PROJECT_ROOT=$(cd .. && pwd)
BACKEND_DIR="${PROJECT_ROOT}/backend"
BIN_DIR="${BACKEND_DIR}/bin"

# Ensure we're in the backend directory
cd "${BACKEND_DIR}" || {
    print_error "Failed to change to backend directory"
    exit 1
}

# =============================================================================
# Service Definition
# =============================================================================

# Define all microservices
declare -A SERVICES=(
    ["schedule"]="cmd/schedule/main.go"
    ["services"]="cmd/services/main.go"
    ["events"]="cmd/events/main.go"
    ["volunteers"]="cmd/volunteers/main.go"
    ["clients"]="cmd/clients/main.go"
    ["auth"]="cmd/auth/main.go"
    ["api_gateway"]="cmd"
)

# =============================================================================
# Go Module Setup
# =============================================================================

setup_go_module() {
    local service_name=$1
    local service_dir="${BACKEND_DIR}/${service_name}"
    
    print_info "Setting up Go module for ${service_name}..."
    
    # Change to service directory
    cd "${service_dir}" || {
        print_error "Failed to change to ${service_name} directory"
        return 1
    }
    
    # Initialize go module if it doesn't exist
    if [ ! -f "go.mod" ]; then
        go mod init "github.com/Slava02/SaintDiego/backend/${service_name}" || {
            print_error "Failed to initialize go module for ${service_name}"
            return 1
        }
    fi
    
    # Update dependencies
    go mod tidy || {
        print_error "Failed to update dependencies for ${service_name}"
        return 1
    }
    
    print_success "Go module setup completed for ${service_name}"
    return 0
}

# =============================================================================
# Systemd Service Creation
# =============================================================================

create_systemd_service() {
    local service_name=$1
    local binary_path=$2
    local config_path=$3
    local service_file="${SYSTEMD_DIR}/${service_name}.service"
    
    print_info "Creating systemd service file for ${service_name}..."
    
    # Create service file
    sudo bash -c "cat > $service_file" << EOF
[Unit]
Description=${service_name} microservice
After=network.target

[Service]
Type=simple
User=$SUDO_USER
Group=$SUDO_USER
WorkingDirectory=${PROJECT_ROOT}
ExecStart=${binary_path} -config ${config_path}
Restart=on-failure
RestartSec=10
LimitNOFILE=1024

# Logging configuration
StandardOutput=append:${BACKEND_DIR}/${service_name}/${service_name}.log
StandardError=append:${BACKEND_DIR}/${service_name}/${service_name}.log

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable the service
    sudo systemctl enable "${service_name}.service" || {
        print_error "Failed to enable ${service_name} service"
        return 1
    }
    
    print_success "Created and enabled systemd service for ${service_name}"
    return 0
}

# =============================================================================
# Service Building
# =============================================================================

build_service() {
    local service_name=$1
    local main_path=$2
    local output_path=$3
    
    print_info "Building ${service_name} service..."
    
    # Ensure bin directory exists
    mkdir -p "$(dirname "${output_path}")" || {
        print_error "Failed to create bin directory for ${service_name}"
        return 1
    }
    
    # Setup Go module
    setup_go_module "${service_name}" || return 1
    
    # Build the service
    if [ "$service_name" == "api_gateway" ]; then
        cd "${BACKEND_DIR}/${service_name}/${main_path}" || return 1
        go build -o "${output_path}" || {
            print_error "Failed to build ${service_name}"
            return 1
        }
    else
        go build -o "${output_path}" "${main_path}" || {
            print_error "Failed to build ${service_name}"
            return 1
        }
    fi
    
    print_success "Successfully built ${service_name} service"
    return 0
}

# =============================================================================
# Service Deployment
# =============================================================================

deploy_service() {
    local service_name=$1
    local main_path=$2
    
    print_info "Deploying ${service_name} service..."
    
    # Set paths
    local binary_path="${BIN_DIR}/${service_name}"
    local config_path="${BACKEND_DIR}/${service_name}/configs/config.toml"
    
    # Build the service
    build_service "${service_name}" "${main_path}" "${binary_path}" || return 1
    
    # Create systemd service
    create_systemd_service "${service_name}" "${binary_path}" "${config_path}" || return 1
    
    # Reload systemd and restart service
    sudo systemctl daemon-reload || {
        print_error "Failed to reload systemd daemon"
        return 1
    }
    
    # Stop service if running
    if systemctl is-active --quiet "${service_name}.service"; then
        print_info "Stopping existing ${service_name} service..."
        sudo systemctl stop "${service_name}.service" || {
            print_error "Failed to stop ${service_name} service"
            return 1
        }
        sleep 2
    fi
    
    # Start service
    print_info "Starting ${service_name} service..."
    sudo systemctl start "${service_name}.service" || {
        print_error "Failed to start ${service_name} service"
        return 1
    }
    
    # Verify service is running
    sleep 2
    if systemctl is-active --quiet "${service_name}.service"; then
        print_success "${service_name} service deployed and started successfully"
        return 0
    else
        print_error "${service_name} service failed to start"
        print_info "Check logs with: sudo journalctl -u ${service_name}.service -n 50 --no-pager"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    print_info "Starting deployment of all microservices..."
    
    # Deploy each service
    for service_name in "${!SERVICES[@]}"; do
        print_info "===== Processing ${service_name} service ====="
        
        if deploy_service "${service_name}" "${SERVICES[$service_name]}"; then
            print_success "✓ ${service_name} service deployed successfully"
        else
            print_error "✗ ${service_name} service deployment failed"
            exit 1
        fi
        echo ""
    done
    
    print_success "All microservices have been deployed successfully!"
    print_info "You can use the following commands to manage services:"
    echo -e "  sudo systemctl status [service-name]    - Check status of a service"
    echo -e "  sudo systemctl restart [service-name]   - Restart a service"
    echo -e "  sudo systemctl stop [service-name]      - Stop a service"
    echo -e "  sudo systemctl start [service-name]     - Start a service"
    echo -e "  journalctl -u [service-name] -f         - View service logs"
    echo -e "  tail -f backend/[service-name]/[service-name].log  - View service log file"
}

# Run main function
main

exit 0
