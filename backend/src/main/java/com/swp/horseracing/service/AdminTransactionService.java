package com.swp.horseracing.service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

    // [Chức năng rõ ràng]: Interface Service Quản lý Giao dịch (Admin)
    // [Tác dụng]: Định nghĩa các hàm lấy danh sách Nạp/Rút để Admin xem và phê duyệt.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm khai báo hàm xuất file Excel ở đây.
public interface AdminTransactionService {
    String completeWithdrawal(Integer transactionId, MultipartFile proofFile);
    Map<String, Object> getFinanceDashboard();
    String approveDeposit(Integer transactionId);
    String rejectDeposit(Integer transactionId);
}