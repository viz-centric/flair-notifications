FROM flairbi/flair-notification-dev

COPY package*.json /flair-notifications/

WORKDIR /flair-notifications/
RUN npm install