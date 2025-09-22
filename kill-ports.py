#!/usr/bin/env python3
"""
Kill processes using specific ports on Windows/Linux/Mac
Usage: python kill-ports.py
"""

import os
import sys
import platform
import subprocess
import re

DEFAULT_PORTS = [3000, 4000, 4001]

def is_windows():
    return platform.system() == 'Windows'

def is_mac():
    return platform.system() == 'Darwin'

def is_linux():
    return platform.system() == 'Linux'

def find_process_windows(port):
    """Find process using a port on Windows"""
    try:
        # Run netstat command
        result = subprocess.run(
            ['netstat', '-ano'],
            capture_output=True,
            text=True,
            check=True
        )

        # Parse output to find PID
        lines = result.stdout.split('\n')
        pattern = rf'.*:{port}\s+.*LISTENING\s+(\d+)'

        for line in lines:
            match = re.search(pattern, line)
            if match:
                return int(match.group(1))

    except subprocess.CalledProcessError:
        pass

    return None

def find_process_unix(port):
    """Find process using a port on Unix-like systems"""
    try:
        if is_mac():
            # Use lsof on macOS
            result = subprocess.run(
                ['lsof', '-ti', f':{port}'],
                capture_output=True,
                text=True,
                check=True
            )
        else:
            # Use ss on Linux
            result = subprocess.run(
                ['ss', '-lptn', f'sport = :{port}'],
                capture_output=True,
                text=True,
                check=True
            )

            # Parse ss output
            lines = result.stdout.split('\n')
            for line in lines:
                if f':{port}' in line:
                    # Extract PID from the line
                    match = re.search(r'pid=(\d+)', line)
                    if match:
                        return int(match.group(1))
            return None

        pids = result.stdout.strip().split('\n')
        return int(pids[0]) if pids and pids[0] else None

    except (subprocess.CalledProcessError, ValueError):
        # Try fallback with netstat
        try:
            result = subprocess.run(
                ['netstat', '-tlnp'],
                capture_output=True,
                text=True,
                check=True
            )

            pattern = rf'.*:{port}\s+.*LISTEN\s+(\d+)'
            for line in result.stdout.split('\n'):
                match = re.search(pattern, line)
                if match:
                    return int(match.group(1))

        except subprocess.CalledProcessError:
            pass

    return None

def kill_process(pid):
    """Kill a process by PID"""
    try:
        if is_windows():
            subprocess.run(
                ['taskkill', '/PID', str(pid), '/F'],
                capture_output=True,
                check=True
            )
        else:
            subprocess.run(
                ['kill', '-9', str(pid)],
                capture_output=True,
                check=True
            )
        return True
    except subprocess.CalledProcessError:
        return False

def get_process_name(pid):
    """Get process name by PID"""
    try:
        if is_windows():
            result = subprocess.run(
                ['tasklist', '/FI', f'PID eq {pid}', '/FO', 'CSV', '/NH'],
                capture_output=True,
                text=True,
                check=True
            )
            # Parse CSV output
            if result.stdout:
                parts = result.stdout.strip().split(',')
                if len(parts) > 0:
                    return parts[0].strip('"')
        else:
            result = subprocess.run(
                ['ps', '-p', str(pid), '-o', 'comm='],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
    except subprocess.CalledProcessError:
        pass

    return "Unknown"

def main(ports=None):
    if ports is None:
        ports = DEFAULT_PORTS

    system = platform.system()
    print(f"Operating System: {system}")
    print(f"Checking ports: {', '.join(map(str, ports))}")
    print("-" * 50)

    for port in ports:
        print(f"\n🔍 Checking port {port}...")

        # Find process using the port
        if is_windows():
            pid = find_process_windows(port)
        else:
            pid = find_process_unix(port)

        if pid:
            process_name = get_process_name(pid)
            print(f"  ⚠️  Found process: {process_name} (PID: {pid})")

            # Kill the process
            if kill_process(pid):
                print(f"  ✅ Successfully killed process {pid}")
            else:
                print(f"  ❌ Failed to kill process {pid} (may need admin privileges)")
                if not is_windows():
                    print(f"     Try running with: sudo python {sys.argv[0]}")
        else:
            print(f"  ✅ Port {port} is free")

    print("\n✨ Done!")

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) > 1:
        try:
            custom_ports = [int(p) for p in sys.argv[1:]]
            main(custom_ports)
        except ValueError:
            print("Error: Invalid port number(s)")
            print(f"Usage: python {sys.argv[0]} [port1] [port2] ...")
            sys.exit(1)
    else:
        main()