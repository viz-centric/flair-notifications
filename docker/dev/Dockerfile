FROM flairbi/flair-notification-dev

ARG git_author_name
ARG git_author_email
ARG token

COPY / /flair-notifications/

COPY docker/dev/configure.sh /
RUN ./configure.sh


WORKDIR /flair-notifications/
RUN npm install
RUN npm rebuild