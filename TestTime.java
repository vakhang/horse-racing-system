import java.time.LocalDateTime;
import java.util.TimeZone;

public class TestTime {
    public static void main(String[] args) {
        System.out.println("Default: " + LocalDateTime.now());
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.out.println("After setDefault: " + LocalDateTime.now());
        System.out.println("Explicit ZoneId: " + LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
    }
}
