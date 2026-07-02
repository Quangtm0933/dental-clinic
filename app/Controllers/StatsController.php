<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Stats;

class StatsController extends BaseController {

    /**
     * Endpoint: GET /api/stats?from=yyyy-mm-dd&to=yyyy-mm-dd
     * Chức năng: Cung cấp toàn bộ dữ liệu cho tab Thống kê và tab Lịch sử hóa đơn.
     */
    public function getRevenue() {
        // 1. Kiểm tra bảo mật (Token hợp lệ mới cho xem doanh thu)
        $this->checkAuth();

        // 2. Lấy tham số ngày từ URL (Mặc định lấy dữ liệu 30 ngày gần nhất nếu để trống)
        $fromDate = $_GET['from'] ?? date('Y-m-d', strtotime('-30 days'));
        $toDate = $_GET['to'] ?? date('Y-m-d');

        // 3. Triệu tập dữ liệu từ Model Stats
        
        // Lấy tổng doanh thu (Số tiền)
        $totalRevenue = Stats::getTotalRevenue($fromDate, $toDate);
        
        // Lấy tổng lượt khám (Số hóa đơn)
        $totalVisits = Stats::getTotalVisits($fromDate, $toDate);
        
        // Lấy danh sách lịch sử chi tiết (Để hiện vào bảng Lịch sử giao dịch)
        $history = Stats::getHistory();

        // 4. Trả về JSON theo cấu trúc mà Frontend (JavaScript) đang chờ đợi
        $this->jsonResponse("success", "Tải thống kê thành công", [
           "total_revenue" => $totalRevenue,
            "total_visits" => $totalVisits,
           "history" => \App\Models\MedicalRecord::getHistory() // Gộp luôn history vào đây
       ]);
    }
}