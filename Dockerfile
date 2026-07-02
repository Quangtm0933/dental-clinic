FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite headers

WORKDIR /var/www/html

COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY . .
COPY --from=vendor /app/vendor ./vendor

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80