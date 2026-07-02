describe('Quản lý Dịch vụ & Bảng giá - Test chức năng Thêm Dịch vụ', () => {

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

  // ==========================================
  // BỘ TEST CASE CHO CHỨC NĂNG THÊM DỊCH VỤ
  // ==========================================

  it('01 - Thêm dịch vụ hợp lệ', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Cạo vôi răng cấp độ 1');
    cy.get('#s_price').type('350000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', 'Cạo vôi răng cấp độ 1');
  });

  it('02 - Tên dịch vụ rỗng', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_price').type('500000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#s_name:invalid').should('exist');
  });

  it('03 - Giá rỗng', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Nhổ răng khôn');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#s_price:invalid').should('exist');
  });

 it('04 - Giá bằng 0 (biên lỗi)', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Tẩy trắng răng siêu tốc');
    cy.get('#s_price').type('0');

    // Đặt bẫy bắt alert chủ động
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('#serviceForm button[type="submit"]').click();

    // Ép Cypress kiểm tra xem alert có được gọi không
    cy.then(() => {
      expect(alertStub, '🚨 BUG EXPOSED: Giao diện hoàn toàn im lặng, không bật alert cảnh báo khi đơn giá bằng 0!').to.be.calledOnce;
      expect(alertStub.getCall(0).args[0]).to.equal('Tên dịch vụ và Đơn giá là bắt buộc!');
    });
  });

  it('05 - Giá chứa chữ cái', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Chữa tủy răng');
    cy.get('#s_price').type('abc');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#s_price:invalid').should('exist');
  });

  it('06 - Giá âm (bug nghiệp vụ, test FAIL)', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Phẫu thuật Implant');
    cy.get('#s_price').type('-50000');
    cy.get('#serviceForm button[type="submit"]').click();

    // Dùng cách này để kiểm tra Đúng/Sai, không bị in cả bảng ra màn hình
    cy.get('#tblServices').should(($tbody) => {
      const isExist = $tbody.text().includes('Phẫu thuật Implant');
      
      expect(isExist, '🚨 BUG EXPOSED: Hệ thống vẫn lưu thành công vào cơ sở dữ liệu và hiển thị dịch vụ có Đơn giá âm lên danh sách bảng!').to.be.false;
    });
  });

  it('07 - Tên dịch vụ trùng', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('Cạo vôi răng cấp độ 1'); // đã tồn tại
    cy.get('#s_price').type('350000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.on('window:alert', (text) => {
      expect(text).to.include('Tên dịch vụ đã tồn tại');
    });
  });

  it('08 - Tên dịch vụ 1 ký tự (biên hợp lệ)', () => {
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type('A');
    cy.get('#s_price').type('100000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', 'A');
  });

  it('09 - Tên dịch vụ 100 ký tự (biên hợp lệ)', () => {
    const longName = 'X'.repeat(100);
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type(longName);
    cy.get('#s_price').type('200000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', longName);
  });

  it('10 - Tên dịch vụ 101 ký tự (biên lỗi)', () => {
    const tooLongName = 'X'.repeat(101);
    cy.contains('+ Thêm Dịch vụ').click();
    cy.get('#s_name').type(tooLongName);
    cy.get('#s_price').type('200000');

    // Đặt bẫy bắt alert chủ động
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('#serviceForm button[type="submit"]').click();
    
    // Ép Cypress kiểm tra xem alert có được gọi không
    cy.then(() => {
      expect(alertStub, '🚨 BUG EXPOSED: Hệ thống để lọt lưới, không bật alert cảnh báo khi tên dịch vụ dài 101 ký tự!').to.be.calledOnce;
      expect(alertStub.getCall(0).args[0]).to.include('Tên dịch vụ vượt quá độ dài cho phép');
    });
  });
 

});

