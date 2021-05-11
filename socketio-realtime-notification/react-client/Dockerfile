FROM node:12.19-alpine

WORKDIR /app

COPY ./app/package.json /app

RUN yarn install

COPY ./app /app

CMD ["yarn", "start"]