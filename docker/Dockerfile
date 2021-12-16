FROM node:15.12

USER root
RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g @remix-project/remixd

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/\@remix-project/remixd/websocket.js

COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/

EXPOSE 65520
ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]
