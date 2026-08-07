package com.swp.horseracing.service;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;
import com.swp.horseracing.dto.RefereeNonStarterRequestDTO;
import com.swp.horseracing.dto.RefereeWeighingRequestDTO;
import com.swp.horseracing.dto.RegistrationResponseDTO;
import java.util.List;

public interface RefereeService {
    String submitRaceResult(RefereeResultRequestDTO request);
    String submitReport(RefereeReportRequestDTO request);
    List<java.util.Map<String, Object>> getAllReports();
    String declareNonStarter(RefereeNonStarterRequestDTO request);
    RegistrationResponseDTO recordWeighIn(RefereeWeighingRequestDTO request);
}
