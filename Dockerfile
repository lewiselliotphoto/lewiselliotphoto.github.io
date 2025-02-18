FROM node:22-alpine

WORKDIR /app

COPY lewiselliotphoto/ .
COPY entrypoint.sh .

CMD ["sh", "entrypoint.sh"]