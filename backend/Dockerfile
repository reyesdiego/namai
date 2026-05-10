# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Easypanel expects port 80 by default)
EXPOSE 80

# Make bootstrap script executable
RUN chmod +x bootstrap.sh

# Command to run the application via bootstrap script
CMD ["./bootstrap.sh"]
