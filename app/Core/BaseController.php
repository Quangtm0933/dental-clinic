<?php
namespace App\Core;

class BaseController {
    // Trả về JSON chuẩn
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }

    // Bảo vệ API: Bắt buộc có token (Ở mức cơ bản cho đồ án)
    protected function checkAuth() {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader)) {
            $this->jsonResponse(["status" => "error", "message" => "Chưa xác thực. Vui lòng đăng nhập!"], 401);
        }
        // Thực tế sẽ decode JWT tại đây. Tạm thời chỉ check có gửi token là cho qua.
        return true;
    }
}