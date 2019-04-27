package java.lang;

public class Math implements __stub__ {

    public static final float PI = 3.1415926535897932384626433832795028841971f;

    public static double abs( double a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static float abs( float a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static int abs( int a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static long abs( long a ){
        if( a < 0 ) return -a;
        return a;
    }

    public static float cos( float angle ){}

    public static float sin( float angle ){
        return cos( angle + PI );
    }
    
}
