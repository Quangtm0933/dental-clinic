<?php
namespace App\Core;

class Router {
    protected $routes = [];

    // Hàm đăng ký route GET
    public function get($uri, $callback) {
        $this->routes['GET'][$uri] = $callback;
    }

    // Hàm đăng ký route POST
    public function post($uri, $callback) {
        $this->routes['POST'][$uri] = $callback;
    }

    // Hàm điều hướng
    public function resolve() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = $_SERVER['REQUEST_URI'];

        // Cắt bỏ phần path dư thừa nếu bạn để trong folder public
        $path = str_replace('/dental-clinic/public', '', $uri);

        if (isset($this->routes[$method][$path])) {
            return call_user_func($this->routes[$method][$path]);
        }

        http_response_code(404);
        echo json_encode(["message" => "Route không tồn tại!"]);
    }
}