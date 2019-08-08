package java.lang;

import java.util.Random;

public class Math implements __stub__ {

    /// The `float` value that is closer than any other to pi, the ratio of the circumference of a circle to its diameter.
    public static final float PI = 3.1415926535897932384626433832795028841971f;

    /// Converts an angle measured in degrees to an approximately equivalent angle measured in radians.
    public static float toRadians( float deg ){
        return (deg*PI) / 180.0f;
    }

    /// Returns the greater of two `double` values.
    public static double max( double a, double b ){
        return (a>b) ? a : b;
    }

    /// Returns the greater of two `int` values.
    public static int max( int a, int b ){
        return (a>b) ? a : b;
    }

    /// Returns the greater of two `float` values.
    ///
    /// @note This function is non-standard
    public static float max( float a, float b ){
        return (a>b) ? a : b;
    }

    /// Returns the greater of two `uint` values.
    ///
    /// @note This function is non-standard
    public static uint max( uint a, uint b ){
        return (a>b) ? a : b;
    }

    /// Returns the greater of two `byte` values.
    ///
    /// @note This function is non-standard
    public static byte max( byte a, byte b ){
        return (a>b) ? a : b;
    }

    /// Returns the lesser of two `double` values.
    public static double min( double a, double b ){
        return (a<b) ? a : b;
    }

    /// Returns the lesser of two `int` values.
    public static int min( int a, int b ){
        return (a<b) ? a : b;
    }

    /// Returns the lesser of two `float` values.
    ///
    /// @note This function is non-standard
    public static float min( float a, float b ){
        return (a<b) ? a : b;
    }

    /// Returns the lesser of two `uint` values.
    ///
    /// @note This function is non-standard
    public static uint min( uint a, uint b ){
        return (a<b) ? a : b;
    }

    /// Returns the lesser of two `byte` values.
    ///
    /// @note This function is non-standard
    public static byte min( byte a, byte b ){
        return (a<b) ? a : b;
    }

    /// Returns the absolute value of a `double` value.
    public static double abs( double a ){
        if( a < 0 ) return -a;
        return a;
    }

    /// Returns the absolute value of a `float` value.
    public static float abs( float a ){
        if( a < 0 ) return -a;
        return a;
    }

    /// Returns the absolute value of an `int` value.
    public static int abs( int a ){
        if( a < 0 ) return -a;
        return a;
    }

    /// Returns the absolute value of a `long` value.
    public static long abs( long a ){
        if( a < 0 ) return -a;
        return a;
    }

    /// Returns the largest (closest to positive infinity) `float` value that is less than or equal to the argument and is equal to a mathematical integer.
    public static float floor( float a ){
        return (float) __inline_cpp__("a.getInteger()");
    }

    public static float round( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+128)&~0xFF)");
    }

    public static float ceil( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+255)&~0xFF)");
    }

    private static Random rng;

    /// Returns a `float` value with a positive sign, greater than or equal to `0.0` and less than `1.0`.
    public static float random(){
        if( !rng ) rng = new Random();
        return rng.nextFloat();
    }

    /// Returns an `int` value, greater than or equal to `min` and less than `max`
    public static int random(int min, int max){
        if( !rng ) rng = new Random();
        return rng.nextInt(max-min) + min;
    }

    /// Returns the trigonometric cosine of an angle.
    public static float cos( float angle ){}

    /// Returns the trigonometric sine of an angle.
    public static float sin( float angle ){
        return cos( angle - PI*0.5f );
    }

    /// Returns the angle theta from the conversion of rectangular coordinates (x, y) to polar coordinates (r, theta).
    public static float atan2( float y, float x ){}

    /// Returns the correctly rounded positive square root of a `float` value.
    public static float sqrt( float x ){
        uint t, q, b, r;
        r = __inline_cpp__("x.getInternal()");
        b = 0x40000000;
        q = 0;
        while( b > 0x40 ){
            t = q;
            t += b;
            if( r >= t )
            {
                r -= t;
                q += b<<1;
            }
            r <<= 1;
            b >>= 1;
        }
        q >>= 12;
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal(q)");
    }
}
