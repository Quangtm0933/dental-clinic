<?php
namespace App\Models;

use App\Config\Database;

class Patient {

    // Lấy danh sách
    public static function getAll() {
        return Database::getConnection()
            ->query("SELECT * FROM patients ORDER BY id DESC")
            ->fetchAll();
    }

    // Lấy 1 bệnh nhân theo ID
    public static function find($id) {
        $stmt = Database::getConnection()
            ->prepare("SELECT * FROM patients WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Tạo mới
    public static function create($data) {
        $sql = "INSERT INTO patients (full_name, phone, dob, address, medical_history) 
                VALUES (?, ?, ?, ?, ?)";
        
        return Database::getConnection()
            ->prepare($sql)
            ->execute([
                $data['full_name'],
                $data['phone'],
                $data['dob'] ?? null,
                $data['address'] ?? null,
                $data['medical_history'] ?? null
            ]);
    }

    // Cập nhật
    public static function update($id, $data) {
        $sql = "UPDATE patients 
                SET full_name = ?, phone = ?, dob = ?, address = ?, medical_history = ?
                WHERE id = ?";

        return Database::getConnection()
            ->prepare($sql)
            ->execute([
                $data['full_name'],
                $data['phone'],
                $data['dob'] ?? null,
                $data['address'] ?? null,
                $data['medical_history'] ?? null,
                $id
            ]);
    }

    // Xóa
    public static function delete($id) {
        return Database::getConnection()
            ->prepare("DELETE FROM patients WHERE id = ?")
            ->execute([$id]);
    }
}