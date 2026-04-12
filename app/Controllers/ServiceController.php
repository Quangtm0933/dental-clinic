<?php
namespace App\Controllers;
use App\Core\BaseController;
use App\Models\Service;

class ServiceController extends BaseController {
    
    public function index() {
        $this->checkAuth();
        $this->jsonResponse(["status" => "success", "data" => Service::getAll()]);
    }

    public function show($id) {
        $this->checkAuth();
        $item = Service::find($id);
        if ($item) $this->jsonResponse(["status" => "success", "data" => $item]);
        $this->jsonResponse(["status" => "error", "message" => "Không thấy dịch vụ"], 404);
    }

    public function store() {
        $this->checkAuth();
        $data = json_decode(file_get_contents("php://input"), true);

        // ĐIỀU KIỆN: Tên dịch vụ và Đơn giá không được để trống
        if (empty($data['service_name']) || empty($data['unit_price'])) {
            $this->jsonResponse(["status" => "error", "message" => "Tên dịch vụ và Đơn giá là bắt buộc!"], 400);
        }

        if (Service::create($data)) $this->jsonResponse(["status" => "success", "message" => "Thêm thành công"]);
        $this->jsonResponse(["status" => "error", "message" => "Lỗi server"], 500);
    }

    public function update($id) {
        $this->checkAuth();
        $data = json_decode(file_get_contents("php://input"), true);
        if (Service::update($id, $data)) $this->jsonResponse(["status" => "success", "message" => "Cập nhật thành công"]);
        $this->jsonResponse(["status" => "error", "message" => "Lỗi cập nhật"], 500);
    }

    public function destroy($id) {
        $this->checkAuth();
        if (Service::delete($id)) $this->jsonResponse(["status" => "success", "message" => "Đã xóa dịch vụ"]);
        $this->jsonResponse(["status" => "error", "message" => "Không thể xóa"], 500);
    }
}