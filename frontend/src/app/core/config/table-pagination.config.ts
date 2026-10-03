/**
 * Cấu hình phân trang dùng chung cho TẤT CẢ nz-table trong dự án.
 *
 * NG-ZORRO không hỗ trợ cấu hình nzPageSizeOptions qua NzConfig (global) cho nz-table,
 * nên giá trị được khai báo tập trung tại đây và mỗi component chỉ cần tham chiếu lại:
 *
 *   readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
 *   readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;
 *
 *   <nz-table [nzPageSize]="defaultPageSize" [nzPageSizeOptions]="pageSizeOptions" ...>
 *
 * nzShowSizeChanger được bật global qua provideNzConfig trong app.config.ts.
 * Muốn đổi danh sách số dòng/trang cho toàn hệ thống chỉ cần sửa tại file này.
 */
export const TABLE_PAGE_SIZE_OPTIONS: number[] = [25, 50, 100, 200, 500];

/** Số dòng/trang mặc định (phần tử đầu tiên của TABLE_PAGE_SIZE_OPTIONS). */
export const TABLE_DEFAULT_PAGE_SIZE: number = TABLE_PAGE_SIZE_OPTIONS[0];
