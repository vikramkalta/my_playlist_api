FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

ADD . /usr/src/app

RUN npm run tsc

ENV NODE_ENV staging

EXPOSE 3002

RUN npm install pm2 -g
# CMD ["npm","start"]
CMD ["pm2-runtime", "dist/app.js"]