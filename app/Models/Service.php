<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Service {
    /**
     * Chức năng: Lấy toàn bộ danh sách dịch vụ hiện có.
     * Sắp xếp: ID giảm dần (Dịch vụ mới nhất hiện lên đầu).
     */
    public static function getAll() {
        return Database::getConnection()->query("SELECT * FROM services ORDER BY id DESC")->fetchAll();
    }

    /**
     * Chức năng: Tìm một dịch vụ cụ thể dựa trên ID.
     * Trả về: Mảng thông tin dịch vụ hoặc false nếu không thấy.
     */
    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    /**
     * Chức năng: Lấy đơn giá chuẩn từ Database.
     * Mục đích: Dùng để tính tiền ở Backend, tránh việc người dùng sửa giá ở giao diện.
     */
    public static function getPriceById($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT unit_price FROM services WHERE id = ?");
        $stmt->execute([$id]);
        $price = $stmt->fetchColumn();
        // Ép kiểu về float (số thập phân) để tính toán tiền chính xác
        return $price !== false ? (float)$price : 0.0;
    }

    /**
     * Chức năng: Lưu dịch vụ mới vào hệ thống.
     * Ràng buộc: Nếu không truyền is_active, mặc định sẽ là 1 (đang hoạt động).
     */
    public static function create($data) {
        $db = Database::getConnection();
        $sql = "INSERT INTO services (service_name, unit_price, description, is_active) VALUES (?, ?, ?, ?)";
        return $db->prepare($sql)->execute([
            $data['service_name'],
            $data['unit_price'],
            $data['description'] ?? '',
            $data['is_active'] ?? 1
        ]);
    }

    /**
     * Chức năng: Cập nhật thông tin dịch vụ đang có.
     */
    public static function update($id, $data) {
        $db = Database::getConnection();
        $sql = "UPDATE services SET service_name=?, unit_price=?, description=?, is_active=? WHERE id=?";
        return $db->prepare($sql)->execute([
            $data['service_name'],
            $data['unit_price'],
            $data['description'],
            $data['is_active'],
            $id
        ]);
    }

    /**
     * Chức năng: Xóa dịch vụ khỏi Database theo ID.
     */
    public static function delete($id) {
        $db = Database::getConnection();
        return $db->prepare("DELETE FROM services WHERE id = ?")->execute([$id]);
    }
}