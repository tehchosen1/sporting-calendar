FROM ghcr.io/puppeteer/puppeteer:22.14.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# List files after installation
RUN ls -R /usr/src/app > /usr/src/app/files_list.txt

COPY . .

CMD [ "sh", "-c", "ls -R /usr/src/app >> /usr/src/app/files_list.txt && node server.js" ]
