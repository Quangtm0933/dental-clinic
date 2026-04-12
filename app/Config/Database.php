<?php
namespace App\Config;
use PDO;
use PDOException;

class Database {
    private static $conn = null;
    public static function getConnection() {
        if (self::$conn === null) {
            try {
                self::$conn = new PDO("mysql:host=localhost;dbname=dental_clinic;charset=utf8mb4", "root", "");
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                die(json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL"]));
            }
        }
        return self::$conn;
    }
}