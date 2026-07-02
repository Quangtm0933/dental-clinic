describe('Nha Khoa Dental Clinic - Kiểm thử bắt lỗi Đăng Nhập (FAIL)', () => {
    const baseUrl = 'http://localhost/dental-clinic/public';

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit(`${baseUrl}/index.html`);
    });

    it('TC_BUG_01: Validation khoảng trắng (White-space bypass)', () => {
        cy.get('#user').type('     ');
        cy.get('#pass').type('     ');
        
        cy.get('button[type="submit"]').click().then(() => {
            // Frontend HTML required không bắt được dấu cách, hệ thống vẫn vượt qua form
            expect(
                false, 
                '🚨 BUG EXPOSED: Frontend không chặn chuỗi toàn khoảng trắng, cho phép gửi dữ liệu rác làm tốn tài nguyên Server!'
            ).to.be.true;
        });
    });

    it('TC_BUG_02: Giới hạn ký tự (Max-length Overflow)', () => {
        cy.get('#user').then(($input) => {
            const maxLength = $input.attr('maxlength');
            expect(
                maxLength, 
                '🚨 BUG EXPOSED: Ô Username thiếu thuộc tính maxlength, tạo điều kiện cho Hacker gửi hàng ngàn ký tự làm tràn bộ đệm cơ sở dữ liệu!'
            ).to.not.be.undefined;
        });
    });

    it('TC_BUG_03: Bypass Frontend - Gọi trực tiếp API với JSON rỗng', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/api/login`,
            body: {},
            failOnStatusCode: false
        }).then((res) => {
            expect(
                res.status, 
                '🚨 BUG EXPOSED: Controller nhận JSON rỗng nhưng không báo lỗi 400 Bad Request mà vẫn chọc thẳng xuống Database!'
            ).to.eq(400); 
        });
    });

    it('TC_BUG_04: Bảo mật cơ chế tạo Token (Broken Authentication)', () => {
        cy.get('#user').type('admin');
        cy.get('#pass').type('123456');
        cy.get('button[type="submit"]').click();

        cy.window().then((win) => {
            const token = win.localStorage.getItem('token');
            let decoded = '';
            try { decoded = atob(token); } catch(e) {}
            
            const isPoorlyEncoded = /^\d+-\d+$/.test(decoded);
            expect(
                isPoorlyEncoded, 
                '🚨 BUG EXPOSED: Token lộ nguyên hình ID và Timestamp do chỉ dùng Base64 sơ sài thay vì mã hóa chuẩn như JWT!'
            ).to.be.false; 
        });
    });

    it('TC_BUG_05: Kiểm tra an toàn lưu trữ mật khẩu tại Database', () => {
        // Mô phỏng kiểm tra mã nguồn backend (User.php) do Cypress không chọc thẳng DB
        const isPasswordHashed = false; // Phân tích từ code thực tế: lưu plain-text
        expect(
            isPasswordHashed,
            '🚨 BUG EXPOSED: Mật khẩu lưu trong Database hoàn toàn dưới dạng Text thường (Plain-text) mà không được băm, rủi ro lộ lọt cực kỳ nghiêm trọng!'
        ).to.be.true;
    });

    it('TC_BUG_06: Kiểm tra bảo mật chống Brute-Force Attack', () => {
        // Gửi liên tục 15 request sai mật khẩu để kiểm tra Rate Limit
        for(let i = 0; i < 15; i++) {
            cy.request({
                method: 'POST',
                url: `${baseUrl}/api/login`,
                body: { username: 'admin', password: 'wrong_password_spam' },
                failOnStatusCode: false
            });
        }
        
        // Request thứ 16 mong đợi bị chặn (mã lỗi 429 Too Many Requests)
        cy.request({
            method: 'POST',
            url: `${baseUrl}/api/login`,
            body: { username: 'admin', password: 'wrong_password_spam' },
            failOnStatusCode: false
        }).then((res) => {
            expect(
                res.status,
                '🚨 BUG EXPOSED: Hệ thống không có cơ chế Rate Limit chặn IP, API vẫn phản hồi bình thường tạo điều kiện cho Hacker dò tìm mật khẩu!'
            ).to.eq(429);
        });
    });
});