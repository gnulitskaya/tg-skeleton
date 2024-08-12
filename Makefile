build:
	docker build -t tgbot .
run:
	docker run -d -p 443:443 --name tgbot --rm tgbot