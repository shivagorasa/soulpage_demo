#!/bin/bash

# Update and upgrade the system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
sudo apt install nodejs npm -y

# Install Python and pip
sudo apt install python3 python3-pip -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker