describe('Doctor Management', () => {


beforeEach(() => {
    cy.visit(
        'http://localhost/dental-clinic/public/dashboard.html',
        {
            onBeforeLoad(win) {
                win.localStorage.setItem(
                    'token',
                    'MS0xNzgxNTA4NDMw'
                );
                win.localStorage.setItem(
                    'role',
                    'ADMIN'
                );
                win.localStorage.setItem(
                    'fullName',
                    'Quản Trị Viên'
                );
            }
        }
    );

    cy.contains('Bác sĩ').click();
});

it('TC_ADD_01 - Tất cả dữ liệu hợp lệ', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    // nếu nhanh quá thì : delay: 100, cy.wait(1000) chẳng hạn
    cy.get('#d_specialty').type('Răng Hàm Mặt');
    cy.get('#d_phone').type('0987654321');
    cy.get('#d_email').type('a@gmail.com');

    cy.get('#btnSubmitDoctor').click();
});

it('TC_ADD_02 - Họ tên rỗng', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_specialty').type('Răng');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#d_full_name:invalid').should('exist');
});

it('TC_ADD_03 - Chuyên khoa rỗng', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#d_specialty:invalid').should('exist');
});

it('TC_ADD_04 - Họ tên >100 ký tự', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name')
        .type('a'.repeat(101));

    cy.get('#d_specialty')
        .type('Răng');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#fullNameError')
        .should('contain', '100 ký tự');
});

it('TC_ADD_05 - Chuyên khoa >100 ký tự', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name')
        .type('Nguyễn Văn A');

    cy.get('#d_specialty')
        .type('a'.repeat(101));

    cy.get('#btnSubmitDoctor').click();

    cy.get('#specialtyError')
        .should('contain', '100 ký tự');
});

it('TC_ADD_06 - Họ tên chứa số', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name')
        .type('Nguyen123');

    cy.get('#d_specialty')
        .type('Răng');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#fullNameError')
        .should('contain', 'chữ cái');
});

it('TC_ADD_07 - Họ tên chứa ký tự đặc biệt', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name')
        .type('Nguyễn@A');

    cy.get('#d_specialty')
        .type('Răng');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#fullNameError')
        .should('contain', 'chữ cái');
});

it('TC_ADD_08 - SĐT 9 số', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_phone').type('123456789');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#phoneError')
        .should('contain', '10 chữ số');
});

it('TC_ADD_09 - SĐT đúng 10 số', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn B');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_phone').type('0912345678');

    cy.get('#btnSubmitDoctor').click();
});

it('TC_ADD_10 - SĐT 11 số', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_phone').type('12345678901');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#phoneError')
        .should('contain', '10 chữ số');
});

it('TC_ADD_11 - SĐT chứa chữ', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_phone').type('abc');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#phoneError')
        .should('contain', '10 chữ số');
});

it('TC_ADD_12 - SĐT chứa ký tự đặc biệt', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_phone').type('09-123456');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#phoneError')
        .should('contain', '10 chữ số');
});

it('TC_ADD_13 - Email sai định dạng', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn A');
    cy.get('#d_specialty').type('Răng');
    cy.get('#d_email').type('abc');

    cy.get('#btnSubmitDoctor').click();

    cy.get('#d_email:invalid').should('exist');
});

it('TC_ADD_14 - Không nhập SĐT và Email', () => {
    cy.contains('+ Thêm Bác sĩ').click();

    cy.get('#d_full_name').type('Nguyễn Văn C');
    cy.get('#d_specialty').type('Răng Hàm Mặt');

    cy.get('#btnSubmitDoctor').click();
});
 

});
