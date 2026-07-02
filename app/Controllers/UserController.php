<?php
namespace App\Controllers;
use App\Core\BaseController;
use App\Models\User;

class UserController extends BaseController {
    public function index() {
        $keyword = $_GET['search'] ?? "";
        $users = User::getAll($keyword);
        $this->jsonResponse("success", "OK", $users);
    }

    public function show($id) {
        $user = User::getById($id);
        if ($user) $this->jsonResponse("success", "OK", $user);
        else $this->jsonResponse("error", "Not found", null, 404);
    }

    public function store() {
        $data = json_decode(file_get_contents("php://input"), true);
        if (User::create($data)) {
            $this->jsonResponse("success", "Đã tạo tài khoản");
        } else {
            $this->jsonResponse("error", "Lỗi khi tạo");
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (User::update($id, $data)) {
            $this->jsonResponse("success", "Đã cập nhật");
        } else {
            $this->jsonResponse("error", "Lỗi khi cập nhật");
        }
    }

    public function destroy($id) {
        if (User::delete($id)) {
            $this->jsonResponse("success", "Đã xóa tài khoản");
        } else {
            $this->jsonResponse("error", "Lỗi khi xóa");
        }
    }
}