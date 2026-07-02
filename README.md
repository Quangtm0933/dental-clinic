# Dental Clinic

Ung dung quan ly phong kham nha khoa bang PHP, MySQL va Docker.

## Chay tren Ubuntu VM bang Docker

1. Cai Docker va Docker Compose plugin:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Dang xuat va dang nhap lai Ubuntu de nhom `docker` co hieu luc.

2. Lay source ve may ao:

```bash
git clone https://github.com/Quangtm0933/dental-clinic.git
cd dental-clinic
```

3. Tao file cau hinh moi truong:

```bash
cp .env.example .env
```

4. Build va chay container:

```bash
docker compose up -d --build
```

5. Mo trinh duyet:

```text
http://localhost:8080/dental-clinic/public/
```

Neu truy cap tu may that vao may ao, thay `localhost` bang IP cua Ubuntu VM, vi du:

```text
http://192.168.56.101:8080/dental-clinic/public/
```

Neu Ubuntu bat firewall, mo cong 8080:

```bash
sudo ufw allow 8080/tcp
```

## Tai khoan dang nhap mac dinh

```text
admin / admin123
doctor / doctor123
staff / staff123
```

## Lenh Docker hay dung

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f db
docker compose down
docker compose down -v
```

`docker compose down -v` se xoa luon du lieu MySQL trong volume. Chi dung khi muon tao lai database tu dau.

## Push len Git

```bash
git add .
git commit -m "Add Docker setup"
git push origin main
```