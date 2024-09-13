# Use a more recent Node.js LTS version
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Use the default npm registry (comment out if you specifically need a different one)
# RUN npm config set registry https://registry.npmjs.org/

# Install dependencies with a timeout and retry mechanism
RUN npm install --verbose --fetch-retries=5 --fetch-retry-factor=2 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000 || (sleep 10 && npm install --verbose)

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a multi-stage build to reduce final image size
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the previous stage
COPY --from=0 /app/build ./build

# Install serve
RUN npm install -g serve

# Set the command to run the HTTP server
CMD ["serve", "-s", "build", "-l", "3000"]

# Expose port 3000
EXPOSE 3000