# DevOps Intern Assignment

## Infrastructure as Code using Terraform
Create a Terraform template for creating [Ec2, Security group ] and also install docker and docker-compose using userdata method.


Create a folder called Terraform, where we store our main.tf and all other necessary files in our folder

Download keypair to the same folder

In the same folder create a userdata.sh

```
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

```

Create a Main.tf :

```
# main.tf

provider "aws" {
  region = "us-east-1"
  access_key = "*******" #your aws access key goes here
  secret_key = "*******" #your aws secret key goes here
}

resource "aws_instance" "prometheus_instance" {
  ami                    = "ami-04b70fa74e45c3917" 
  instance_type          = "t2.micro"
  key_name               = "terrafdrmkey"
  subnet_id              = "subnet-05b00f52b9e78f602"
  user_data              = "${file("userdata.sh")}"
  associate_public_ip_address = true

  tags = {
    Name = "Soulpage"
  }
}

resource "aws_security_group" "soulpage_sg" {
  name        = "soulpage_sg"
  description = "Security group for soulpage instance"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000 # django port
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
   ingress {
    from_port   = 3000 # nodejs port
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Add any other necessary ingress rules here

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

```

Use terraform plan > terraform apply will create ec2 instance with name prometheusinstance in us-east-1 region

Ec2 instance created from terraform scripts 

![!\[alt text\](image.png)](<terraform instance.png>)

In Frontend create a Docker file for frontend with following :

Frontend Dockerfile:

```
FROM node:18.19.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the Node.js application
CMD ["npm", "start"]
```


and similarly go to backend foler and create a backend Dockefile

backend Dockerfile as follows:

```
# Use the official Python image with Python 3.10 from the Docker Hub
FROM python:3.10

# Set environment variables to prevent Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

# Set environment variables for Django and other configurations
ENV DJANGO_SECRET_KEY=your_secret_key_here
ENV FRONTEND_URL=http://127.0.0.1:3000
ENV BACKEND_URL=http://127.0.0.1:8000
ENV BE_ADMIN_EMAIL=admin@admin.com
ENV BE_ADMIN_PASSWORD=admin
ENV OPENAI_API_TYPE=azure
ENV OPENAI_API_BASE=your_azure_endpoint
ENV OPENAI_API_VERSION=your_azure_api_version
ENV OPENAI_API_KEY=your_azure_api_key

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY dependencies.txt /app/

# Install dependencies including gunicorn
RUN pip install -r dependencies.txt gunicorn

# Copy the rest of the application code to the working directory
COPY . /app/

# Apply database migrations
RUN python manage.py migrate


# Run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
```

Now come back to main folder to install docker compose file to trigger both containers :

docker-copose.yaml as follows:
```
version: '3'

services:
  nextjs:
    build: /home/ubuntu/fullstack-assignment/frontend
    ports:
      - "3000:3000"

  django:
    build: /home/ubuntu/fullstack-assignment/backend
    ports:
      - "8000:8000"
```
Add our instance public ip address under Allowed hosts in ```settings.py``` file in  ```/home/ubuntu/fullstack-assignment/backend/backend``` directory

![!\[alt text\](image.png)](<allowed hosts.png>)


Then lets start our docker compose up to bring up containers :

![!\[alt text\](image.png)](containers.png)


## Frontend access:

![!\[alt text\](image.png)](frontend.png)

## Backend:

![!\[alt text\](image.png)](backend.png)

since we're not redirecting to any endpoints we juse see app works here.

# Challenges Faced:

* Django application docker file creation required and supported python 3.10 and I had to use support from google and chatGPT 

* accessing backend with docker was tough ones and in frontend was quite easy.

* changing instance state will alter host name so we need to create and pull images, for this install nano woth dockerfile so that you can make necessary changes and restart containers it'll work fine.


## For A CI/CD Pipeline (Couldnot implement but sharing a pipeline script)

with jenkins use following jenkins file 


```
pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_VERSION = '1.29.2'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/shivagorasa/soulpage_demo.git'
            }
        }
        
        stage('Build and Deploy') {
            steps {
                // Install Docker Compose
                script {
                    sh "sudo curl -L https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose"
                    sh 'sudo chmod +x /usr/local/bin/docker-compose'
                }
                
                // Run Docker Compose
                sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

### This Jenkins pipeline script:
* Defines a pipeline that runs on any available agent.
* Checks out the code from the GitHub repository.
* Installs Docker Compose with the specified version.
* Runs the Docker Compose file (docker-compose.yml) using docker-compose up -d.
* Provides post-build actions to print a success or failure message.**


Then create a webhook url with jenkins server address/github-webhook

If above pipeline works we can access our application on prescriberd ports with public ipv4 of our instacne