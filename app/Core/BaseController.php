<?php
namespace App\Core;

class BaseController {
    /**
     * Trả về JSON chuẩn đồng bộ cho toàn hệ thống
     * Giúp Frontend (Fetch API) luôn nhận được cấu trúc: {status, message, data}
     */
   protected function jsonResponse($p1, $p2 = null, $p3 = null, $p4 = 200) {
    
    if (is_array($p1) || is_object($p1)) {
        //  Nếu trong mảng đã có status thì lấy, không thì mới mặc định là success
        $status = isset($p1['status']) ? $p1['status'] : "success";
        $message = isset($p1['message']) ? $p1['message'] : "OK";
        
        // Nếu là mảng chứa status/message rồi thì data chính là chính nó, 
        
        $data = $p1; 
        $statusCode = is_int($p2) ? $p2 : 200;
    } 
    // gọi kiểu mới (Tách rời các tham số)
   
    else {
        $status = $p1;
        $message = $p2;
        $data = $p3;
        $statusCode = is_int($p4) ? $p4 : 200;
    }

    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);

    // QUY TẮC BỌC DỮ LIỆU: Đảm bảo không bị bọc 2 lần key 'data'
    $finalData = (isset($data['data'])) ? $data['data'] : $data;

    echo json_encode([
        "status"  => $status,
        "message" => $message,
        "data"    => $finalData
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
    /**
     * Bảo vệ API: Kiểm tra Token đăng nhập
     */
    protected function checkAuth() {
        $headers = apache_request_headers();
        // Hỗ trợ cả Authorization viết hoa hoặc thường 
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader)) {
            $this->jsonResponse("error", "Chưa xác thực. Vui lòng đăng nhập!", null, 401);
        }
        
        
        return true;
    }

    /**
     * Phân quyền: Kiểm tra nếu không phải ADMIN thì chặn truy cập
     * Dùng cho các mục như: Quản lý tài khoản, Thống kê doanh thu, Quản lý bác sĩ
     */
    protected function checkAdmin() {
        $this->checkAuth(); // Phải đăng nhập trước đã
        
        $headers = apache_request_headers();
       
        $role = $headers['Role'] ?? $headers['role'] ?? '';

        if ($role !== 'ADMIN') {
            $this->jsonResponse("error", "Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên!", null, 403);
        }
        return true;
    }
}