<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Doctor {
    public static function getAll() {
        $db = Database::getConnection();
        return $db->query("SELECT * FROM doctors ORDER BY id DESC")->fetchAll();
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM doctors WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create($data) {
        $db = Database::getConnection();
        $sql = "INSERT INTO doctors (full_name, specialty, phone, email, description) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        return $stmt->execute([
            $data['full_name'],
            $data['specialty'],
            $data['phone'],
            $data['email'],
            $data['description']
        ]);
    }

    public static function update($id, $data) {
        $db = Database::getConnection();
        $sql = "UPDATE doctors SET full_name=?, specialty=?, phone=?, email=?, description=? WHERE id=?";
        $stmt = $db->prepare($sql);
        return $stmt->execute([
            $data['full_name'],
            $data['specialty'],
            $data['phone'],
            $data['email'],
            $data['description'],
            $id
        ]);
    }

    public static function delete($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM doctors WHERE id = ?");
        return $stmt->execute([$id]);
    }
}