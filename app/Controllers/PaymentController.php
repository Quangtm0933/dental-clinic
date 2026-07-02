<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\MedicalRecord;
use App\Models\Service;

class PaymentController extends BaseController {

    /**
     * Endpoint: GET /api/payments/pending
     * Chức năng: Lấy danh sách bệnh nhân đã khám xong nhưng chưa trả tiền.
     * Hiển thị: Đổ dữ liệu vào cột bên trái (Danh sách chờ) trang Thanh toán.
     */
    public function getPending() {
        $this->checkAuth();
        $this->jsonResponse(["status" => "success", "data" => MedicalRecord::getUnpaid()]);
    }

    /**
     * Endpoint: GET /api/payments/{id}
     * Chức năng: Lấy các dịch vụ chi tiết bác sĩ đã chỉ định cho hồ sơ này.
     * Hiển thị: Đổ dữ liệu vào bảng hóa đơn ở cột bên phải khi click vào một bệnh nhân.
     */
    public function getDetails($recordId) {
        $this->checkAuth();
        $this->jsonResponse(["status" => "success", "data" => MedicalRecord::getDetailsByRecord($recordId)]);
    }

    /**
     * MỚI: Endpoint: POST /api/payments (Trường hợp tạo mới)
     * Chức năng: Nhận dữ liệu từ Bác sĩ sau khi bấm "Hoàn tất khám".
     * Logic: Lưu chẩn đoán vào bảng chính và lưu danh sách dịch vụ vào bảng chi tiết.
     */
    public function create() {
        $this->checkAuth();
        
        // Đọc dữ liệu JSON gửi từ form Khám bệnh
        $data = json_decode(file_get_contents("php://input"), true);

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (empty($data['patient_id']) || empty($data['diagnosis'])) {
            $this->jsonResponse(["status" => "error", "message" => "Thiếu thông tin chẩn đoán!"], 400);
        }

        // Gọi Model để xử lý nghiệp vụ lưu hồ sơ
        if (MedicalRecord::createWithDetails($data)) {
            $this->jsonResponse([
                "status" => "success", 
                "message" => "Đã chuyển hồ sơ sang quầy thanh toán thành công!"
            ]);
        } else {
            $this->jsonResponse([
                "status" => "error", 
                "message" => "Lỗi hệ thống khi tạo hồ sơ. Kiểm tra lại ID Bác sĩ/Bệnh nhân."
            ], 500);
        }
    }

    /**
     * Endpoint: POST /api/payments (Trường hợp cập nhật record_id)
     * Chức năng: Chốt hóa đơn, thu tiền bệnh nhân.
     * Bảo mật: Tự lấy giá từ Database để tính toán lại, không tin tưởng giá từ Frontend.
     */
    public function checkout() {
        $this->checkAuth();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $recordId = $data['record_id'] ?? null;
        $services = $data['services'] ?? [];

        if (!$recordId || empty($services)) {
            $this->jsonResponse(["status" => "error", "message" => "Dữ liệu hóa đơn không hợp lệ!"], 400);
        }

        /**
         * LOGIC BẢO MẬT: Backend tự tính toán số tiền dựa trên giá gốc từ DB.
         * Công thức: $$Total = \sum (Price_{DB} \times Quantity_{User})$$
         */
        $totalAmount = 0;
        foreach ($services as &$item) {
            // Lấy giá chuẩn từ bảng services
            $realPrice = Service::getPriceById($item['service_id']);
            
            // Ghi nhận giá tại thời điểm thu tiền (snapshot)
            $item['snapshot_price'] = $realPrice;
            
            // Cộng dồn tổng tiền: Ép kiểu quantity về int để tránh lỗi chuỗi
            $totalAmount += ($realPrice * (int)$item['quantity']);
        }

        
        $staffId = 1; 
        
        if (MedicalRecord::completePayment($recordId, $totalAmount, $staffId)) {
            $this->jsonResponse([
                "status" => "success", 
                "message" => "Thanh toán thành công!", 
                "total" => $totalAmount
            ]);
        }
        
        $this->jsonResponse(["status" => "error", "message" => "Lỗi khi cập nhật trạng thái PAID"], 500);
    }
}