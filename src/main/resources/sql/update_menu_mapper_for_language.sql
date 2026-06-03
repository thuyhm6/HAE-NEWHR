-- Script cập nhật MenuMapper.xml để hỗ trợ ngôn ngữ động
-- Thay đổi 'vi' thành tham số để có thể truyền ngôn ngữ từ session

-- Cập nhật MenuMapper.xml để sử dụng tham số language thay vì hardcode 'vi'
-- Thay đổi: gn.language = 'vi' thành gn.language = #{language}

-- Ví dụ sử dụng trong Controller:
-- List<MenuDTO> userMenus = menuService.getMenusByUserPermission(currentHrUser.getSyUser().getUserNo(), "vi");

-- Hoặc lấy từ session:
-- String language = (String) session.getAttribute("language");
-- if (language == null) language = "vi"; // default
-- List<MenuDTO> userMenus = menuService.getMenusByUserPermission(currentHrUser.getSyUser().getUserNo(), language);

