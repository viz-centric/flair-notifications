FROM node:8

RUN apt-get update && \
    apt-get install wget tar && \
    wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.3/wkhtmltox-0.12.3_linux-generic-amd64.tar.xz && \
    tar -xJvf wkhtmltox*.tar.xz && \
    mv wkhtmltox/bin/wkhtmlto* /usr/bin && \
    rm -rf wkhtmltox* && \
    apt-get clean

COPY package*.json /flair-notifications/
COPY scripts/button.sh /flair-notifications/
COPY .sequelizerc /flair-notifications/

WORKDIR /flair-notifications/

RUN npm install --only=production

ADD app /flair-notifications/app/

VOLUME [ "/flair-notifications/images", "/flair-notifications/config" ]

EXPOSE 8080

WORKDIR /flair-notifications/

CMD [ "sh", "./button.sh" ]
