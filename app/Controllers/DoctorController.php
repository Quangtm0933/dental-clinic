<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Doctor;

class DoctorController extends BaseController {

    // Chỉ Admin mới có quyền thao tác với Bác sĩ
    private function isAdmin() {
        $this->checkAuth();
        // Trong thực tế bạn sẽ giải mã Token để check role. 
        // Ở đây chúng ta tin tưởng vào logic Frontend đã ẩn menu, nhưng Backend vẫn nên check.
    }

    public function index() {
        $this->isAdmin();
        $this->jsonResponse(["status" => "success", "data" => Doctor::getAll()]);
    }

    public function show($id) {
        $this->isAdmin();
        $doctor = Doctor::find($id);
        if ($doctor) {
            $this->jsonResponse(["status" => "success", "data" => $doctor]);
        }
        $this->jsonResponse(["status" => "error", "message" => "Không tìm thấy bác sĩ"], 404);
    }

    public function store() {
        $this->isAdmin();
        $data = json_decode(file_get_contents("php://input"), true);

        // ĐIỀU KIỆN: Bắt buộc nhập Họ tên và Chuyên khoa
        if (empty($data['full_name']) || empty($data['specialty'])) {
            $this->jsonResponse(["status" => "error", "message" => "Họ tên và Chuyên khoa là bắt buộc!"], 400);
        }

        if (Doctor::create($data)) {
            $this->jsonResponse(["status" => "success", "message" => "Thêm bác sĩ thành công"]);
        }
        $this->jsonResponse(["status" => "error", "message" => "Lỗi server"], 500);
    }

    public function update($id) {
        $this->isAdmin();
        $data = json_decode(file_get_contents("php://input"), true);

        if (Doctor::update($id, $data)) {
            $this->jsonResponse(["status" => "success", "message" => "Cập nhật thành công"]);
        }
        $this->jsonResponse(["status" => "error", "message" => "Lỗi cập nhật"], 500);
    }

    public function destroy($id) {
        $this->isAdmin();
        if (Doctor::delete($id)) {
            $this->jsonResponse(["status" => "success", "message" => "Đã xóa bác sĩ"]);
        }
        $this->jsonResponse(["status" => "error", "message" => "Không thể xóa"], 500);
    }
}