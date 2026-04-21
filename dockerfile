FROM node:18
WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 3002
CMD ["yarn", "start"]
