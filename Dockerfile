# Use an official Node.js runtime as a parent image
FROM node:22.4

# Set the working directory inside the container
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy your app to the working directory
COPY Releases/Backend.cjs ./

# Expose port 5000 (if needed)
EXPOSE 5000

# Replace with your app start command
CMD ["node", "Backend.cjs"]
