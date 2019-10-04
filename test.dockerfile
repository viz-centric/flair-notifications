FROM flairbi/flair-notification-dev

ARG ssh_prv_key
ARG ssh_pub_key

COPY package*.json /flair-notifications/

# Add the keys and set permissions
RUN mkdir /root/.ssh && \
    echo "$ssh_prv_key" > /root/.ssh/id_rsa && \
    echo "$ssh_pub_key" > /root/.ssh/id_rsa.pub && \
    chmod 600 /root/.ssh/id_rsa && \
    chmod 600 /root/.ssh/id_rsa.pub

WORKDIR /flair-notifications/
RUN npm install