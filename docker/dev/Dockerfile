FROM flairbi/flair-notification-dev

ARG ssh_prv_key
ARG ssh_pub_key

COPY / /flair-notifications/

# Authorize SSH Host
# Add the keys and set permissions
RUN apt-get update && \
    apt-get install -y \
        git \
        openssh-server && \
    mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    ssh-keyscan github.com > /root/.ssh/known_hosts && \
    echo "$ssh_prv_key" > /root/.ssh/id_rsa && \
    echo "$ssh_pub_key" > /root/.ssh/id_rsa.pub && \
    echo "Host github.com \nUser git \nPort 22\n Hostname github.com\n IdentityFile /root/.ssh/id_rsa\n TCPKeepAlive yes\n IdentitiesOnly yes" > /root/.ssh/config && \
    chmod 600 /root/.ssh/id_rsa && \
    chmod 600 /root/.ssh/id_rsa.pub && \
    git config --global user.email "admin@vizcentric.com" && \
    git config --global user.name "admin-vizcentric"

WORKDIR /flair-notifications/
RUN npm install