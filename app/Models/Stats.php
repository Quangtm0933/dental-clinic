<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class Stats {
    // Lấy tổng doanh thu theo ngày thu tiền thực tế
    public static function getTotalRevenue($from, $to) {
        $db = Database::getConnection();
        $sql = "SELECT SUM(total_amount) FROM medical_records 
                WHERE DATE(payment_date) BETWEEN ? AND ? AND payment_status = 'PAID'";
        $stmt = $db->prepare($sql);
        $stmt->execute([$from, $to]);
        return $stmt->fetchColumn() ?: 0;
    }

    // Lấy tổng lượt khám
    public static function getTotalVisits($from, $to) {
        $db = Database::getConnection();
        $sql = "SELECT COUNT(*) FROM medical_records 
                WHERE DATE(payment_date) BETWEEN ? AND ? AND payment_status = 'PAID'";
        $stmt = $db->prepare($sql);
        $stmt->execute([$from, $to]);
        return $stmt->fetchColumn() ?: 0;
    }

    // Lấy danh sách lịch sử hóa đơn (Để hiện vào bảng Lịch sử)
    public static function getHistory() {
        $db = Database::getConnection();
        $sql = "SELECT m.*, p.full_name as patient_name, u.full_name as staff_name 
                FROM medical_records m
                JOIN patients p ON m.patient_id = p.id
                LEFT JOIN users u ON m.staff_id = u.id
                WHERE m.payment_status = 'PAID'
                ORDER BY m.payment_date DESC";
        return $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    // Dữ liệu biểu đồ hàng ngày (Nếu sau này bạn muốn vẽ biểu đồ)
    public static function getDailyRevenue($from, $to) {
        $db = Database::getConnection();
        $sql = "SELECT DATE(payment_date) as day, COUNT(*) as count, SUM(total_amount) as revenue 
                FROM medical_records 
                WHERE DATE(payment_date) BETWEEN ? AND ? AND payment_status = 'PAID' 
                GROUP BY DATE(payment_date) 
                ORDER BY day ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$from, $to]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}