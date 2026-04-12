<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Appointment;

class AppointmentController extends BaseController {

    // API GET: /api/appointments?date=yyyy-mm-dd
    public function index() {
        $this->checkAuth();
        
        // Lấy ngày từ Query String, nếu không có thì lấy ngày hiện tại
        $date = $_GET['date'] ?? date('Y-m-d');
        
        $appointments = Appointment::getByDate($date);
        $this->jsonResponse(["status" => "success", "data" => $appointments]);
    }

    // API POST: /api/appointments
    public function store() {
        $this->checkAuth();
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validate dữ liệu đầu vào (Tương đương logic trong AppointmentDialog.java)
        if (empty($data['patient_id']) || empty($data['doctor_id']) || empty($data['appointment_date'])) {
            $this->jsonResponse(["status" => "error", "message" => "Thiếu thông tin lịch hẹn!"], 400);
        }

        // Logic quan trọng: Kiểm tra bác sĩ có rảnh không (Tương đương isDoctorAvailable trong Java)
        $isAvailable = Appointment::isDoctorAvailable($data['doctor_id'], $data['appointment_date']);
        
        if (!$isAvailable) {
            $this->jsonResponse([
                "status" => "error", 
                "message" => "Bác sĩ đã có lịch hẹn vào giờ này! Vui lòng chọn giờ khác."
            ], 409); // 409 Conflict
        }

        if (Appointment::create($data)) {
            $this->jsonResponse(["status" => "success", "message" => "Đặt lịch hẹn thành công!"]);
        } else {
            $this->jsonResponse(["status" => "error", "message" => "Lỗi khi lưu vào CSDL!"], 500);
        }
    }
}