package java.lang;

public class Integer {
    public static final int MAX_VALUE = ~(1<<31);
    public static final int MIN_VALUE = 1<<31;
    public static final int SIZE = 32;

    int value;
    
    public static int parseInt(String s){
        int acc=0;
        for( int i=0; s[i] >= '0' && s[i] <= '9'; ++i ){
            acc *= 10;
            acc += s[i] - '0';
        }
        return acc;
    }
}
