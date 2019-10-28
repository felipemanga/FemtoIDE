package math;

public class Matrix4 {
    static final Matrix4 tmp = new Matrix4();
    
    float a0, a1, a2,
        a3, a4, a5,
        a6, a7, a8,
        a9, a10, a11;

    Matrix4 identity() {
        a0 = 1;
        a1 = 0;
        a2 = 0;
        a3 = 0;
        a4 = 1;
        a5 = 0;
        a6 = 0;
        a7 = 0;
        a8 = 1;
        a9 = 0;
        a10 = 0;
        a11 = 0;
        return this;
    }

    Matrix4 copy(Matrix4 o) {
        a0 = o.a0;
        a1 = o.a1;
        a2 = o.a2;
        a3 = o.a3;
        a4 = o.a4;
        a5 = o.a5;
        a6 = o.a6;
        a7 = o.a7;
        a8 = o.a8;
        a9 = o.a9;
        a10 = o.a10;
        a11 = o.a11;
        return this;
    }


    Matrix4 setTranslation(float x, float y, float z) {
        a0 = 1;
        a1 = 0;
        a2 = 0;
        a3 = 0;
        a4 = 1;
        a5 = 0;
        a6 = 0;
        a7 = 0;
        a8 = 1;
        a9 = x;
        a10 = y;
        a11 = z;
        return this;
    }

    Matrix4 translate(float x, float y, float z) {
        a9 = (a0 * x) + (a3 * y) + (a6 * z) + a9;
        a10 = (a1 * x) + (a4 * y) + (a7 * z) + a10;
        a11 = (a2 * x) + (a5 * y) + (a8 * z) + a11;
        return this;
    }


    Matrix4 setScale(float x, float y, float z) {
        a0 = x;
        a1 = 0;
        a2 = 0;
        a3 = 0;
        a4 = y;
        a5 = 0;
        a6 = 0;
        a7 = 0;
        a8 = z;
        a9 = 0;
        a10 = 0;
        a11 = 0;
        return this;
    }
    
    Matrix4 scale(float s){
        return scale(s,s,s);
    }

    Matrix4 scale(float x, float y, float z) {
        a0 *= x;
        a3 *= y;
        a6 *= z;
        a1 *= x;
        a4 *= y;
        a7 *= z;
        a2 *= x;
        a5 *= y;
        a8 *= z;
        return this;
    }


    Matrix4 setRotation(float x, float y, float z) {
        float a = Math.cos(x), b = Math.sin(x);
        float c = Math.cos(y), d = Math.sin(y);
        float e = Math.cos(z), f = Math.sin(z);
        float ad = (a * d);
        float bd = (b * d);

        this.a0 = (c * e);
        this.a1 = -(c * f);
        this.a2 = -d;

        this.a3 = -(bd * e) + (a * f);
        this.a4 = (bd * f) + (a * e);
        this.a5 = -(b * c);

        this.a6 = (ad * e) + (b * f);
        this.a7 = -(ad * f) + (b * e);
        this.a8 = (a * c);

        this.a9 = this.a10 = this.a11 = 0;

        return this;
    }

    Matrix4 setRotationX(float x) {
        float c = Math.cos(x), s = Math.sin(x);

        this.a0 = 1;
        this.a3 = 0;
        this.a6 = 0;
        this.a1 = 0;
        this.a4 = c;
        this.a7 = -s;
        this.a2 = 0;
        this.a5 = s;
        this.a8 = c;

        this.a9 = this.a10 = this.a11 = 0;

        return this;
    }


    Matrix4 rotateY(float x) {
        float c = Math.cos(x), s = Math.sin(x);
        var a11 = this.a0,
            a12 = this.a3,
            a13 = this.a6,
            a14 = this.a9;
        var a21 = this.a1,
            a22 = this.a4,
            a23 = this.a7,
            a24 = this.a10;
        var a31 = this.a2,
            a32 = this.a5,
            a33 = this.a8,
            a34 = this.a11;

        this.a0 = (a11 * c) + (a13 * -s);
        this.a3 = a12;
        this.a6 = (a11 * s) + (a13 * c);
        this.a9 = a14;

        this.a1 = (a21 * c) + (a23 * -s);
        this.a4 = a22;
        this.a7 = (a21 * s) + (a23 * c);
        this.a10 = a24;

        this.a2 = (a31 * c) + (a33 * -s);
        this.a5 = a32;
        this.a8 = (a31 * s) + (a33 * c);
        this.a11 = a34;

        return this;
    }

    Matrix4 setRotationY(float x) {
        float c = Math.cos(x), s = Math.sin(x);

        a0 = c;
        a3 = 0;
        a6 = s;
        a1 = 0;
        a4 = 1;
        a7 = 0;
        a2 = -s;
        a5 = 0;
        a8 = c;

        a9 = a10 = a11 = 0;

        return this;
    }

    Matrix4 rotate(float x, float y, float z) {
        tmp.setRotation(x, y, z);
        this.mul( this, tmp );
        return this;
    }

