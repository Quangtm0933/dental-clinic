<?php
namespace App\Models;
use App\Config\Database;

class User {
    public static function login($username, $password) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        return $stmt->fetch();
    }
}