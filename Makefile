build:
 docker build -t tgbot .

run:
 docker run -d -p 8443:8443 --name tgbot --rm tgbot