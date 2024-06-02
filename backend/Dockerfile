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