    void mul(Matrix4 a, Matrix4 b) {
        /* * /
        var a0 = this.a0,
            a3 = this.a3,
            a6 = this.a6,
            a9 = this.a9;
        var a1 = this.a1,
            a4 = this.a4,
            a7 = this.a7,
            a10 = this.a10;
        var a2 = this.a2,
            a5 = this.a5,
            a8 = this.a8,
            a11 = this.a11;

        var b0 = b.a0,
            b3 = b.a3,
            b6 = b.a6,
            b9 = b.a9;
        var b1 = b.a1,
            b4 = b.a4,
            b7 = b.a7,
            b10 = b.a10;
        var b2 = b.a2,
            b5 = b.a5,
            b8 = b.a8,
            b11 = b.a11;

        this.a0 = (a0 * b0) + (a3 * b1) + (a6 * b2);
        this.a3 = (a0 * b3) + (a3 * b4) + (a6 * b5);
        this.a6 = (a0 * b6) + (a3 * b7) + (a6 * b8);
        this.a9 = (a0 * b9) + (a3 * b10) + (a6 * b11) + a9;

        this.a1 = (a1 * b0) + (a4 * b1) + (a7 * b2);
        this.a4 = (a1 * b3) + (a4 * b4) + (a7 * b5);
        this.a7 = (a1 * b6) + (a4 * b7) + (a7 * b8);
        this.a10 = (a1 * b9) + (a4 * b10) + (a7 * b11) + a10;

        this.a2 = (a2 * b0) + (a5 * b1) + (a8 * b2);
        this.a5 = (a2 * b3) + (a5 * b4) + (a8 * b5);
        this.a8 = (a2 * b6) + (a5 * b7) + (a8 * b8);
        this.a11 = (a2 * b9) + (a5 * b10) + (a8 * b11) + a11;
/*/
  pointer ma, mb;
  int t, w, x, y, z, acc;
  __inline_cpp__("ma = &a0; mb = &b->a0;");
  __inline_asm__("

@output ma:+l
@output mb:+l
@output t:+l
@output w:+l
@output x:+l
@output y:+l
@output z:+l
@output acc:+l

ldr @w, [@ma, 0*4]
// ldr @x, [@ma, 3*4]
// ldr @y, [@ma, 6*4]
// ldr @z, [@ma, 9*4]

// A0 = (a0 * b0) + (a3 * b1) + (a6 * b2);
ldr @t, [@mb, 0]
ldr @x, [@ma, 3*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 1*4]
ldr @y, [@ma, 6*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 2*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, 0*4]

// A3 = (a0 * b3) + (a3 * b4) + (a6 * b5);
ldr @t, [@mb, 3*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 4*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 5*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, 3*4]

// A6 = (a0 * b6) + (a3 * b7) + (a6 * b8)
ldr @t, [@mb, 6*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 7*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 8*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, 6*4]

// A9 = (a0 * b9) + (a3 * b10) + (a6 * b11) + a9;
ldr @t, [@mb, 9*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 10*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 11*4]
ldr @z, [@ma, 9*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

adds @acc, @z

str @acc, [@ma, 9*4]

// END OF COLUMN

ldr @w, [@ma, (0+1)*4]
// ldr @x, [@ma, (3+1)*4]
// ldr @y, [@ma, (6+1)*4]
// ldr @z, [@ma, (9+1)*4]

// A1 = (a0 * b0) + (a3 * b1) + (a6 * b2)
ldr @t, [@mb, 0]
ldr @x, [@ma, (3+1)*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 1*4]
ldr @y, [@ma, (6+1)*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 2*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (1+0)*4]

// A4 = (a0 * b3) + (a3 * b4) + (a6 * b5)
ldr @t, [@mb, 3*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 4*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 5*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (1+3)*4]

// A7 = (a0 * b6) + (a3 * b7) + (a6 * b8)
ldr @t, [@mb, 6*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 7*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 8*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (1+6)*4]

// A10 = (a0 * b9) + (a3 * b10) + (a6 * b11) + a9;
ldr @t, [@mb, 9*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 10*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 11*4]
ldr @z, [@ma, (9+1)*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

adds @acc, @z

str @acc, [@ma, (1+9)*4]

// END OF COLUMN


ldr @w, [@ma, (0+2)*4]
// ldr @x, [@ma, (3+2)*4]
// ldr @y, [@ma, (6+2)*4]
// ldr @z, [@ma, (9+2)*4]

// A2 = (a0 * b0) + (a3 * b1) + (a6 * b2)
ldr @t, [@mb, 0]
ldr @x, [@ma, (3+2)*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 1*4]
ldr @y, [@ma, (6+2)*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 2*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (2+0)*4]

// A5 = (a0 * b3) + (a3 * b4) + (a6 * b5)
ldr @t, [@mb, 3*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 4*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 5*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (2+3)*4]

// A8 = (a0 * b6) + (a3 * b7) + (a6 * b8)
ldr @t, [@mb, 6*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 7*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 8*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

str @acc, [@ma, (2+6)*4]

// A11 = (a0 * b9) + (a3 * b10) + (a6 * b11) + a9;
ldr @t, [@mb, 9*4]
muls @t, @w, @t
asrs @acc, @t, 8

ldr @t, [@mb, 10*4]
muls @t, @x, @t
asrs @t, @t, 8
adds @acc, @t

ldr @t, [@mb, 11*4]
ldr @z, [@ma, (9+2)*4]
muls @t, @y, @t
asrs @t, @t, 8
adds @acc, @t

adds @acc, @z

str @acc, [@ma, (2+9)*4]

// END OF COLUMN

  ");
  /* */
    }

}
