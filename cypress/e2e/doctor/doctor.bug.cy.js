describe('Bug Hunting - Module Quản lý Bác sĩ', () => {

    beforeEach(() => {
    
        cy.visit('http://localhost/dental-clinic/public/dashboard.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                win.localStorage.setItem('role', 'ADMIN');
                win.localStorage.setItem('fullName', 'Quản Trị Viên');
            }
        });

        cy.contains('Bác sĩ').click();
        cy.wait(1000); 
    });

    context(' BẮT LỖI (BUG HUNTING)', () => {

       
        it('BUG_DOC_01 - Lỗ hổng UI: Thiếu trường nhập liệu "Mô tả" (Description) trên form', () => {
          
            cy.get('section#doctors').contains('+ Thêm Bác sĩ').click();

            cy.get('#doctorModal').should('have.class', 'active');

            //QUÉT CẤU TRÚC HTML ĐỂ TÌM LỖ HỔNG
            cy.get('#doctorForm').then(($form) => {
               
                const descriptionField = $form.find('[id*="desc"], [name*="desc"], [placeholder*="mô tả"]');
                
                
                expect(descriptionField.length).to.be.greaterThan(
                    0, 
                    '🚨 BUG EXPOSED: Backend hỗ trợ trường "description" nhưng giao diện Frontend hoàn toàn vắng bóng ô nhập liệu này!'
                );
            });
        });

       
        it('BUG_DOC_02 - Lỗ hổng API: Cho phép tạo nhiều bác sĩ trùng Số điện thoại', () => {
            cy.intercept('POST', '**/api/doctors').as('apiAddDoctor');

            const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);// tạo sdt ngẫu nhiên
            const duplicatePhone = `09${randomSuffix}`;

            // tạo 1 bác sĩ nhé
            cy.get('section#doctors').contains('+ Thêm Bác sĩ').click();
            cy.get('#d_full_name').type('Bác Sĩ Bản Gốc');
            cy.get('#d_specialty').type('Chỉnh nha');
            cy.get('#d_phone').type(duplicatePhone);
            cy.get('#btnSubmitDoctor').click();

            cy.wait('@apiAddDoctor').its('response.statusCode').should('eq', 200);
            cy.get('#doctorModal').should('not.have.class', 'active'); 

            //tạo bác sũ cùng sdt 
            cy.get('section#doctors').contains('+ Thêm Bác sĩ').click();
            cy.get('#d_full_name').type('Bác Sĩ Bản Sao');
            cy.get('#d_specialty').type('Nha chu');
            cy.get('#d_phone').type(duplicatePhone); 
            cy.get('#btnSubmitDoctor').click();

          //kiểm tra
            cy.wait('@apiAddDoctor').then((interception) => {
                expect(interception.response.statusCode).to.eq(
                    400, 
                    `🚨 BUG EXPOSED: Hệ thống đã lưu thành công bác sĩ thứ 2 với cùng SĐT ${duplicatePhone} thay vì báo lỗi (Mã 400)!`
                );
            });
        });

    });
});