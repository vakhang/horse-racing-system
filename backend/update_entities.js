const fs = require('fs');
const path = require('path');

const basePath = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\model';

function insertBeforeLastBrace(file, content) {
    const fullPath = path.join(basePath, file);
    let text = fs.readFileSync(fullPath, 'utf8');
    const lastBraceIndex = text.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
        text = text.substring(0, lastBraceIndex) + '\n' + content + '\n' + text.substring(lastBraceIndex);
        fs.writeFileSync(fullPath, text, 'utf8');
        console.log(`Updated ${file}`);
    }
}

// 1. User.java
insertBeforeLastBrace('User.java', `
    @jakarta.persistence.Version
    @jakarta.persistence.Column(name = "version")
    private Integer version = 0;

    @jakarta.persistence.Column(name = "is_busy")
    private Boolean isBusy = false;
`);

// 2. Horse.java
insertBeforeLastBrace('Horse.java', `
    @jakarta.persistence.Column(name = "rating")
    private Integer rating = 40;

    @jakarta.persistence.Column(name = "class_level")
    private Integer classLevel = 4;
`);

// 3. Tournament.java
insertBeforeLastBrace('Tournament.java', `
    @jakarta.persistence.Column(name = "required_class")
    private Integer requiredClass;
`);

// 4. Race.java
insertBeforeLastBrace('Race.java', `
    @jakarta.persistence.Column(name = "minus_pool_deficit", precision = 15, scale = 2)
    private java.math.BigDecimal minusPoolDeficit = java.math.BigDecimal.ZERO;
`);

// 5. Registration.java
insertBeforeLastBrace('Registration.java', `
    @jakarta.persistence.Column(name = "assigned_weight")
    private Double assignedWeight;

    @jakarta.persistence.Column(name = "actual_weight")
    private Double actualWeight;

    @jakarta.persistence.Column(name = "lead_weight")
    private Double leadWeight;

    @jakarta.persistence.Column(name = "is_weighed_in")
    private Boolean isWeighedIn = false;

    @jakarta.persistence.Column(name = "gate_number")
    private Integer gateNumber;
`);

// 6. Bet.java
insertBeforeLastBrace('Bet.java', `
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @jakarta.persistence.Column(name = "bet_type")
    private BetType betType = BetType.WIN;

    @jakarta.persistence.ManyToOne
    @jakarta.persistence.JoinColumn(name = "registration_id_2")
    private Registration registration2;

    @jakarta.persistence.Column(name = "gross_payout", precision = 15, scale = 2)
    private java.math.BigDecimal grossPayout;

    @jakarta.persistence.Column(name = "net_payout", precision = 15, scale = 2)
    private java.math.BigDecimal netPayout;
`);

// 7. Enums
function appendToEnum(file, enumsStr) {
    const fullPath = path.join(basePath, file);
    let text = fs.readFileSync(fullPath, 'utf8');
    // find where the enums end (last string before a semicolon or closing brace)
    // Actually, just find the last brace and put it before. If it's a simple enum, just insert before }.
    // BUT we need a comma! So we replace "}" with ", " + enumsStr + "\n}"
    const lastBraceIndex = text.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
        text = text.substring(0, lastBraceIndex - 1) + ',\n    ' + enumsStr + '\n' + text.substring(lastBraceIndex);
        fs.writeFileSync(fullPath, text, 'utf8');
        console.log(`Updated ${file}`);
    }
}

// 7.1 RaceStatus
appendToEnum('RaceStatus.java', 'PROVISIONAL_RESULT');

// 7.2 RegistrationStatus
appendToEnum('RegistrationStatus.java', 'SCRATCH, NON_STARTER');

// 8. Create BetType.java
fs.writeFileSync(path.join(basePath, 'BetType.java'), `package com.swp.horseracing.model;

public enum BetType {
    WIN,
    PLACE,
    QUINELLA,
    EXACTA
}
`, 'utf8');
console.log('Created BetType.java');

// 9. Create SystemFund.java
fs.writeFileSync(path.join(basePath, 'SystemFund.java'), `package com.swp.horseracing.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_funds")
@Data
public class SystemFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fund_type", nullable = false)
    private String fundType;

    @Column(name = "class_level")
    private Integer classLevel;

    @Column(name = "balance", precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
`, 'utf8');
console.log('Created SystemFund.java');
