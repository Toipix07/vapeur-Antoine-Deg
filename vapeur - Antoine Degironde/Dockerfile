FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN chmod +x start.sh

ENTRYPOINT ["sh", "./start.sh"]
