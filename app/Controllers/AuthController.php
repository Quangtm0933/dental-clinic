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
            $this->jsonResponse(["status" => "success", "token" => $token, "user" => $user]);
        }
        $this->jsonResponse(["status" => "error", "message" => "Sai tài khoản hoặc mật khẩu!"], 401);
    }
}