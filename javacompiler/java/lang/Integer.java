package java.lang;

public class Integer {

    /// A constant holding the maximum value an `int` can have, 2<sup>31</sup>-1.
    public static final int MAX_VALUE = ~(1<<31);
	
	/// A constant holding the minimum value an `int` can have, -2<sup>31</sup>.
    public static final int MIN_VALUE = 1<<31;
	
	/// The number of bits used to represent an `int` value in two's complement binary form.
    public static final int SIZE = 32;

    int value;
    
	/// Parses the string argument as a signed decimal integer.
    public static int parseInt(String s){
        int acc=0;
        for( int i=0; s[i] >= '0' && s[i] <= '9'; ++i ){
            acc *= 10;
            acc += (int)(s[i] - '0');
        }
        return acc;
    }
}
