<?php
namespace App\Models;

use App\Config\Database;
use PDO;

class MedicalRecord {
    /**
     * Chức năng: Lấy danh sách bệnh nhân đã khám nhưng CHƯA thanh toán.
     * Liên kết: JOIN với bảng patients để lấy được tên hiển thị thay vì chỉ lấy ID.
     */
    public static function getUnpaid() {
        $db = Database::getConnection();
        $sql = "SELECT m.*, p.full_name as patient_name 
                FROM medical_records m
                JOIN patients p ON m.patient_id = p.id
                WHERE m.payment_status = 'UNPAID' 
                ORDER BY m.created_at ASC";
        return $db->query($sql)->fetchAll();
    }

    /**
     * Chức năng: Lấy danh sách các dịch vụ chi tiết của một hồ sơ.
     * Liên kết: JOIN với bảng services để biết tên dịch vụ đó là gì.
     */
    public static function getDetailsByRecord($recordId) {
    $db = Database::getConnection();
    $sql = "SELECT rd.*, s.service_name 
            FROM record_details rd
            JOIN services s ON rd.service_id = s.id
            WHERE rd.record_id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$recordId]);
    // Thêm PDO::FETCH_ASSOC để tránh dữ liệu bị lặp lại
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}

    /**
     * Chức năng: Hoàn tất quy trình thu tiền.
     * Cập nhật: Chuyển trạng thái sang PAID, lưu tổng tiền, ID người thu và thời điểm thu.
     */
   public static function completePayment($id, $total, $staffId) {
        $db = Database::getConnection();
        $sql = "UPDATE medical_records SET 
                total_amount = ?, 
                payment_status = 'PAID', 
                staff_id = ?, 
                payment_date = NOW() -- Lưu thời điểm thu tiền thực tế
                WHERE id = ?";
        $stmt = $db->prepare($sql);
        return $stmt->execute([$total, $staffId, $id]);
    }
    /**
     * Chức năng: Thống kê doanh thu và lượt khám cho Admin.
     * Logic: Dùng hàm SUM để cộng tiền và COUNT để đếm số hóa đơn trong khoảng ngày.
     */
    public static function getStats($fromDate, $toDate) {
        $db = Database::getConnection();
        $sql = "SELECT 
                    SUM(total_amount) as total_revenue, 
                    COUNT(id) as total_visits 
                FROM medical_records 
                WHERE payment_status = 'PAID' 
                AND DATE(payment_date) BETWEEN ? AND ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$fromDate, $toDate]);
        return $stmt->fetch();
    }
    /**
     * Chức năng: Tạo một hồ sơ khám bệnh mới và lưu các dịch vụ đi kèm.
     * Sử dụng Transaction: Đảm bảo hoặc là lưu hết, hoặc là không lưu gì nếu có lỗi.
     */
    public static function createWithDetails($data) {
        $db = Database::getConnection();
        try {
            $db->beginTransaction(); // Bắt đầu quá trình lưu an toàn: hoặc lưu tất cả hoặc không

            // 1. Lưu vào bảng medical_records (Hóa đơn tổng)
            $sqlRecord = "INSERT INTO medical_records (patient_id, doctor_id, diagnosis, payment_status) VALUES (?, ?, ?, 'UNPAID')";
            $stmt = $db->prepare($sqlRecord);
            $stmt->execute([
                $data['patient_id'],
                $data['doctor_id'],
                $data['diagnosis']
            ]);

            $recordId = $db->lastInsertId(); // Lấy ID của hồ sơ vừa tạo

            // 2. Lưu vào bảng record_details (Các dịch vụ bác sĩ chọn)
            $sqlDetails = "INSERT INTO record_details (record_id, service_id, quantity, snapshot_price) VALUES (?, ?, ?, ?)";
            $stmtDetails = $db->prepare($sqlDetails);

            foreach ($data['services'] as $s) {
                // Lấy giá thực tế từ bảng services để lưu vào snapshot
                $priceStmt = $db->prepare("SELECT unit_price FROM services WHERE id = ?");
                $priceStmt->execute([$s['service_id']]);
                $unitPrice = $priceStmt->fetchColumn();

                $stmtDetails->execute([
                    $recordId,
                    $s['service_id'],
                    $s['quantity'],
                    $unitPrice
                ]);
            }

            $db->commit(); // Xác nhận lưu vĩnh viễn vào DB
            return true;
        } catch (\Exception $e) {
            $db->rollBack(); // Nếu có lỗi, xóa sạch những gì vừa làm để tránh rác dữ liệu
            return false;
        }
    }
    /**
     * Chức năng: Lấy danh sách toàn bộ hóa đơn ĐÃ thanh toán.
     * Hiển thị: Đổ vào bảng Lịch sử giao dịch.
     */
    public static function getHistory() {
    $db = Database::getConnection();
    $sql = "SELECT m.*, p.full_name as patient_name, u.full_name as staff_name 
            FROM medical_records m
            JOIN patients p ON m.patient_id = p.id
            LEFT JOIN users u ON m.staff_id = u.id
            WHERE m.payment_status = 'PAID'
            ORDER BY m.payment_date DESC";
    // Đảm bảo trả về mảng kết hợp để JSON đẹp
    return $db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
}
}