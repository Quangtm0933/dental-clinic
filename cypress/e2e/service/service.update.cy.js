describe('Quản lý Dịch vụ & Bảng giá - Test chức năng Cập nhật Dịch vụ', () => {

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

  it('01 - Cập nhật hợp lệ', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_name').clear().type('Trám răng Laser cao cấp');
    cy.get('#s_price').clear().type('450000');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', 'Trám răng Laser cao cấp');
  });

  it('02 - Thay đổi trạng thái sang Ngừng kinh doanh', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_active').uncheck();
    cy.get('#serviceForm button[type="submit"]').click();
    
    // Sửa 'Ngừng kinh doanh' thành 'NGỪNG' cho đúng với giao diện hiển thị
    cy.get('#tblServices').then(($tbody) => {
      expect($tbody.text(), '🚨 BUG EXPOSED: Trạng thái dịch vụ không chuyển sang chữ NGỪNG sau khi đã bỏ tích chọn đang kinh doanh!').to.contain('NGỪNG');
    });
  });

  it('03 - Tên dịch vụ rỗng', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_name').clear();
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#s_name:invalid').should('exist');
  });

  it('04 - Giá rỗng', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_price').clear();
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#s_price:invalid').should('exist');
  });

  it('05 - Giá bằng 0 (biên lỗi)', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_price').clear().type('0');

    // 1. Đặt bẫy bắt alert
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('#serviceForm button[type="submit"]').click();
    
    // 2. Ép kiểm tra alert và gắn thông báo lỗi
    cy.then(() => {
      expect(alertStub, '🚨 BUG EXPOSED: Hệ thống im lặng, không bật alert cảnh báo khi cập nhật đơn giá bằng 0!').to.be.calledOnce;
      
      expect(alertStub.getCall(0).args[0]).to.include(
        'Tên dịch vụ và Đơn giá là bắt buộc',
        '🚨 BUG EXPOSED: Nội dung alert báo lỗi không đúng với đặc tả khi giá bằng 0!'
      );
    });
  });

 it('06 - Giá âm (bug nghiệp vụ, test FAIL)', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_price').clear().type('-100000');
    cy.get('#serviceForm button[type="submit"]').click();
    
    // KHẮC PHỤC: Ép Cypress đứng chờ 1 giây để API lưu và tải lại bảng xong
    cy.wait(1000);
    
    // Sau 1 giây, bảng đã có dữ liệu mới, lúc này mới tiến hành kiểm tra
    cy.get('#tblServices').then(($tbody) => {
      const isExist = $tbody.text().includes('-100000');
      
      expect(isExist, '🚨 BUG EXPOSED: Backend không chặn giá trị âm khi Cập nhật, giá âm đã lọt xuống DB và hiện lên bảng!').to.be.false;
    });
  });

  it('07 - Tên dịch vụ 1 ký tự', () => {
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_name').clear().type('A');
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', 'A');
  });

  it('08 - Tên dịch vụ 100 ký tự', () => {
    const longName = 'X'.repeat(100);
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_name').clear().type(longName);
    cy.get('#serviceForm button[type="submit"]').click();
    cy.get('#tblServices').should('contain', longName);
  });

 it('09 - Tên dịch vụ 101 ký tự (biên lỗi)', () => {
    const tooLongName = 'X'.repeat(101);
    cy.get('#tblServices').find('.fa-pen').first().click();
    cy.get('#s_name').clear().type(tooLongName);

    // 1. Đặt bẫy bắt alert
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('#serviceForm button[type="submit"]').click();
    
    // 2. Ép kiểm tra alert và gắn thông báo lỗi
    cy.then(() => {
      expect(alertStub, '🚨 BUG EXPOSED: Hệ thống lọt lưới, không bật alert cảnh báo khi cập nhật tên dịch vụ vượt giới hạn 100 ký tự!').to.be.calledOnce;
      
      expect(alertStub.getCall(0).args[0]).to.include(
        'Tên dịch vụ vượt quá độ dài cho phép',
        '🚨 BUG EXPOSED: Nội dung alert cảnh báo sai hoặc không khớp với lỗi giới hạn ký tự!'
      );
    });
  });

});

