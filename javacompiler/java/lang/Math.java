package java.lang;

import java.util.Random;

public class Math implements __stub__ {

    /// The `float` value that is closer than any other to pi, the ratio of the circumference of a circle to its diameter.
    public static final float PI = 3.1415926535897932384626433832795028841971f;

    /// The `float` value that is closer than any other to e, the base of the natural logarithms.
    public static final float E = 2.7182818284590452353602874713526624977572f;

    /// @brief
    /// Converts an angle measured in degrees to an approximately equivalent angle measured in radians.
    ///
    /// @param
    ///deg An angle expressed in degrees.
    ///
    /// @return
    /// An angle expressed in radians.
    public static float toRadians( float deg ){
        return (deg*PI) / 180.0f;
    }

    /// @brief
    /// Converts an angle measured in radians to an approximately equivalent angle measured in degrees.
    ///
    /// @param
    /// radians An angle expressed in radians.
    ///
    /// @return
    /// An angle expressed in degrees.
    public static float toDegrees( float radians ){
        return ((radians * 180.0f) / PI);
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
    public static float max( float a, float b ){
        return (a>b) ? a : b;
    }

    /// Returns the greater of two `long` values.
    public static long max( long a, long b ){
        return (a>b) ? a : b;
    }

    /// @brief
    /// Returns the greater of two `uint` values.
    ///
    /// @note This function is non-standard
    public static uint max( uint a, uint b ){
        return (a>b) ? a : b;
    }

    /// @brief
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
    public static float min( float a, float b ){
        return (a<b) ? a : b;
    }

    /// Returns the lesser of two `long` values.
    public static long min( long a, long b ){
        return (a<b) ? a : b;
    }

    /// @brief
    /// Returns the lesser of two `uint` values.
    ///
    /// @note This function is non-standard
    public static uint min( uint a, uint b ){
        return (a<b) ? a : b;
    }

    /// @brief
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

    /// @brief
    /// Returns the trigonometric cosine of an angle.
    /// The angle must be expressed in radians.
    public static float cos( float angle ){}

    /// @brief
    /// Returns the trigonometric sine of an angle.
    /// The angle must be expressed in radians.
    public static float sin( float angle ){
        return cos( angle - PI*0.5f );
    }

    /// @brief
    /// Returns the angle theta from the conversion of rectangular coordinates (x, y) to polar coordinates (r, theta).
    ///
    /// @details
    /// The returned value is the arctangent of the quotient of its arguments, as a numeric value between `-PI` and `PI` radians. The number returned represents the anticlockwise/counterclockwise angle in radians between the positive x axis and the point (x, y).
    ///
    /// @return
    /// An angle expressed in radians, between the values of `-PI` and `PI`.
    public static float atan2( float fy, float fx ){}

    /// Returns the square root of a `float` value.
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

    /// @brief
    /// Returns the signum function of the argument; zero if the argument is zero,
    /// 1.0f if the argument is greater than zero, -1.0f if the argument is less than zero. 
    public static float signum( float f ){
        // Get the internal fixed point representation as a signed integer.
        int internal = (int)__inline_cpp__("f.getInternal()");

        // The rest of the logic works as normal,
        // no pesky `NaN`s or `-0.0f`s to worry about.
        return (internal == 0) ? 0.0f : (internal < 0) ? -1.0f : 1.0f;
    }
}
