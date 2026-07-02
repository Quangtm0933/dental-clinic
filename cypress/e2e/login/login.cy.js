describe('Nha Khoa Dental Clinic - Kiểm thử luồng Đăng Nhập (PASS)', () => {
    // Thay đổi đường dẫn theo môi trường XAMPP của bạn
    const baseUrl = 'http://localhost/dental-clinic/public';

    beforeEach(() => {
        // Đảm bảo xóa sạch localStorage (Token cũ) trước mỗi Test Case
        cy.clearLocalStorage();
        cy.visit(`${baseUrl}/index.html`);
    });

 it('TC_LOGIN_01: Kiểm tra đăng nhập thành công với tài khoản hợp lệ', () => {
    // 1. Dặn Cypress "canh chừng" cái API login này
    cy.intercept('POST', '**/api/login').as('loginRequest');

    cy.get('#user').type('admin');
    cy.get('#pass').type('12345');
    cy.get('button[type="submit"]').click();

    // 2. Ép Cypress phải đợi API trả về 200 OK mới đi tiếp
    cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
    });

    // 3. QUAN TRỌNG: Check URL trước tiên!
    // Việc này bắt Cypress đợi cho đến khi Frontend chạy xong lệnh window.location.href
    // và tải xong giao diện dashboard.
    cy.url().should('include', 'dashboard.html');

    // 4. Sau khi đã sang trang Dashboard an toàn, mới đọc localStorage
    cy.window().should((win) => {
        // Kiểm tra xem đã có token chưa
        expect(win.localStorage.getItem('token')).to.not.be.null;
        
        // Lấy role ra kiểm tra (Dùng to.match để không sợ lỗi viết hoa viết thường chữ Admin)
        const role = win.localStorage.getItem('role');
        if(role) {
            expect(role).to.match(/admin/i); 
        }
    });
});

    it('TC_LOGIN_02: Kiểm tra từ chối đăng nhập khi sai mật khẩu', () => {
        cy.get('#user').type('admin');
        cy.get('#pass').type('sai_pass_123');
        
        // Lắng nghe hộp thoại window.alert bật lên từ hàm handleLogin()
        cy.on('window:alert', (str) => {
            expect(str).to.include('Thất bại');
        });
        
        cy.get('button[type="submit"]').click();
        
        // Đảm bảo vẫn bị kẹt lại ở trang đăng nhập
        cy.url().should('include', 'index.html');
    });

    it('TC_LOGIN_03: Kiểm tra từ chối đăng nhập khi tài khoản không tồn tại', () => {
        cy.get('#user').type('user_ma_da');
        cy.get('#pass').type('123456');
        
        cy.on('window:alert', (str) => {
            expect(str).to.include('Thất bại');
        });
        
        cy.get('button[type="submit"]').click();
        cy.url().should('include', 'index.html');
    });

    it('TC_LOGIN_04: Kiểm tra Validation giao diện khi để trống thông tin', () => {
        // Bấm đăng nhập ngay lập tức mà không điền form
        cy.get('button[type="submit"]').click();
        
        // Kiểm tra thuộc tính "required" của HTML5 đã chặn thành công
        cy.get('#user')
            .invoke('prop', 'validity')
            .should('have.property', 'valueMissing', true);
            
        cy.get('#pass')
            .invoke('prop', 'validity')
            .should('have.property', 'valueMissing', true);
    });

    it('TC_LOGIN_05: Kiểm tra tiện ích Submit bằng phím Enter', () => {
        cy.get('#user').type('admin');
        // Gõ mật khẩu xong và ấn Enter ngay trên bàn phím (không click nút)
        cy.get('#pass').type('123456{enter}');
        
        // Đảm bảo form vẫn được kích hoạt và đăng nhập thành công
        cy.window().should((win) => {
            expect(win.localStorage.getItem('token')).to.not.be.null;
        });
        cy.url().should('include', 'dashboard.html');
    });

    it('TC_LOGIN_06: Kiểm tra chuyển hướng tự động khi đã có phiên đăng nhập (Token)', () => {
        // Bước 1: Giả lập đăng nhập thành công
        cy.get('#user').type('admin');
        cy.get('#pass').type('123456');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', 'dashboard.html');

        // Bước 2: Truy cập thẳng lại vào trang đăng nhập
        cy.visit(`${baseUrl}/index.html`);
        
        // Hệ thống sẽ đọc localStorage và lập tức hất ngược về Dashboard
        cy.url().should('include', 'dashboard.html');
    });

    it('TC_LOGIN_07: Kiểm tra bảo mật chống SQL Injection cơ bản trên Form', () => {
        // Nhập đoạn mã SQL Injection kinh điển
        cy.get('#user').type("' OR 1=1 --");
        cy.get('#pass').type('123');
        
        // Mong đợi Backend (PDO) hiểu đây là một chuỗi sai và ném ra thông báo thất bại
        cy.on('window:alert', (str) => {
            expect(str).to.include('Thất bại');
        });
        
        cy.get('button[type="submit"]').click();
        cy.url().should('include', 'index.html');
    });
});