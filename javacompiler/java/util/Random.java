package java.util;

public class Random {
    private uint jsr = 123456789;
    public Random(){
        setSeed((uint)System.currentTimeMillis());
    }
    public Random(uint seed){
        setSeed(seed);
    }
    public void setSeed( uint seed ){
        jsr = seed ^ 0x5DEECE66L;
    }

    protected int next( int bits ){
        jsr^=(jsr<<17);
        jsr^=(jsr>>13);
        jsr^=(jsr<<5);
        return jsr >> (32 - bits);
    }

    boolean nextBoolean(){
        return next(1);
    }

    float nextFloat(){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal(next(8))");
    }

    int nextInt(){
        return next(31);
    }

    int nextInt(int bound){
        int mask  = bound;
        mask |= mask >> 16;
        mask |= mask >> 8;
        mask |= mask >> 4;
        mask |= mask >> 2;
        mask |= mask >> 1;
        int ret = bound;

        while( ret >= bound ){
            ret = next(31) & mask;
        }
        return ret;
    }
}
