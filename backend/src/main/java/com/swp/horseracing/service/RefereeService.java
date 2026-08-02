package com.swp.horseracing.service;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;

    // [Chức năng rõ ràng]: Interface Service Trọng tài
    // [Tác dụng]: Định nghĩa hàm nộp kết quả và nộp báo cáo.
    // [Hướng dẫn sửa đổi]:
    // - Logic: Thêm hàm để trọng tài sửa lại kết quả nếu nhập sai (trước khi chia thưởng).
public interface RefereeService {
    String submitRaceResult(RefereeResultRequestDTO request);
    String submitReport(RefereeReportRequestDTO request);
    java.util.List<java.util.Map<String, Object>> getAllReports();
}
