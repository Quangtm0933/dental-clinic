describe('Quản lý Tài khoản Hệ thống - Cypress Automation Test', () => {

    beforeEach(() => {
        // Nạp thông tin giả lập vào Local Storage để vượt qua bước đăng nhập
        cy.visit('http://localhost/dental-clinic/public/dashboard.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                win.localStorage.setItem('role', 'ADMIN');
                win.localStorage.setItem('fullName', 'Quản Trị Viên');
            }
        });

        // Chuyển sang tab Quản lý tài khoản và đợi API tải dữ liệu
        cy.contains('Quản lý tài khoản').click();
        cy.wait(1000);
    });

    // ==========================================
    // I. BỘ TEST CASE: THÊM TÀI KHOẢN MỚI
    // ==========================================
    context('Thêm Tài khoản', () => {

        it('TC_ACC_ADD_01 - Thêm mới tài khoản hợp lệ', () => {
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_username').type(`staff_${Date.now()}`); // Dùng Date.now() để tạo user không bị trùng khi test nhiều lần
            cy.get('#acc_full_name').type('Lê Thùy Linh');
            cy.get('#acc_password').type('123456');
            cy.get('#acc_role').select('RECEPTIONIST');
            
            cy.get('#accountForm button[type="submit"]').click();
            
            // Kỳ vọng: Form đóng lại và lưu thành công
            cy.get('#accountModal').should('not.have.class', 'active');
        });

        it('TC_ACC_ADD_02 - Bắt lỗi bỏ trống Tên đăng nhập', () => {
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_full_name').type('Lê Thùy Linh');
            cy.get('#acc_password').type('123456');
            
            cy.get('#accountForm button[type="submit"]').click();
            
            // Kỳ vọng: Trình duyệt chặn submit bằng HTML5 (thuộc tính required)
            cy.get('#acc_username:invalid').should('exist');
        });

        it('TC_ACC_ADD_03 - Bắt lỗi bỏ trống Họ và tên', () => {
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_username').type('staff2');
            cy.get('#acc_password').type('123456');
            
            cy.get('#accountForm button[type="submit"]').click();
            
            // Kỳ vọng: Trình duyệt chặn submit bằng HTML5
            cy.get('#acc_full_name:invalid').should('exist');
        });

    });
    // ==========================================
    // II. BỘ TEST CASE: CẬP NHẬT TÀI KHOẢN
    // ==========================================
    context('Cập nhật Tài khoản', () => {
        
        // Hàm tiện ích: Mở form sửa của tài khoản đầu tiên trong bảng
        function openFirstAccount() {
            cy.get('#tblAccounts tr').should('have.length.greaterThan', 0);
            cy.get('#tblAccounts tr').first().find('.fa-pen').click();
            cy.wait(500); // Đợi nạp dữ liệu cũ
        }

        it('TC_ACC_UPD_01 - Kiểm tra thuộc tính khóa Tên đăng nhập (Read-only)', () => {
            openFirstAccount();
            
            // Kỳ vọng: Ô Username phải bị khóa không cho gõ thêm
            cy.get('#acc_username').should('have.prop', 'readOnly', true);
        });

        it('TC_ACC_UPD_02 - Cập nhật thông tin Họ tên, giữ nguyên mật khẩu cũ', () => {
            openFirstAccount();
            
            cy.get('#acc_full_name').clear().type('Nguyễn Nhân Viên Cập Nhật');
            cy.get('#acc_role').select('RECEPTIONIST');
            cy.get('#acc_password').clear(); // Đảm bảo bỏ trống ô mật khẩu
            
            cy.get('#accountForm button[type="submit"]').click();
            
            cy.get('#accountModal').should('not.have.class', 'active');
            cy.get('#tblAccounts').should('contain', 'Nguyễn Nhân Viên Cập Nhật');
        });

        it('TC_ACC_UPD_03 - Cập nhật thay đổi mật khẩu mới', () => {
            openFirstAccount();
            
            cy.get('#acc_password').clear().type('newpassword123');
            cy.get('#accountForm button[type="submit"]').click();
            
            // Thành công form sẽ tự đóng
            cy.get('#accountModal').should('not.have.class', 'active');
        });

        it('TC_ACC_UPD_04 - Bắt lỗi xóa rỗng Họ và Tên khi sửa', () => {
            openFirstAccount();
            
            cy.get('#acc_full_name').clear(); // Xóa sạch dữ liệu cũ
            cy.get('#accountForm button[type="submit"]').click();
            
            // Kỳ vọng: Form HTML5 chặn lại
            cy.get('#acc_full_name:invalid').should('exist');
        });
    });

    // ==========================================
    // III. BỘ TEST CASE: XÓA TÀI KHOẢN
    // ==========================================
    context('Xóa Tài khoản', () => {

        it('TC_ACC_DEL_01 - Xóa tài khoản thành công (Nhấn OK)', () => {
            // Giả lập người dùng bấm nút OK trên hộp thoại Confirm
            cy.on('window:confirm', () => true);
            
            cy.get('#tblAccounts tr').should('have.length.greaterThan', 0);
            
            // Lấy ID của dòng đầu tiên trước khi xóa để kiểm tra
            cy.get('#tblAccounts tr').first().find('td').first().invoke('text').then((idText) => {
                cy.get('#tblAccounts tr').first().find('.fa-trash').click();
                
                cy.on('window:alert', (text) => {
                    expect(text).to.equal('Đã xóa thành công!');
                });
                
                // Đảm bảo API load lại đã hoàn thành (nếu hệ thống xử lý nhanh thì DOM có thể chớp)
                cy.wait(500); 
            });
        });

        it('TC_ACC_DEL_02 - Hủy thao tác xóa (Nhấn Cancel)', () => {
            // Giả lập người dùng bấm Cancel trên hộp thoại Confirm
            cy.on('window:confirm', (str) => {
                expect(str).to.include('Xóa tài khoản này?');
                return false; 
            });
            
            // Lấy HTML của bảng trước khi bấm
            cy.get('#tblAccounts').invoke('html').then((htmlBefore) => {
                cy.get('#tblAccounts tr').first().find('.fa-trash').click();
                
                // Kỳ vọng bảng giữ nguyên y hệt lúc đầu
                cy.get('#tblAccounts').invoke('html').should('eq', htmlBefore);
            });
        });
    });

});