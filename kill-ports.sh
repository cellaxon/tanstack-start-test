#!/bin/bash

# Kill processes using specific ports
# Usage: ./kill-ports.sh

# Default ports
PORTS=(3000 4000 4001)

# Override with command line arguments if provided
if [ $# -gt 0 ]; then
    PORTS=("$@")
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking and killing processes on ports: ${PORTS[@]}${NC}"
echo ""

for port in "${PORTS[@]}"; do
    echo -e "${CYAN}Checking port $port...${NC}"

    # Find process using the port (works on Linux and macOS)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        pid=$(lsof -ti:$port 2>/dev/null)
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        pid=$(lsof -ti:$port 2>/dev/null)
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash/Cygwin)
        pid=$(netstat -ano | grep ":$port " | grep "LISTENING" | awk '{print $5}' | sort -u)
    else
        echo -e "${RED}  × Unsupported OS: $OSTYPE${NC}"
        continue
    fi

    if [ ! -z "$pid" ]; then
        for process_id in $pid; do
            if [ "$process_id" != "0" ]; then
                # Get process name
                if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
                    process_name=$(ps -p $process_id -o comm= 2>/dev/null)
                else
                    # Windows
                    process_name=$(tasklist /FI "PID eq $process_id" 2>/dev/null | grep $process_id | awk '{print $1}')
                fi

                if [ ! -z "$process_name" ]; then
                    echo -e "${RED}  Found process: $process_name (PID: $process_id)${NC}"

                    # Kill the process
                    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
                        # Windows
                        taskkill //PID $process_id //F 2>/dev/null
                    else
                        # Linux/macOS
                        kill -9 $process_id 2>/dev/null
                    fi

                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}  ✓ Killed process $process_id on port $port${NC}"
                    else
                        echo -e "${RED}  × Failed to kill process $process_id${NC}"
                    fi
                fi
            fi
        done
    else
        echo -e "${GREEN}  ✓ Port $port is free${NC}"
    fi
done

echo ""
echo -e "${GREEN}Done!${NC}"