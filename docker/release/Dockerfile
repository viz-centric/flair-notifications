FROM node:8.16.0

LABEL maintainer="admin@vizcentric.com"
LABEL name="Vizcentric"

RUN apt-get -y update && \
    apt-get -y install net-tools && \
    apt-get -y install wget tar && \
    wget https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.3/wkhtmltox-0.12.3_linux-generic-amd64.tar.xz && \
    tar -xJvf wkhtmltox*.tar.xz && \
    mv wkhtmltox/bin/wkhtmlto* /usr/bin && \
    rm -rf wkhtmltox* && \
    apt-get -y clean

ADD https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.3.0/grpc_health_probe-linux-amd64 /bin/grpc_health_probe
COPY package*.json /flair-notifications/
COPY scripts/button.sh /flair-notifications/
COPY .sequelizerc /flair-notifications/
COPY certs/server.crt /flair-notifications/certs/certChainFile.crt
COPY certs/server.key /flair-notifications/certs/privateKeyFile.key
COPY certs/ca.crt /flair-notifications/certs/trustCertCollectionFile.crt

WORKDIR /flair-notifications/

RUN npm install --only=production

COPY app /flair-notifications/app/

VOLUME [ "/flair-notifications/images", "/flair-notifications/config","/flair-notifications/compressImages" ]

EXPOSE 8080

WORKDIR /flair-notifications/

RUN groupadd -g 999 flairuser && \
    useradd --shell /bin/bash --create-home --home /home/flairuser -r -u 999 -g flairuser flairuser

RUN chown -R flairuser:flairuser /flair-notifications
RUN chown -R flairuser:flairuser /usr/bin/wkhtmltoimage
RUN chmod -R 755 /flair-notifications
RUN chmod +x /bin/grpc_health_probe


USER flairuser

CMD [ "sh", "./button.sh" ]
