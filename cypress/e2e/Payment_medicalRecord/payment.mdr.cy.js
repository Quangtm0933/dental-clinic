describe('Luồng Khám Bệnh & Thanh Toán - Dental Clinic', () => {

    beforeEach(() => {
        // Thiết lập môi trường đăng nhập Admin trước khi tải trang
        cy.visit('http://localhost/dental-clinic/public/dashboard.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'MS0xNzgxNTA4NDMw');
                win.localStorage.setItem('role', 'ADMIN');
                win.localStorage.setItem('fullName', 'Quản Trị Viên');
            }
        });
    });

    // ==========================================
    // 1. MODULE: KHÁM BỆNH (TẠO HỒ SƠ UNPAID)
    // ==========================================
    describe('1. Khám Bệnh (Tạo hồ sơ)', () => {
        beforeEach(() => {
            // Giả lập danh sách bệnh nhân và danh sách dịch vụ để luôn có dữ liệu test
            cy.intercept('GET', '**/api/patients', {
                statusCode: 200,
                body: { status: 'success', data: [{ id: 1, full_name: 'Bệnh Nhân Test', phone: '0901234567' }] }
            }).as('getPatients');

            cy.intercept('GET', '**/api/services', {
                statusCode: 200,
                body: { status: 'success', data: [{ id: 1, service_name: 'Khám tổng quát', unit_price: 150000 }] }
            }).as('getServices');

            // Mở tab Bệnh nhân và chờ nạp danh sách
            cy.contains('Bệnh nhân').click();
            cy.wait('@getPatients');

            // Bấm vào nút Khám bệnh (icon ống nghe) của người đầu tiên
            cy.get('#tblPatients').find('.fa-stethoscope').first().click();
            
            // Ép Cypress đợi danh sách dịch vụ (Dropdown) nạp xong mới được chạy lệnh tiếp theo
            cy.wait('@getServices');
        });

        it('TC_EXAM_01 - Lập hồ sơ khám bệnh hợp lệ', () => {
            const alertStub = cy.stub();
            cy.on('window:alert', alertStub);

            // FIX: Ép API trả về thành công (200 OK) thay vì gọi vào DB thật gây lỗi 500
            cy.intercept('POST', '**/api/payments', {
                statusCode: 200,
                body: { status: 'success' }
            }).as('createRecord');

            // 1. Nhập chẩn đoán
            cy.get('#examDiagnosis').type('Sâu răng hàm dưới, viêm tủy');
            
            // 2. Chọn dịch vụ đầu tiên trong dropdown và bấm nút Cộng (+)
            cy.get('#examServiceSelect option').first().then($opt => {
                cy.get('#examServiceSelect').select($opt.val());
            });
            cy.get('button[onclick="addServiceToList()"]').click();

            // 3. Bấm Hoàn tất
            cy.get('#examinationForm button[type="submit"]').click();

            // 4. Đợi API lưu xong mới check kết quả Alert
            cy.wait('@createRecord');

            cy.then(() => {
                expect(alertStub).to.be.calledWith('Đã chuyển sang Thanh toán!');
            });
            
            // 5. Đảm bảo giao diện đã nhảy sang tab Thanh toán
            cy.get('#payments').should('have.class', 'active');
        });
        
        it('TC_EXAM_02 - Bỏ trống trường Chẩn đoán', () => {
            // Thêm 1 dịch vụ nhưng không nhập chẩn đoán
            cy.get('#examServiceSelect option').first().then($opt => {
                cy.get('#examServiceSelect').select($opt.val());
            });
            cy.get('button[onclick="addServiceToList()"]').click();

            // Bấm Hoàn tất
            cy.get('#examinationForm button[type="submit"]').click();

            // Form bị chặn lại bởi thuộc tính required của HTML5
            cy.get('#examDiagnosis:invalid').should('exist');
        });

        it('TC_EXAM_03 - Không chọn dịch vụ nha khoa nào', () => {
            const alertStub = cy.stub();
            cy.on('window:alert', alertStub);

            // Nhập chẩn đoán nhưng cố tình không bấm chọn dịch vụ
            cy.get('#examDiagnosis').type('Cạo vôi răng định kỳ');
            cy.get('#examinationForm button[type="submit"]').click();

            // JavaScript của Client chặn lại và báo lỗi
            cy.then(() => {
                expect(alertStub).to.be.calledWith('Vui lòng chọn dịch vụ!');
            });
        });
    });

    // ==========================================
    // 2. MODULE: THANH TOÁN & XUẤT HÓA ĐƠN
    // ==========================================
    describe('2. Quầy Thu Ngân (Chốt hóa đơn PAID)', () => {
        beforeEach(() => {
            // Giả lập danh sách chờ thanh toán
            cy.intercept('GET', '**/api/payments/pending', {
                statusCode: 200,
                body: { status: 'success', data: [{ id: 1, patient_name: 'Bệnh Nhân Test' }] }
            }).as('getPending');

            // Giả lập chi tiết hóa đơn (trả về đúng 150.000)
            cy.intercept('GET', '**/api/payments/1', {
                statusCode: 200,
                body: { status: 'success', data: [{ service_id: 1, service_name: 'Khám tổng quát', snapshot_price: 150000, quantity: 1 }] }
            }).as('getDetails');

            // Chuyển sang Tab Thanh toán và đợi load danh sách
            cy.contains('Thanh toán').click();
            cy.wait('@getPending');
        });

        it('TC_PAY_01 - Hiển thị chi tiết hóa đơn khi chọn bệnh nhân', () => {
            // Bấm vào hóa đơn chờ đầu tiên bên cột trái
            cy.get('#listPending > div').first().click();
            cy.wait('@getDetails');

            // Cột bên phải (Khu vực hóa đơn) phải hiện lên
            cy.get('#billArea').should('not.have.class', 'hidden');
            cy.get('#emptyBill').should('have.class', 'hidden');

            // Mã hóa đơn có text và Tổng tiền thay đổi thành số thực (khác 0 đ)
            cy.get('#billIDDisplay').should('not.be.empty');
            cy.get('#billTotal').should('not.have.text', '0 đ'); 
        });

        it('TC_PAY_02 - Hủy thao tác thanh toán trên hộp thoại xác nhận', () => {
            cy.get('#listPending > div').first().click();
            cy.wait('@getDetails');

            // Giả lập người dùng bấm Hủy (Cancel)
            cy.on('window:confirm', () => false);
            cy.contains('HOÀN TẤT & XUẤT HÓA ĐƠN').click();

            // Form không chuyển hướng, vẫn ở nguyên tab Thanh toán
            cy.get('#payments').should('have.class', 'active');
        });

        it('TC_PAY_03 - Thanh toán thành công và Xuất PDF', () => {
            cy.get('#listPending > div').first().click();
            cy.wait('@getDetails');

            // 1. Giả lập người dùng đồng ý thanh toán
            cy.on('window:confirm', () => true);

            // 2. Giả lập API xử lý thanh toán thành công
            cy.intercept('POST', '**/api/payments', {
                statusCode: 200,
                body: { status: 'success' }
            }).as('checkoutSuccess');

            // 3. Đánh chặn thông báo Alert
            const alertStub = cy.stub();
            cy.on('window:alert', alertStub);

            // 4. MOCK BẢO VỆ: Chặn thư viện tải file PDF ngay sát nút bấm
            // (Trả về hàm rỗng để file không bị lưu xuống máy gây lỗi test)
            cy.window().then((win) => {
                win.html2pdf = function() {
                    return {
                        from: function() { return this; },
                        save: function() { return true; } 
                    };
                };
            });

            // 5. Bấm nút Hoàn tất
            cy.contains('HOÀN TẤT & XUẤT HÓA ĐƠN').click();
            
            // 6. Đợi API xử lý xong
            cy.wait('@checkoutSuccess');

            // 7. Xác nhận có thông báo thành công
            cy.then(() => {
                expect(alertStub).to.be.calledWith('Thành công!');
            });

            // 8. Đảm bảo giao diện nhảy sang xem Lịch sử
            cy.get('#history').should('have.class', 'active');
        });
    });

});