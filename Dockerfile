FROM php:apache

# Cài đặt extension PDO MySQL để PHP kết nối được với Database
RUN docker-php-ext-install pdo pdo_mysql

# Bật module rewrite của Apache
RUN a2enmod rewrite

# Copy toàn bộ source code vào thư mục web của Apache
COPY . /var/www/html/

# Cấp quyền cho thư mục web
RUN chown -R www-data:www-data /var/www/html