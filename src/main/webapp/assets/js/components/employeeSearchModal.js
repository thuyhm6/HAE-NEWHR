/**
 * Employee Search Modal - Reusable Component
 * Usage: EmployeeSearchModal.open(callback)
 * Updated to use DataTables for pagination and scrolling
 */

window.EmployeeSearchModal = {
    // Configuration
    config: {
        apiUrl: '/hrm/empinfo/api/employee/search',
        modalId: '#employeeSearchModal',
        tableId: '#employeeSearchTable',
        searchForm: {
            keyword: '#popupSearchKeyword',
            deptSearch: '#esm_deptSearch',
            empOffice: '#esm_empOffice'
        }
    },

    // Current callback function
    currentCallback: null,
    dataTable: null,
    selectedDeptCodes: [],
    deptTreeInitialized: false,

    // Open modal with callback, optionally pre-fill keyword
    open(callback, keyword) {
        this.currentCallback = callback;
        this.clear();
        if (keyword) {
            $(this.config.searchForm.keyword).val(keyword);
        }
        $(this.config.modalId).modal('show');

        // Adjust DataTable columns when modal is shown (fix width issues)
        $(this.config.modalId).off('shown.bs.modal').on('shown.bs.modal', () => {
            if (!this.deptTreeInitialized && typeof DeptTree !== 'undefined') {
                DeptTree.init(this.config.searchForm.deptSearch, (selectedCodes) => {
                    this.selectedDeptCodes = selectedCodes || [];
                });
                this.deptTreeInitialized = true;
            }
            if (this.dataTable) {
                this.dataTable.columns.adjust().draw();
            }
            this.search();
        });
    },

    // Clear search form
    clear() {
        $(this.config.searchForm.keyword).val('');
        $(this.config.searchForm.deptSearch).val('');
        $(this.config.searchForm.empOffice).val('');
        this.selectedDeptCodes = [];
        if (this.dataTable) {
            this.dataTable.clear().draw();
        }
    },

    // Initialize DataTable
    initDataTable() {
        if ($.fn.DataTable.isDataTable(this.config.tableId)) {
            this.dataTable = $(this.config.tableId).DataTable();
            return;
        }

        this.dataTable = $(this.config.tableId).DataTable({
            paging: true,
            searching: false, // Use custom search fields
            info: true,
            lengthChange: false,
            pageLength: 10,
            scrollY: '50vh', // Limit height to 50% of viewport height
            scrollCollapse: true,
            destroy: true, // Allow re-init
            language: {
                url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json"
            },
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    }
                },
                { data: 'empId', defaultContent: '' },
                { data: 'localName', defaultContent: '' },
                {
                    data: null,
                    defaultContent: '',
                    render: function (data, type, row) {
                        return row.deptName || row.deptNo || '';
                    }
                },
                { data: 'position', defaultContent: '' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).css('cursor', 'pointer');
                $(row).off('click').on('click', function () {
                    window.EmployeeSearchModal.selectEmployee(
                        data.personId,
                        data.empId,
                        data.localName,
                        data.deptNo,
                        data.position
                    );
                });
            }
        });
    },

    // Search employees
    search() {
        const searchData = {
            keyword: $(this.config.searchForm.keyword).val().trim(),
            empOffice: $(this.config.searchForm.empOffice).val() || ''
        };
        if (this.selectedDeptCodes && this.selectedDeptCodes.length > 0) {
            searchData.deptCodes = this.selectedDeptCodes;
        }

        $.ajax({
            url: this.config.apiUrl,
            type: 'GET',
            traditional: true,
            data: searchData,
            success: (response) => {
                this.populateTable(response);
            },
            error: (xhr, status, error) => {
                console.error('Error searching employees:', error);
                this.showError('Lỗi khi tìm kiếm nhân viên: ' + error);
            }
        });
    },

    // Populate table with search results
    populateTable(employees) {
        if (!this.dataTable) {
            this.initDataTable();
        }
        // Tự động chọn ngay nếu chỉ có đúng 1 kết quả
        if (employees && employees.length === 1) {
            var emp = employees[0];
            this.selectEmployee(emp.personId, emp.empId, emp.localName, emp.deptNo || emp.deptName, emp.position);
            return;
        }
        this.dataTable.clear().rows.add(employees).draw();
    },

    // Select employee and call callback
    selectEmployee(personId, empId, localName, deptNo, position) {
        const employee = {
            personId: personId,
            empId: empId,
            localName: localName,
            deptNo: deptNo,
            position: position
        };

        if (this.currentCallback && typeof this.currentCallback === 'function') {
            this.currentCallback(employee);
        }

        $(this.config.modalId).modal('hide');
        this.showSuccess('Đã chọn nhân viên: ' + empId);
    },

    // Show success message
    showSuccess(message) {
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(message);
        } else if (typeof toastr !== 'undefined') {
            toastr.success(message);
        }
    },

    // Show error message
    showError(message) {
        if (typeof showErrorMessage === 'function') {
            showErrorMessage(message);
        } else if (typeof toastr !== 'undefined') {
            toastr.error(message);
        }
    },

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    },

    getConfig() {
        return this.config;
    }
};

// Legacy functions
window.openEmployeeSearchModal = function (callback) {
    EmployeeSearchModal.open(callback);
};

window.clearEmployeeSearch = function () {
    EmployeeSearchModal.clear();
};

window.searchEmployees = function () {
    EmployeeSearchModal.search();
};

window.populateEmployeeTable = function (employees) {
    EmployeeSearchModal.populateTable(employees);
};

window.selectEmployee = function (personId, empId, localName, deptNo, position) {
    EmployeeSearchModal.selectEmployee(personId, empId, localName, deptNo, position);
};
