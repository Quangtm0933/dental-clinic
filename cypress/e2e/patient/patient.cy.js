describe('Quản lý Bệnh nhân - Dental Clinic Management', () => {
  const dashboardUrl = 'http://localhost/dental-clinic/public/dashboard.html'


  const patientsData = [
    {
      id: 1,
      full_name: 'Nguyễn Văn Anh',
      phone: '0901111111',
      dob: '1999-01-01',
      address: 'Hà Nội',
      medical_history: 'Không có'
    },
    {
      id: 2,
      full_name: 'Trần Thị Bé',
      phone: '0902222222',
      dob: '2000-02-02',
      address: 'Hồ Chí Minh',
      medical_history: 'Dị ứng thuốc tê'
    }
  ]


  beforeEach(() => {
    cy.intercept('GET', '**/api/patients*', {
      statusCode: 200,
      body: {
        status: 'success',
        data: patientsData
      }
    }).as('loadPatients')


    cy.visit(dashboardUrl, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw')
        win.localStorage.setItem('role', 'ADMIN')
        win.localStorage.setItem('fullName', 'Quản Trị Viên')
      }
    })


    cy.contains('Bệnh nhân', { matchCase: false }).click()
    cy.wait('@loadPatients')
    cy.get('#tblPatients', { timeout: 8000 }).should('be.visible')
  })


  // ==============================
  // 1. XEM DANH SÁCH BỆNH NHÂN
  // ==============================


  it('TC_PAT_VIEW_01 - Mở trang Quản lý Bệnh nhân thành công', () => {
    cy.contains('Quản lý Bệnh nhân').should('be.visible')
    cy.contains('Thêm Bệnh nhân', { matchCase: false }).should('be.visible')
    cy.get('#tblPatients').should('be.visible')
  })


  it('TC_PAT_VIEW_02 - Hiển thị danh sách bệnh nhân', () => {
    cy.contains('Nguyễn Văn Anh').should('be.visible')
    cy.contains('Trần Thị Bé').should('be.visible')
    cy.contains('0901111111').should('be.visible')
    cy.contains('0902222222').should('be.visible')
  })


  // ==============================
  // 2. THÊM BỆNH NHÂN
  // ==============================


  it('TC_PAT_ADD_01 - Thêm bệnh nhân với đầy đủ dữ liệu hợp lệ', () => {
    cy.intercept('POST', '**/api/patients*', {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Đã thêm bệnh nhân mới thành công!'
      }
    }).as('addPatient')


    cy.on('window:alert', (text) => {
      expect(text).to.include('Đã thêm bệnh nhân mới thành công')
    })


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()
    cy.get('#patientModal').should('have.class', 'active')


    cy.get('#p_full_name').type('Trần Văn B')
    cy.get('#p_phone').type('0912345678')
    cy.get('#p_dob').type('1990-05-15')
    cy.get('#p_address').type('Hà Nội')
    cy.get('#p_history').type('Dị ứng thuốc tê')


    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addPatient').then((interception) => {
      expect(interception.request.body.full_name).to.eq('Trần Văn B')
      expect(interception.request.body.phone).to.eq('0912345678')
      expect(interception.request.body.dob).to.eq('1990-05-15')
      expect(interception.request.body.address).to.eq('Hà Nội')
      expect(interception.request.body.medical_history).to.eq('Dị ứng thuốc tê')
    })
  })


  it('TC_PAT_ADD_02 - Bỏ trống Họ và Tên', () => {
    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_phone').type('0912345678')
    cy.get('#patientForm button[type="submit"]').click()


    cy.get('#p_full_name:invalid').should('exist')
  })


  it('TC_PAT_ADD_03 - Bỏ trống Số điện thoại', () => {
    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Trần Văn B')
    cy.get('#patientForm button[type="submit"]').click()


    cy.get('#p_phone:invalid').should('exist')
  })


  it('TC_PAT_ADD_04 - Chỉ nhập Họ tên và SĐT, bỏ trống trường không bắt buộc', () => {
    cy.intercept('POST', '**/api/patients*', {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Đã thêm bệnh nhân mới thành công!'
      }
    }).as('addPatientRequiredOnly')


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Lê Thị C')
    cy.get('#p_phone').type('0988777666')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addPatientRequiredOnly').then((interception) => {
      expect(interception.request.body.full_name).to.eq('Lê Thị C')
      expect(interception.request.body.phone).to.eq('0988777666')
    })
  })


  // ==============================
  // 3. CẬP NHẬT BỆNH NHÂN
  // ==============================


  it('TC_PAT_UPD_01 - Cập nhật dữ liệu hợp lệ', () => {
    cy.intercept('PUT', '**/api/patients/*', {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Đã cập nhật thông tin bệnh nhân!'
      }
    }).as('updatePatient')


    cy.on('window:alert', (text) => {
      expect(text).to.include('Đã cập nhật thông tin bệnh nhân')
    })


    cy.get('#tblPatients').find('.fa-pen').first().click()


    cy.get('#patientModal').should('have.class', 'active')
    cy.get('#p_full_name').should('not.have.value', '')


    cy.get('#p_phone').clear().type('0999999999')
    cy.get('#p_address').clear().type('Đà Nẵng')


    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@updatePatient').then((interception) => {
      expect(interception.request.body.phone).to.eq('0999999999')
      expect(interception.request.body.address).to.eq('Đà Nẵng')
    })
  })


  it('TC_PAT_UPD_02 - Xóa rỗng Họ và Tên khi cập nhật', () => {
    cy.get('#tblPatients').find('.fa-pen').first().click()


    cy.get('#p_full_name').clear()
    cy.get('#patientForm button[type="submit"]').click()


    cy.get('#p_full_name:invalid').should('exist')
  })


  it('TC_PAT_UPD_03 - Xóa rỗng Số điện thoại khi cập nhật', () => {
    cy.get('#tblPatients').find('.fa-pen').first().click()


    cy.get('#p_phone').clear()
    cy.get('#patientForm button[type="submit"]').click()


    cy.get('#p_phone:invalid').should('exist')
  })


  // ==============================
  // 4. XÓA BỆNH NHÂN
  // ==============================


  it('TC_PAT_DEL_01 - Xóa thành công bệnh nhân chưa có hóa đơn', () => {
    cy.on('window:confirm', () => true)


    cy.on('window:alert', (text) => {
      expect(text).to.include('Đã xóa thành công')
    })


    cy.intercept('DELETE', '**/api/patients/*', {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Đã xóa thành công!'
      }
    }).as('deletePatient')


    cy.get('#tblPatients').find('.fa-trash').first().click()


    cy.wait('@deletePatient')
    cy.get('#tblPatients').should('be.visible')
  })


  it('TC_PAT_DEL_02 - Nhấn Cancel khi xác nhận xóa', () => {
    cy.on('window:confirm', () => false)


    cy.get('#tblPatients').find('.fa-trash').first().click()


    cy.contains('Nguyễn Văn Anh').should('be.visible')
    cy.contains('Trần Thị Bé').should('be.visible')
  })


  it('TC_PAT_DEL_03 - Không cho xóa bệnh nhân đã có hóa đơn', () => {
    cy.on('window:confirm', () => true)


    cy.on('window:alert', (text) => {
      expect(text).to.include('Không thể xóa')
    })


    cy.intercept('DELETE', '**/api/patients/*', {
      statusCode: 500,
      body: {
        status: 'error',
        message: 'Không thể xóa. Mục này có thể đang được sử dụng trong hóa đơn.'
      }
    }).as('deletePatientFail')


    cy.get('#tblPatients').find('.fa-trash').first().click()


    cy.wait('@deletePatientFail')
  })


  // ==============================
  // 5. TÌM KIẾM BỆNH NHÂN
  // ==============================


  it('TC_PAT_SEARCH_01 - Tìm kiếm theo một phần Họ tên', () => {
    cy.get('input[placeholder*="Tìm theo tên"]').clear().type('Nguyễn')


    cy.contains('Nguyễn Văn Anh').should('be.visible')
    cy.contains('Trần Thị Bé').should('not.be.visible')
  })


  it('TC_PAT_SEARCH_02 - Tìm kiếm theo Số điện thoại', () => {
    cy.get('input[placeholder*="Tìm theo tên"]').clear().type('0902222222')


    cy.contains('Trần Thị Bé').should('be.visible')
    cy.contains('Nguyễn Văn Anh').should('not.be.visible')
  })


  it('TC_PAT_SEARCH_03 - Tìm kiếm không phân biệt chữ hoa/thường', () => {
    cy.get('input[placeholder*="Tìm theo tên"]').clear().type('TRẦN')


    cy.contains('Trần Thị Bé').should('be.visible')
    cy.contains('Nguyễn Văn Anh').should('not.be.visible')
  })


  it('TC_PAT_SEARCH_04 - Tìm kiếm từ khóa không tồn tại', () => {
    cy.get('input[placeholder*="Tìm theo tên"]').clear().type('xyz999')


    cy.contains('Nguyễn Văn Anh').should('not.be.visible')
    cy.contains('Trần Thị Bé').should('not.be.visible')
  })


  it('TC_PAT_SEARCH_05 - Xóa trắng ô tìm kiếm thì hiển thị lại toàn bộ danh sách', () => {
    cy.get('input[placeholder*="Tìm theo tên"]').clear().type('Nguyễn')


    cy.contains('Trần Thị Bé').should('not.be.visible')


    cy.get('input[placeholder*="Tìm theo tên"]').clear()


    cy.contains('Nguyễn Văn Anh').should('be.visible')
    cy.contains('Trần Thị Bé').should('be.visible')
  })


  // ==============================
  // 6. BUG REPORT - BẮT LỖI BACKEND
  // Các test này có thể FAIL đỏ nếu hệ thống thiếu validate.
  // Chụp màn hình FAIL để đưa vào báo cáo lỗi.
  // ==============================


  it('BUG_PAT_01 - Backend phải từ chối Họ tên chứa chữ số', () => {
    cy.intercept('POST', '**/api/patients*').as('addInvalidName')


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Nguyễn Văn 12345')
    cy.get('#p_phone').type('0912345678')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addInvalidName').then((interception) => {
      expect(interception.response.statusCode).to.eq(400)
    })
  })


  it('BUG_PAT_02 - Backend phải từ chối SĐT chứa chữ cái và ký tự đặc biệt', () => {
    cy.intercept('POST', '**/api/patients*').as('addInvalidPhone')


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Bệnh Nhân Test SĐT')
    cy.get('#p_phone').type('09A!@abc')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addInvalidPhone').then((interception) => {
      expect(interception.response.statusCode).to.eq(400)
    })
  })


  it('BUG_PAT_03 - Backend phải từ chối Ngày sinh ở tương lai', () => {
    cy.intercept('POST', '**/api/patients*').as('addFutureDob')


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Em Bé Tương Lai')
    cy.get('#p_phone').type('0912345678')
    cy.get('#p_dob').type('2050-01-01')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addFutureDob').then((interception) => {
      expect(interception.response.statusCode).to.eq(400)
    })
  })


  it('BUG_PAT_04 - Backend phải từ chối Họ tên vượt quá 100 ký tự', () => {
    cy.intercept('POST', '**/api/patients*').as('addLongName')


    const overLimitName = 'A'.repeat(101)


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type(overLimitName, { delay: 0 })
    cy.get('#p_phone').type('0912345678')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addLongName').then((interception) => {
      expect(interception.response.statusCode).to.eq(400)
    })
  })


  it('BUG_PAT_05 - Backend phải từ chối SĐT vượt quá 10 chữ số', () => {
    cy.intercept('POST', '**/api/patients*').as('addLongPhone')


    cy.contains('Thêm Bệnh nhân', { matchCase: false }).click()


    cy.get('#p_full_name').type('Bệnh Nhân Test Độ Dài')
    cy.get('#p_phone').type('09123456789')
    cy.get('#patientForm button[type="submit"]').click()


    cy.wait('@addLongPhone').then((interception) => {
      expect(interception.response.statusCode).to.eq(400)
    })
  })
})
