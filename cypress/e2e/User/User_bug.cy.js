describe('Bug Hunting - Module Quản lý Tài khoản', () => {

    beforeEach(() => {
        // Nạp môi trường đăng nhập
        cy.visit('http://localhost/dental-clinic/public/dashboard.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                win.localStorage.setItem('role', 'ADMIN');
                win.localStorage.setItem('fullName', 'Quản Trị Viên');
            }
        });

        cy.contains('Quản lý tài khoản').click();
        cy.wait(1000); // Đợi API load
    });

    context('❌ BẮT LỖI TÀI KHOẢN (BUG HUNTING)', () => {

        
        // ==========================================
        // BUG_ACC_01: LỖI SILENT FAILURE KHI TRÙNG USERNAME
        // ==========================================
        it('BUG_ACC_01 - Lỗ hổng UI: "Đứng hình" khi nhập trùng Tên đăng nhập (Thiếu cảnh báo)', () => {
            cy.intercept('POST', '**/users').as('apiAddUser');
            
            const duplicateUser = `admin_${Date.now()}`;

            // BƯỚC 1: Tạo user gốc
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_username').type(duplicateUser);
            cy.get('#acc_full_name').type('Bản gốc');
            cy.get('#acc_password').type('123456');
            cy.get('#accountForm button[type="submit"]').click();
            cy.wait('@apiAddUser');
            cy.wait(500); 

            // BƯỚC 2: Nhập trùng user cũ
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_username').type(duplicateUser);
            cy.get('#acc_full_name').type('Bản sao trùng tên');
            cy.get('#acc_password').type('123456');
            cy.get('#accountForm button[type="submit"]').click();
            
            cy.wait('@apiAddUser');

            // KIỂM TRA LỖ HỔNG (ĐỨNG HÌNH):
            cy.get('#accountModal').should('have.class', 'active').then(() => {
                throw new Error(`🚨 BUG EXPOSED: Hệ thống phát hiện trùng Username "${duplicateUser}" nhưng dính lỗi Silent Failure! Không hiện thông báo, Form bị treo im lìm!`);
            });
        });

        // ==========================================
        // BUG_ACC_02: THIẾU BẮT BUỘC NHẬP MẬT KHẨU
        // ==========================================
        it('BUG_ACC_02 - Lỗ hổng UI/API: Cho phép tạo tài khoản mới mà không có mật khẩu', () => {
            cy.intercept('POST', '**/users').as('apiAddUser');
            
            cy.contains('+ Thêm Tài khoản').click();
            cy.get('#acc_username').type(`nopass_${Date.now()}`);
            cy.get('#acc_full_name').type('Nhân viên Không Mật Khẩu');
            // CỐ TÌNH BỎ TRỐNG Ô MẬT KHẨU
            
            cy.get('#accountForm button[type="submit"]').click();

            cy.wait('@apiAddUser').then((interception) => {
                expect(interception.response.statusCode).not.to.eq(
                    200, 
                    '🚨 BUG EXPOSED: HTML thiếu thuộc tính required, PHP thiếu Validation. Hệ thống lưu thành công tài khoản rỗng mật khẩu!'
                );
            });
        });

        // ==========================================
        // BUG_ACC_03: LỖI SILENT FAILURE KHI TRÀN DỮ LIỆU
        // ==========================================
        it('BUG_ACC_03 - Lỗ hổng UI: "Đứng hình" (Silent Failure) khi nhập quá 50 ký tự', () => {
            cy.intercept('POST', '**/users').as('apiAddUser');
            
            cy.contains('+ Thêm Tài khoản').click();
            
            // Nhập 100 ký tự (Vượt quá giới hạn DB)
            cy.get('#acc_username').type('a'.repeat(100)); 
            cy.get('#acc_full_name').type('User Tràn Dữ Liệu');
            cy.get('#acc_password').type('123456');
            
            cy.get('#accountForm button[type="submit"]').click();

            cy.wait('@apiAddUser');

            // KIỂM TRA LỖ HỔNG (ĐỨNG HÌNH):
            cy.get('#accountModal').should('have.class', 'active').then(() => {
                throw new Error("🚨 BUG EXPOSED: Lỗi 'Silent Failure'! Dữ liệu tràn DB bị từ chối, nhưng Frontend không có code báo lỗi (Alert), làm giao diện bị treo hoàn toàn!");
            });
        });

    });
});