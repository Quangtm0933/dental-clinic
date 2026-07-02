<?php
namespace App\Config;
use PDO;
use PDOException;

class Database {
    private static $conn = null;
    public static function getConnection() {
        if (self::$conn === null) {
            try {
                // Đã sửa lại host, dbname và password theo đúng cấu hình docker-compose.yml
                self::$conn = new PDO("mysql:host=db;dbname=dental_clinic;charset=utf8mb4", "root", "rootpassword");
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // Thêm $e->getMessage() để nếu có lỗi sẽ báo rõ ràng lý do hơn
                die(json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL: " . $e->getMessage()]));
            }
        }
        return self::$conn;
    }
}