FROM node:18-alpine

WORKDIR /app

# Copy package files first to cache layers
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Start server (using npm run dev to enable nodemon hot-reloading)
CMD ["npm", "run", "dev"]
