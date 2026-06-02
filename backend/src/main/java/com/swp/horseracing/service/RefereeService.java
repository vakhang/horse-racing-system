package com.swp.horseracing.service;

import com.swp.horseracing.dto.RefereeReportRequestDTO;
import com.swp.horseracing.dto.RefereeResultRequestDTO;

public interface RefereeService {
    String submitRaceResult(RefereeResultRequestDTO request);
    String submitReport(RefereeReportRequestDTO request);
}
