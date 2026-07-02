describe('Doctor Update', () => {

    beforeEach(() => {
        cy.visit(
            'http://localhost/dental-clinic/public/dashboard.html',
            {
                onBeforeLoad(win) {
                    win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                    win.localStorage.setItem('role', 'ADMIN');
                    win.localStorage.setItem('fullName', 'Quản Trị Viên');
                }
            }
        );

        cy.contains('Bác sĩ').click();
        
       
        cy.wait(1000); 
    });

    function openFirstDoctor() {
        cy.get('#tblDoctors tr').should('have.length.greaterThan', 0);
        cy.get('#tblDoctors tr').first().find('.fa-pen').click();
     
        cy.wait(500);
    }

    it('TC_UPD_01 - Cập nhật thông tin với tất cả dữ liệu hợp lệ', () => {
        openFirstDoctor();

        cy.get('#d_full_name').clear().type('Lê Hoàng C Cập Nhật');
        cy.get('#d_specialty').clear().type('Phẫu thuật hàm mặt');
        cy.get('#d_phone').clear().type('0999888777');
        cy.get('#d_email').clear().type('c_update@gmail.com');

        cy.get('#btnSubmitDoctor').click();
        
        
        cy.get('#doctorModal').should('not.have.class', 'active');
    });

    it('TC_UPD_02 - Xóa rỗng trường Họ tên', () => {
        openFirstDoctor();

        cy.get('#d_full_name').clear();
        cy.get('#btnSubmitDoctor').click();

        cy.get('#d_full_name:invalid').should('exist');
    });

    it('TC_UPD_03 - Xóa rỗng trường Chuyên khoa', () => {
        openFirstDoctor();

        cy.get('#d_specialty').clear();
        cy.get('#btnSubmitDoctor').click();

        cy.get('#d_specialty:invalid').should('exist');
    });

    it('TC_UPD_04 - Họ tên >100 ký tự', () => {
        openFirstDoctor();

        cy.get('#d_full_name').clear().type('a'.repeat(101));
        cy.get('#btnSubmitDoctor').click();

        cy.get('#fullNameError').should('contain', '100 ký tự');
    });

    
    it('TC_UPD_05 - Chuyên khoa >100 ký tự', () => {
        openFirstDoctor();

        cy.get('#d_specialty').clear().type('b'.repeat(101));
        cy.get('#btnSubmitDoctor').click();

        cy.get('#specialtyError').should('contain', '100 ký tự');
    });

    it('TC_UPD_06 - Họ tên chứa số', () => {
        openFirstDoctor();

        cy.get('#d_full_name').clear().type('Nguyen123');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#fullNameError').should('contain', 'chữ cái');
    });

    it('TC_UPD_07 - Họ tên chứa ký tự đặc biệt', () => {
        openFirstDoctor();

        cy.get('#d_full_name').clear().type('Nguyen@');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#fullNameError').should('contain', 'chữ cái');
    });

    it('TC_UPD_08 - SĐT 9 số', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear().type('123456789');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#phoneError').should('contain', '10 chữ số');
    });

   
    it('TC_UPD_09 - SĐT đúng 10 số (Hợp lệ)', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear().type('0901234567');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#doctorModal').should('not.have.class', 'active');//xác nhận xem tab Sửa đã đóng chưa?
    });

    it('TC_UPD_10 - SĐT 11 số', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear().type('12345678901');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#phoneError').should('contain', '10 chữ số');
    });

    it('TC_UPD_11 - SĐT chứa chữ', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear().type('abc');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#phoneError').should('contain', '10 chữ số');
    });

  
    it('TC_UPD_12 - SĐT chứa ký tự đặc biệt', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear().type('09-123456');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#phoneError').should('contain', '10 chữ số');
    });

    it('TC_UPD_13 - Email sai định dạng', () => {
        openFirstDoctor();

        cy.get('#d_email').clear().type('abc.com');
        cy.get('#btnSubmitDoctor').click();

        cy.get('#d_email:invalid').should('exist');
    });

    
    it('TC_UPD_14 - Xóa rỗng SĐT và Email (Không bắt buộc)', () => {
        openFirstDoctor();

        cy.get('#d_phone').clear();
        cy.get('#d_email').clear();
        cy.get('#btnSubmitDoctor').click();

        // Cập nhật thành công, form đóng lại
        cy.get('#doctorModal').should('not.have.class', 'active');
    });

});