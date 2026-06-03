package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.dto.PhotoImportResultDto;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.hrm.empinfo.service.HrEmployeeService;
import com.ait.hrm.empinfo.service.HrPersonalInfoService;
import com.ait.hrm.empinfo.service.HrPhotoImportService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class HrPhotoImportServiceImpl implements HrPhotoImportService {

    private static final Logger log = LoggerFactory.getLogger(HrPhotoImportServiceImpl.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final int TARGET_WIDTH  = 600;
    private static final int TARGET_HEIGHT = 800;

    @Value("${app.photo.upload.path:./assets/images/users}")
    private String photoUploadPath;

    @Autowired
    private HrEmployeeService hrEmployeeService;

    @Autowired
    private HrPersonalInfoService hrPersonalInfoService;

    @Override
    public List<PhotoImportResultDto> validatePhotos(MultipartFile[] files) {
        List<PhotoImportResultDto> results = new ArrayList<>();
        if (files == null) return results;
        for (MultipartFile file : files) {
            results.add(validateSinglePhoto(file));
        }
        return results;
    }

    @Override
    @Transactional
    public List<PhotoImportResultDto> savePhotos(MultipartFile[] files) {
        List<PhotoImportResultDto> results = new ArrayList<>();
        if (files == null) return results;

        Path uploadDir = Paths.get(photoUploadPath).toAbsolutePath();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("Không thể tạo thư mục upload: {}", uploadDir, e);
        }

        for (MultipartFile file : files) {
            PhotoImportResultDto validated = validateSinglePhoto(file);
            if (!validated.isSuccess()) {
                results.add(validated);
                continue;
            }

            try {
                String empId = validated.getEmpId();
                // Luôn lưu dưới dạng jpg sau khi resize
                String savedFileName = empId + ".jpg";

                // Xoá file cũ với bất kỳ extension nào
                for (String allowedExt : ALLOWED_EXTENSIONS) {
                    Files.deleteIfExists(uploadDir.resolve(empId + "." + allowedExt));
                }

                Path targetPath = uploadDir.resolve(savedFileName);
                Files.write(targetPath, resizeToJpeg(file));

                String photoPath = "/assets/images/users/" + savedFileName;
                HrPersonalInfo info = new HrPersonalInfo(validated.getPersonId());
                info.setPhotoPath(photoPath);
                hrPersonalInfoService.updatePersonalInfo(info);

                results.add(PhotoImportResultDto.builder()
                        .fileName(file.getOriginalFilename())
                        .empId(empId)
                        .personId(validated.getPersonId())
                        .localName(validated.getLocalName())
                        .success(true)
                        .build());

            } catch (Exception e) {
                log.error("Lỗi khi lưu ảnh {}: {}", file.getOriginalFilename(), e.getMessage(), e);
                results.add(PhotoImportResultDto.builder()
                        .fileName(file.getOriginalFilename())
                        .empId(validated.getEmpId())
                        .success(false)
                        .errorMessage("Lưu file thất bại: " + e.getMessage())
                        .build());
            }
        }
        return results;
    }

    private PhotoImportResultDto validateSinglePhoto(MultipartFile file) {
        String fileName = file.getOriginalFilename();

        String ext = getExtension(fileName);
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            return PhotoImportResultDto.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Định dạng file không hợp lệ, chỉ chấp nhận .jpg, .jpeg, .png")
                    .build();
        }

        String nameWithoutExt = getNameWithoutExtension(fileName);
        HrEmployee employee = findEmployeeFromFileName(nameWithoutExt);

        if (employee == null) {
            return PhotoImportResultDto.builder()
                    .fileName(fileName)
                    .success(false)
                    .errorMessage("Không tìm thấy nhân viên với mã trích từ tên file: \"" + nameWithoutExt + "\"")
                    .build();
        }

        return PhotoImportResultDto.builder()
                .fileName(fileName)
                .empId(employee.getEmpId())
                .personId(employee.getPersonId())
                .localName(employee.getLocalName())
                .success(true)
                .build();
    }

    /**
     * Thử tìm nhân viên từ tên file (không có extension).
     * Ưu tiên thử toàn bộ tên trước, sau đó thử từng phần tách bởi _, -, khoảng trắng.
     */
    private HrEmployee findEmployeeFromFileName(String nameWithoutExt) {
        if (nameWithoutExt == null || nameWithoutExt.isEmpty()) return null;

        // Thử toàn bộ tên file (uppercase)
        HrEmployee emp = tryFindByEmpId(nameWithoutExt.toUpperCase());
        if (emp != null) return emp;

        // Thử từng phần tách bởi ký tự đặc biệt
        String[] parts = nameWithoutExt.split("[_\\-\\s]+");
        for (String part : parts) {
            if (part.isEmpty()) continue;
            emp = tryFindByEmpId(part.toUpperCase());
            if (emp != null) return emp;
        }

        return null;
    }

    private HrEmployee tryFindByEmpId(String empId) {
        try {
            return hrEmployeeService.findByEmpId(empId);
        } catch (Exception e) {
            log.debug("Không tìm thấy nhân viên với empId={}: {}", empId, e.getMessage());
            return null;
        }
    }

    /**
     * Resize ảnh về đúng 600x800px theo kiểu center-crop (giữ tỉ lệ, cắt phần thừa),
     * chuyển nền trong suốt (PNG) thành trắng, xuất ra bytes JPEG chất lượng 85%.
     */
    private byte[] resizeToJpeg(MultipartFile file) throws IOException {
        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) throw new IOException("Không thể đọc dữ liệu ảnh từ file: " + file.getOriginalFilename());

        int srcW = original.getWidth();
        int srcH = original.getHeight();

        // Scale để ảnh "cover" đủ 600x800 (không bị kéo dãn)
        double scale = Math.max((double) TARGET_WIDTH / srcW, (double) TARGET_HEIGHT / srcH);
        int scaledW = (int) Math.round(srcW * scale);
        int scaledH = (int) Math.round(srcH * scale);

        // Dùng TYPE_INT_RGB để tự động loại bỏ alpha (PNG trong suốt → nền trắng)
        BufferedImage scaled = new BufferedImage(scaledW, scaledH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setColor(java.awt.Color.WHITE);
        g.fillRect(0, 0, scaledW, scaledH);
        g.drawImage(original, 0, 0, scaledW, scaledH, null);
        g.dispose();

        // Center crop về đúng 600x800
        int cropX = (scaledW - TARGET_WIDTH) / 2;
        int cropY = (scaledH - TARGET_HEIGHT) / 2;
        BufferedImage cropped = scaled.getSubimage(cropX, cropY, TARGET_WIDTH, TARGET_HEIGHT);

        // Ghi ra JPEG quality 85%
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(0.85f);
        try (javax.imageio.stream.ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(cropped, null, null), param);
        } finally {
            writer.dispose();
        }
        return baos.toByteArray();
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    private String getNameWithoutExtension(String fileName) {
        if (fileName == null) return "";
        int dotIdx = fileName.lastIndexOf('.');
        return dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName;
    }
}
