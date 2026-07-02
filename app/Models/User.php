<?php
namespace App\Models;
use App\Config\Database;
use PDO;

class User {
    // 1. Hàm login: So sánh trực tiếp bằng dấu ==
public static function login($username, $password) {
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND password = ?"); // So sánh cả pass ở đây
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC); //lấy 1 dòng dữ liệu và trả về dạng mảng key => value

    if ($user) {
        unset($user['password']); // xóa password trước khi trả về fronted 
        return $user;
    }
    return null;
}

    // 2. Lấy danh sách kèm tìm kiếm
    public static function getAll($keyword = "") {
        $db = Database::getConnection();
        $sql = "SELECT id, username, full_name, role, created_at FROM users";
        if ($keyword) {
            $sql .= " WHERE full_name LIKE ? OR username LIKE ?";
            $stmt = $db->prepare($sql);
            $stmt->execute(["%$keyword%", "%$keyword%"]);
        } else {
            $stmt = $db->query($sql);
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. Lấy chi tiết
    public static function getById($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id, username, full_name, role FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 2. Hàm create: Lưu thẳng mật khẩu
public static function create($data) {
    $db = Database::getConnection();
    $stmt = $db->prepare("INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)");
    return $stmt->execute([
        $data['username'],
        $data['password'], 
        $data['full_name'],
        $data['role']
    ]);
}

    // 3. Hàm update: Cũng lưu thẳng mật khẩu
public static function update($id, $data) {
    $db = Database::getConnection();
    $sql = "UPDATE users SET full_name = ?, role = ?";
    $params = [$data['full_name'], $data['role']];

    if (!empty($data['password'])) {
        $sql .= ", password = ?";
        $params[] = $data['password']; 
    }

    $sql .= " WHERE id = ?"; //UPDATE users SET full_name=?, role=?, password=? WHERE id=5
    $params[] = $id;

    $stmt = $db->prepare($sql);
    return $stmt->execute($params);
}

    // 6. Xóa
    public static function delete($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }
}