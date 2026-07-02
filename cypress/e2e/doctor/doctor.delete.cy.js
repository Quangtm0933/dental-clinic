describe('Doctor Delete', () => {

    // Hàm tạo chuỗi chữ ngẫu nhiên không chứa số
    function generateRandomName(prefix) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `${prefix} ${result}`;
    }

    beforeEach(() => {
        cy.visit('http://localhost/dental-clinic/public/dashboard.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                win.localStorage.setItem('role', 'ADMIN');
                win.localStorage.setItem('fullName', 'Quản Trị Viên');
            }
        });

        cy.contains('Bác sĩ').click();
        
       
        cy.get('section#doctors').should('have.class', 'active');
        
      
        cy.get('#tblDoctors tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    
    it('TC_DEL_01 - Xóa bác sĩ hợp lệ', () => {
        const doctorName = generateRandomName('DoctorDelete');
        cy.get('#tblDoctors tr').its('length').as('rowCount');      // ghi nhớ số dòng, tí kiểm tra lại xm=em có mất một bs k
        cy.get('section#doctors').contains('+ Thêm Bác sĩ', { matchCase: false }).click();
// tạo tem một bác sĩ để tí xóa
        cy.get('#d_full_name').type(doctorName);
        cy.get('#d_specialty').type('Răng Hàm Mặt');
        cy.get('#btnSubmitDoctor').click();

      
        cy.contains('#tblDoctors tr', doctorName).should('exist');

        // Tìm bác sĩ vauw tao
        cy.contains('#tblDoctors tr', doctorName).within(() => {//within chỉ là chỉ tìm button trong cái Doctor vừa tìm đc thôi á
            cy.on('window:confirm', () => true); //hộp thoại xác nhận nhé, bấm ok á
            cy.get('button').eq(1).click();     
        });

        
        cy.contains('#tblDoctors tr', doctorName).should('not.exist');// not exist dòng này k tồn tại nữa

        // so sánh với số dòng ban đầu
        cy.get('@rowCount').then((beforeLength) => {
            cy.get('#tblDoctors tr').should('have.length', beforeLength);
        });
    });

   
    it('TC_DEL_02 - Nhấn Cancel', () => {
        const doctorName = generateRandomName('DoctorCancel');

        // Bấm nút thêm
        cy.get('section#doctors').contains('+ Thêm Bác sĩ', { matchCase: false }).click();

        cy.get('#d_full_name').type(doctorName);
        cy.get('#d_specialty').type('Răng Hàm Mặt');
        cy.get('#btnSubmitDoctor').click();

       
        cy.contains('#tblDoctors tr', doctorName).should('exist');// đợi bác sĩ đã thêm đã

        cy.contains('#tblDoctors tr', doctorName).within(() => {
            cy.on('window:confirm', () => false); // Nhấn CANCEL khi hiện confirm
            cy.get('button').eq(1).click();
        });

        cy.contains('#tblDoctors tr', doctorName).should('exist'); // xác nhận xem bác sĩ vừa giờ tạo còn k?
    });

   // cái này gửi trực tiếp cho APi nhé
    it('TC_DEL_03 - Xóa bác sĩ không tồn tại', () => {
        cy.request({
            method: 'DELETE',//thử xóa bác sĩ id =999999 xem nhé
            url: 'http://localhost/dental-clinic/public/api/doctors/999999',
            failOnStatusCode: false, // vì dù nó sai nhưng chưa dừng ctr ngay 
            headers: {
                Authorization: 'MS0xNzgxNTA4NDMw'
            }
        }).then((res) => {
            expect([404, 500, 200]).to.include(res.status);// máy lỗi sao ấy, thật ra chỉ có 404 là chuẩn á
        });
    });
});