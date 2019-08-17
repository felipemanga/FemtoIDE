package java.util;

public class Random {
    private uint jsr = 123456789;

    /// Creates a new random number generator.
    public Random(){
        setSeed((uint)System.currentTimeMillis());
    }

    /// Creates a new random number generator using a single long seed.
    public Random(int seed){
        setSeed(seed);
    }

    /// Sets the seed of this random number generator using a single long seed.
    public void setSeed( int seed ){
        jsr = seed ^ 0x5DEECE66L;
    }

    /// Generates the next pseudorandom number.
    protected int next( int bits ){
        jsr^=(jsr<<17);
        jsr^=(jsr>>13);
        jsr^=(jsr<<5);
        return jsr >> (32 - bits);
    }

    // Returns the next pseudorandom `boolean` value from this random number generator's sequence.
    boolean nextBoolean(){
        return next(1) != 0;
    }

    /// Returns the next pseudorandom, uniformly distributed float value between `0.0` and `1.0` from this random number generator's sequence.
    float nextFloat(){
        float f;
        __inline_cpp__("f = up_java::up_lang::uc_float::fromInternal(next(8))");
        return f;
    }

    /// Returns the next pseudorandom, uniformly distributed `int` value from this random number generator's sequence.
    int nextInt(){
        return next(31);
    }

    /// Returns a pseudorandom, uniformly distributed `int` value between `0` (inclusive) and the specified value (exclusive), drawn from this random number generator's sequence.
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
