package java.lang;

public class Thread {
    public static void sleep(long ms){
        long end = System.currentTimeMillis() + ms;
        while( System.currentTimeMillis() < end ){
        }
    }
}
