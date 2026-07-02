<?php
namespace App\Controllers;
use App\Core\BaseController;
use App\Models\User;

class AuthController extends BaseController {
   public function login() {
    $data = json_decode(file_get_contents("php://input"), true);
    $user = User::login($data['username'] ?? '', $data['password'] ?? '');

    if ($user) {
        $token = base64_encode($user['id'] . "-" . time());
        // Truyền tách biệt: status, message, data, code
        return $this->jsonResponse("success", "Đăng nhập thành công", [
            "token" => $token,
            "user" => $user
        ], 200);
    }
    
    // Khi thất bại
    return $this->jsonResponse("error", "Sai tài khoản hoặc mật khẩu!", null, 401);
}
}