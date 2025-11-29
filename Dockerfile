# Use official Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy project files
COPY . .

# Expose backend port (change if your app uses another)
EXPOSE 3000

# Run the app in production
CMD ["node", "main.js"]
