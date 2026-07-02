
<?php

/**
 * ============================================================================
 * 1. KHỞI TẠO HỆ THỐNG & CẤU HÌNH (BOOTSTRAP)
 * ============================================================================
 * Nạp Autoload để tự động nhận diện các Class trong thư mục App.
 */
require_once __DIR__ . '/../vendor/autoload.php';

// Thiết lập Headers để hỗ trợ gọi API từ Frontend (CORS) và định dạng JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Xử lý "Preflight Request" (Yêu cầu kiểm tra của trình duyệt trước khi gửi dữ liệu thật)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * ============================================================================
 * 2. PHÂN TÍCH ĐƯỜNG DẪN (URL PARSING)
 * ============================================================================
 * Tách URL thành các phần để xác định: Resource (Mục nào) và ID (Cụ thể ai).
 */
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Xử lý đường dẫn linh hoạt (Xóa bỏ phần thư mục cha nếu có)
$path = str_ireplace('/dental-clinic/public', '', $uri); 
$path = trim($path, '/');
$pathParts = explode('/', $path);

/**
 * BẢO MẬT: Chặn tất cả các yêu cầu không đi qua tiền tố /api/
 */
if (!isset($pathParts[0]) || $pathParts[0] !== 'api') {
    http_response_code(404);
    echo json_encode(["message" => "Đường dẫn không hợp lệ. Mọi API phải bắt đầu bằng /api/"]);
    exit();
}

// Xác định các biến định tuyến
$resource = $pathParts[1] ?? null; // Ví dụ: 'patients', 'doctors', 'payments'
$id = $pathParts[2] ?? null;       // Ví dụ: ID cụ thể hoặc từ khóa 'pending'
$method = $_SERVER['REQUEST_METHOD']; // GET, POST, PUT, DELETE

/**
 * ============================================================================
 * 3. KHAI BÁO CONTROLLERS
 * ============================================================================
 */
use App\Controllers\AuthController;
use App\Controllers\PatientController;
use App\Controllers\DoctorController;
use App\Controllers\AppointmentController;
use App\Controllers\PaymentController;
use App\Controllers\StatsController;
use App\Controllers\ServiceController;
use App\Controllers\UserController;
/**
 * ============================================================================
 * 4. BỘ ĐỊNH TUYẾN CHÍNH (THE ROUTER)
 * ============================================================================
 */
try {
    // --- MODULE: ĐĂNG NHẬP ---
    if ($resource === 'login' && $method === 'POST') {
        (new AuthController())->login();
    } 
    
    // --- MODULE: QUẢN LÝ BỆNH NHÂN ---
    elseif ($resource === 'patients') {
        $controller = new PatientController();
        if ($method === 'GET') {
            $id ? $controller->show($id) : $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        } elseif ($method === 'PUT' && $id) {
            $controller->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $controller->destroy($id);
        }
    }
    
    // --- MODULE: QUẢN LÝ BÁC SĨ ---
    elseif ($resource === 'doctors') {
        $controller = new DoctorController();
        if ($method === 'GET') {
            $id ? $controller->show($id) : $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        } elseif ($method === 'PUT' && $id) {
            $controller->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $controller->destroy($id);
        }
    }

    // --- MODULE: DỊCH VỤ & BẢNG GIÁ ---
    elseif ($resource === 'services') {
        $controller = new ServiceController();
        if ($method === 'GET') {
            $id ? $controller->show($id) : $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        } elseif ($method === 'PUT' && $id) {
            $controller->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $controller->destroy($id);
        }
    }
    // --- MODULE: QUẢN LÝ TÀI KHOẢN (USER MANAGEMENT) ---

    elseif ($resource === 'users') {
        $controller = new UserController();
        if ($method === 'GET') {
            $id ? $controller->show($id) : $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        } elseif ($method === 'PUT' && $id) {
            $controller->update($id);
        } elseif ($method === 'DELETE' && $id) {
            $controller->destroy($id);
        }
    }
    
    // --- MODULE: LỊCH HẸN ---
    elseif ($resource === 'appointments') {
        $controller = new AppointmentController();
        if ($method === 'GET') {
            $controller->index();
        } elseif ($method === 'POST') {
            $controller->store();
        }
    }
    
    // --- MODULE: THANH TOÁN & KHÁM BỆNH (QUAN TRỌNG NHẤT) ---
    elseif ($resource === 'payments') {
        $controller = new PaymentController();
        
        // 1. Xử lý yêu cầu gửi dữ liệu (POST)
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            
            /**
             * PHÂN BIỆT LOGIC BẰNG DỮ LIỆU GỬI LÊN:
             * - Nếu có 'record_id': Lễ tân đang bấm nút "Hoàn tất thanh toán".
             * - Nếu không có 'record_id': Bác sĩ đang bấm nút "Hoàn tất khám".
             */
            if (isset($data['record_id'])) {
                $controller->checkout(); // Thực hiện thu tiền
            } else {
                $controller->create();   // Tạo hồ sơ khám mới
            }
        } 
        // 2. Xử lý yêu cầu lấy dữ liệu (GET)
        elseif ($method === 'GET') {
            /**
             * - Nếu ID là 'pending': Lấy danh sách bệnh nhân chờ thanh toán (Cột trái).
             * - Nếu ID là số cụ thể: Lấy chi tiết dịch vụ của bệnh nhân đó (Cột phải).
             */
            $id === 'pending' ? $controller->getPending() : $controller->getDetails($id);
        }
        elseif ($method === 'DELETE' && $id) {
            // Bạn có thể viết hàm destroy trong PaymentController hoặc xử lý nhanh ở đây
            $db = \App\Config\Database::getConnection();
            $stmt = $db->prepare("DELETE FROM medical_records WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Đã xóa hóa đơn"]);
            }
        }
    }
    
    // --- MODULE: THỐNG KÊ (DÀNH CHO ADMIN) ---
    elseif ($resource === 'stats' && $method === 'GET') {
        (new StatsController())->getRevenue();
    }
    
    // --- TRƯỜNG HỢP KHÔNG KHỚP ĐƯỜNG DẪN ---
    else {
        http_response_code(404);
        echo json_encode(["message" => "Endpoint API không tồn tại hoặc sai phương thức"]);
    }

} catch (\Exception $e) {
    /**
     * QUẢN LÝ LỖI TOÀN CỤC
     * Trả về mã lỗi 500 nếu có sự cố Backend hoặc SQL.
     */
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Lỗi hệ thống: " . $e->getMessage()
    ]);
}