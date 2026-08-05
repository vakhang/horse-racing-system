const fs = require('fs');
const path = require('path');

const basePathModel = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\model';
const basePathDto = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\dto';

// 1. Update BetRequestDTO
const dtoFile = path.join(basePathDto, 'BetRequestDTO.java');
let dtoText = fs.readFileSync(dtoFile, 'utf8');
const lastBraceIndex = dtoText.lastIndexOf('}');
if (lastBraceIndex !== -1 && !dtoText.includes('registrationId2')) {
    dtoText = dtoText.substring(0, lastBraceIndex) + 
`
    private com.swp.horseracing.model.BetType betType;
    private Integer registrationId2;
` + dtoText.substring(lastBraceIndex);
    fs.writeFileSync(dtoFile, dtoText, 'utf8');
    console.log('Updated BetRequestDTO.java');
}

// 2. Fix @Builder.Default warnings in Entities
function fixBuilderDefault(file) {
    const fullPath = path.join(basePathModel, file);
    let text = fs.readFileSync(fullPath, 'utf8');
    
    // Add @Builder.Default to fields with initializers
    text = text.replace(/private Integer version = 0;/g, '@lombok.Builder.Default\n    private Integer version = 0;');
    text = text.replace(/private Boolean isBusy = false;/g, '@lombok.Builder.Default\n    private Boolean isBusy = false;');
    text = text.replace(/private Integer rating = 40;/g, '@lombok.Builder.Default\n    private Integer rating = 40;');
    text = text.replace(/private Integer classLevel = 4;/g, '@lombok.Builder.Default\n    private Integer classLevel = 4;');
    text = text.replace(/private java\.math\.BigDecimal minusPoolDeficit = java\.math\.BigDecimal\.ZERO;/g, '@lombok.Builder.Default\n    private java.math.BigDecimal minusPoolDeficit = java.math.BigDecimal.ZERO;');
    text = text.replace(/private Boolean isWeighedIn = false;/g, '@lombok.Builder.Default\n    private Boolean isWeighedIn = false;');
    text = text.replace(/private BetType betType = BetType\.WIN;/g, '@lombok.Builder.Default\n    private BetType betType = BetType.WIN;');
    text = text.replace(/private BigDecimal balance = BigDecimal\.ZERO;/g, '@lombok.Builder.Default\n    private BigDecimal balance = BigDecimal.ZERO;');

    fs.writeFileSync(fullPath, text, 'utf8');
    console.log(`Fixed @Builder.Default in ${file}`);
}

['User.java', 'Horse.java', 'Race.java', 'Registration.java', 'Bet.java', 'SystemFund.java'].forEach(fixBuilderDefault);

// 3. Fix unused variables in BetServiceImpl (placePool, quinellaPool)
const betServiceFile = 'd:\\SWP\\horse-racing-system\\backend\\src\\main\\java\\com\\swp\\horseracing\\service\\impl\\BetServiceImpl.java';
let betServiceText = fs.readFileSync(betServiceFile, 'utf8');
// To remove the warning, we can just comment them out or use them in a dummy way if they are placeholders.
betServiceText = betServiceText.replace('BigDecimal placePool = sumBetsByType(allBets, BetType.PLACE)', '// BigDecimal placePool = sumBetsByType(allBets, BetType.PLACE)');
betServiceText = betServiceText.replace('BigDecimal quinellaPool = sumBetsByType(allBets, BetType.QUINELLA)', '// BigDecimal quinellaPool = sumBetsByType(allBets, BetType.QUINELLA)');

fs.writeFileSync(betServiceFile, betServiceText, 'utf8');
console.log('Fixed unused variables in BetServiceImpl.java');
