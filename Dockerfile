# Используем базовый образ
FROM ubuntu:20.04

# Установка необходимых пакетов
RUN apt-get update && \
    apt-get install -y apache2 openssl

# Создание каталога для SSL-сертификатов
# RUN mkdir /etc/apache2/ssl

# Скрипт для создания самоподписанного сертификата
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/apache2/ssl/tgmini.key \
    -out /etc/apache2/ssl/tgmini.crt \
    -subj "/C=RU/ST=Region/L=City/O=Organization/OU=Unit/CN=localhost"

# Копирование конфигурации Apache
COPY tgmini.conf /etc/apache2/sites-available/tgmini.conf

# Включение модуля SSL и сайта
RUN a2enmod ssl && \
    a2ensite tgmini.conf

# Открытие порта 8443
EXPOSE 8443

# Запуск Apache в фоновом режиме
CMD ["apachectl", "-D", "FOREGROUND"]