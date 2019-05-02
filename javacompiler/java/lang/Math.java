package java.lang;

public class Math implements __stub__ {

    public static final float PI = 3.1415926535897932384626433832795028841971f;
    private static uint jsr = 123456789;

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

    public static float floor( float a ){
        return (float) __inline_cpp__("a.getInteger()");
    }
    public static float round( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+128)&~0xFF)");
    }
    public static float ceil( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+255)&~0xFF)");
    }

    public static float random(){
        jsr^=(jsr<<17);
        jsr^=(jsr>>13);
        jsr^=(jsr<<5);
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal(jsr&0xFF)");
    }

    public static int random(int min, int max){
        int range = max - min;
        int ret = range;
        uint mask  = range;
        mask |= mask >> 16;
        mask |= mask >> 8;
        mask |= mask >> 4;
        mask |= mask >> 2;
        mask |= mask >> 1;
        
        while( ret >= range ){
            jsr^=(jsr<<17);
            jsr^=(jsr>>13);
            jsr^=(jsr<<5);

            ret = (int) jsr & mask;
        };

        return ret + min;
    }
    
    public static float cos( float angle ){}

    public static float sin( float angle ){
        return cos( angle + PI );
    }
    
}
