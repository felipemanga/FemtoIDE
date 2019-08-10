package java.lang;

public class Thread {

    /// Causes the program to pause for the specified number of milliseconds.
    public static void sleep(long millis){
        long end = System.currentTimeMillis() + millis;
        while( System.currentTimeMillis() < end ){
        }
    }
}
