const fs = require('fs');
const path = require('path');

const basePath = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\service\\impl';

// 1. Inject Bonus in UserServiceImpl
const userFile = path.join(basePath, 'UserServiceImpl.java');
let userText = fs.readFileSync(userFile, 'utf8');

const statusMethodRegex = /public UserResponseDTO updateUserStatus\(Integer id, UserStatus status\) \{[\s\S]*?(?=return mapToDTO\(user\);)/;

const newStatusLogic = `public UserResponseDTO updateUserStatus(Integer id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));

        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        user = userRepository.save(user);

        // NẾU LÀ KHÁN GIẢ ĐƯỢC DUYỆT (PENDING -> APPROVED) -> THƯỞNG 100k
        if (oldStatus == UserStatus.PENDING && status == UserStatus.APPROVED && user.getRole() == com.swp.horseracing.model.RoleEnum.SPECTATOR) {
            com.swp.horseracing.model.Wallet w = walletRepository.findByUserId(id).orElse(null);
            if (w != null) {
                w.setBalance(w.getBalance().add(new java.math.BigDecimal("100000")));
                walletRepository.save(w);
                
                com.swp.horseracing.model.TransactionHistory tx = com.swp.horseracing.model.TransactionHistory.builder()
                        .wallet(w)
                        .type(com.swp.horseracing.model.TransactionType.DEPOSIT)
                        .amount(new java.math.BigDecimal("100000"))
                        .status(com.swp.horseracing.model.TransactionStatus.COMPLETED)
                        .transactionCode("BONUS-" + System.currentTimeMillis())
                        .createdAt(java.time.LocalDateTime.now())
                        .description("Thưởng khởi nghiệp tài khoản Khán Giả")
                        .build();
                transactionHistoryRepository.save(tx);
            }
        }

        `;

if(userText.match(statusMethodRegex)) {
    userText = userText.replace(statusMethodRegex, newStatusLogic);
    fs.writeFileSync(userFile, userText, 'utf8');
    console.log("Injected Bonus to UserServiceImpl");
}

// 2. Inject 1M Limit in BetServiceImpl
const betFile = path.join(basePath, 'BetServiceImpl.java');
let betText = fs.readFileSync(betFile, 'utf8');

const placeBetRegex = /public BetResponseDTO placeBet\(BetRequestDTO request\) \{[\s\S]*?(?=Wallet wallet = walletRepository.findByUserId\(spectator.getId\(\)\))/;

const limitLogic = `public BetResponseDTO placeBet(BetRequestDTO request) {
        User spectator = userRepository.findById(request.getSpectatorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        if (spectator.getStatus() != com.swp.horseracing.model.UserStatus.APPROVED) {
            throw new RuntimeException("Tài khoản chưa được duyệt hoặc bị cấm, không thể đặt cược!");
        }

        // TÍNH TỔNG CƯỢC TRONG NGÀY ĐỂ CHECK LIMIT 1 TRIỆU
        java.time.LocalDateTime startOfDay = java.time.LocalDateTime.now().toLocalDate().atStartOfDay();
        java.time.LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);
        
        java.math.BigDecimal totalBetToday = betRepository.findBySpectatorId(spectator.getId()).stream()
            .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startOfDay) && b.getCreatedAt().isBefore(endOfDay))
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
}

// 3. Inject Idempotency in WalletServiceImpl (Withdrawal Approve)
const walletFile = path.join(basePath, 'WalletServiceImpl.java');
if (fs.existsSync(walletFile)) {
    let walletText = fs.readFileSync(walletFile, 'utf8');
    
    // We assume there's a method approveWithdrawal or something similar. Let's just do a naive replace if it exists.
    const withdrawRegex = /public TransactionHistoryResponseDTO approveWithdrawal\(Integer id, String proofUrl\) \{/;
    const withdrawReplace = `public TransactionHistoryResponseDTO approveWithdrawal(Integer id, String proofUrl) {
        com.swp.horseracing.model.TransactionHistory tx = transactionHistoryRepository.findById(id).orElseThrow();
        if (tx.getStatus() == com.swp.horseracing.model.TransactionStatus.COMPLETED || tx.getStatus() == com.swp.horseracing.model.TransactionStatus.REJECTED) {
            throw new RuntimeException("Giao dịch này đã được quyết toán hoàn tất trước đó");
        }
    `;
    
    if (walletText.match(withdrawRegex)) {
        walletText = walletText.replace(withdrawRegex, withdrawReplace);
        fs.writeFileSync(walletFile, walletText, 'utf8');
        console.log("Injected Idempotency to WalletServiceImpl");
    }
}

