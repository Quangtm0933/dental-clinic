<?php
namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Patient;

class PatientController extends BaseController {

    // GET /api/patients
    public function index() {
        $this->checkAuth(); // kiểm tra xem đăng nhập chưa
        $this->jsonResponse([
            "status" => "success",
            "data" => Patient::getAll()
        ]);
    }

    // GET /api/patients/{id}
    public function show($id) {
        $this->checkAuth();
        $patient = Patient::find($id);

        if ($patient) {
            $this->jsonResponse([
                "status" => "success",
                "data" => $patient
            ]);
        }

        $this->jsonResponse([
            "status" => "error",
            "message" => "Không tìm thấy bệnh nhân"
        ], 404);
    }

    // POST /api/patients
    public function store() {
        $this->checkAuth();

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['full_name']) || empty($data['phone'])) {
            $this->jsonResponse([
                "status" => "error",
                "message" => "Tên và SĐT bắt buộc nhập"
            ], 400);
        }

        if (Patient::create($data)) {
            $this->jsonResponse([
                "status" => "success",
                "message" => "Thêm thành công"
            ]);
        }

        $this->jsonResponse([
            "status" => "error",
            "message" => "Lỗi Server"
        ], 500);
    }

    // PUT /api/patients/{id}
    public function update($id) {
        $this->checkAuth();

        $data = json_decode(file_get_contents("php://input"), true);

        if (Patient::update($id, $data)) {
            $this->jsonResponse([
                "status" => "success",
                "message" => "Cập nhật thành công"
            ]);
        }

        $this->jsonResponse([
            "status" => "error",
            "message" => "Không thể cập nhật"
        ], 500);
    }

    // DELETE /api/patients/{id}
    public function destroy($id) {
        $this->checkAuth();

        if (Patient::delete($id)) {
            $this->jsonResponse([
                "status" => "success",
                "message" => "Đã xóa"
            ]);
        }

        $this->jsonResponse([
            "status" => "error",
            "message" => "Lỗi khi xóa"
        ], 500);
    }
}