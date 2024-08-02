# Use the specified Node.js version
FROM node:21.6.1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the specified npm version
RUN npm install -g npm@10.2.4

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Set environment variables
ENV VITE_API_URL=https://email-template-managment.co.uk
ENV VITE_MICROSOFT_CLIENT_ID=af90f0a4-f6d7-483e-880e-3d2671bb991d
ENV VITE_MICROSOFT_REDIRECT_URI=https://email-template-management-ui.netlify.app:5173/login
ENV VITE_LOGIN_URL=https://main--email-template-management.netlify.app/login

# Expose port 3000 if needed (adjust this if your app uses a different port)
EXPOSE 3000

# Define the command to run your build command
CMD ["npm", "run", "build"]