const fs = require('fs');
const path = require('path');

const betFile = path.join('d:', 'SWP', 'horse-racing-system', 'backend', 'src', 'main', 'java', 'com', 'swp', 'horseracing', 'service', 'impl', 'BetServiceImpl.java');
let betText = fs.readFileSync(betFile, 'utf8');

const placeBetRegex = /public BetResponseDTO placeBet\(BetRequestDTO request\) \{[\s\S]*?(?=Wallet wallet = walletRepository\.findByUserId\(spectator\.getId\(\)\))/;

const limitLogic = `public BetResponseDTO placeBet(BetRequestDTO request) {
        User spectator = userRepository.findById(request.getSpectatorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khán giả!"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chặng đua!"));

        if (race.getStatus() != RaceStatus.BETTING) {
            throw new RuntimeException("Chặng đua hiện không trong trạng thái nhận cược!");
        }

        Registration reg1 = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa 1!"));

        Registration reg2 = null;
        if (request.getRegistrationId2() != null) {
            reg2 = registrationRepository.findById(request.getRegistrationId2())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ngựa 2!"));
        }

        // TÍNH TỔNG CƯỢC TRONG NGÀY ĐỂ CHECK LIMIT 1 TRIỆU
        java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate().atStartOfDay();
        
        java.math.BigDecimal totalBetToday = betRepository.findBySpectatorId(spectator.getId()).stream()
            .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(startOfDay))
            .filter(b -> b.getStatus() != com.swp.horseracing.model.BetStatus.REFUNDED && b.getStatus() != com.swp.horseracing.model.BetStatus.CANCELED)
            .map(com.swp.horseracing.model.Bet::getAmount)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
        if (totalBetToday.add(request.getAmount()).compareTo(new java.math.BigDecimal("1000000")) > 0) {
            throw new RuntimeException("Bạn đã vượt quá hạn mức cược tối đa 1.000.000 VNĐ/ngày!");
        }

        `;

if (betText.match(placeBetRegex)) {
    betText = betText.replace(placeBetRegex, limitLogic);
    fs.writeFileSync(betFile, betText, 'utf8');
    console.log("Injected 1M limit to BetServiceImpl");
} else {
    console.log("Could not find regex match in BetServiceImpl");
}
