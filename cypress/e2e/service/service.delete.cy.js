describe('Quản lý Dịch vụ & Bảng giá - Test chức năng Xóa Dịch vụ', () => {

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
    cy.contains('Dịch vụ & Giá').click();
  });

  it('01 - Xóa dịch vụ hợp lệ (Confirm OK)', () => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Đã xóa thành công!');
    });
    cy.get('#tblServices').find('.fa-trash').first().click();
    cy.get('#tblServices').should('be.visible');
  });

  it('02 - Hủy thao tác xóa (Confirm Cancel)', () => {
    cy.on('window:confirm', (str) => {
      expect(str).to.include('Xác nhận xóa mục này?');
      return false;
    });
    cy.get('#tblServices').find('.fa-trash').first().click();
    cy.get('#tblServices').should('be.visible');
  });

  it('03 - Xóa dịch vụ đã phát sinh hóa đơn (Confirm OK)', () => {
    cy.on('window:confirm', () => true);
    cy.on('window:alert', (text) => {
      expect(text).to.equal('Không thể xóa. Mục này có thể đang được sử dụng trong hóa đơn.');
    });
    cy.get('#tblServices').find('.fa-trash').first().click();
  });

  it('04 - Xóa dịch vụ ID không tồn tại (biên lỗi)', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/services/999999',
      failOnStatusCode: false
    }).then((response) => {
      // 1. Kiểm tra mã trạng thái phản hồi (Status Code)
      expect(
        response.status, 
        `🚨 BUG EXPOSED: Hệ thống trả về mã trạng thái không hợp lý (${response.status}) khi yêu cầu xóa một ID không tồn tại thay vì chặn lại (404 hoặc 500)!`
      ).to.be.oneOf([404, 500]);
      
      // 2. Kiểm tra chuỗi thông báo lỗi trong body
      expect(
        response.body.message, 
        '🚨 BUG EXPOSED: Nội dung thông báo không báo lỗi, hệ thống có thể đang phản hồi "Đã xóa dịch vụ" cho một ID ảo!'
      ).to.include('Không thể xóa');
    });
  });

});
