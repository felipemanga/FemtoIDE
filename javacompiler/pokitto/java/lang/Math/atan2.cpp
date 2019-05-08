constexpr int32_t QUARTER = ((uint32_t)(3.141592654f / 2.0 * (1L << 8)));
constexpr uint32_t MAXITER = 9;
static const uint8_t arctantab[] = {
    201, 119, 63, 32, 16, 8, 4, 2, 1, 1
};

int32_t x = fx.getInternal(),
    y = fy.getInternal();

if ((x == 0) && (y == 0))
    return 0;

// normalization
if(0){
    int32_t tmpx, tmpy;
    int32_t signx, signy;
    int32_t shiftexp;

    shiftexp = 0;       /* Block normalization exponent */
    signx = signy = 1;

    if ((tmpx = x) < 0) {
        tmpx = -tmpx;
        signx = -signx;
    }

    if ((tmpy = y) < 0) {
        tmpy = -tmpy;
        signy = -signy;
    }

/* Prenormalize vector for maximum precision */
    if (tmpx < tmpy) {    /* |tmpy| > |tmpx| */
        while (tmpy < (1 << 27)) {
            tmpx <<= 1;
            tmpy <<= 1;
            shiftexp--;
        }
        while (tmpy > (1 << 28)) {
            tmpx >>= 1;
            tmpy >>= 1;
            shiftexp++;
        }
    }else {      /* |tmpx| > |tmpy| */
        while (tmpx < (1 << 27)) {
            tmpx <<= 1;
            tmpy <<= 1;
            shiftexp--;
        }
        while (tmpx > (1 << 28)) {
            tmpx >>= 1;
            tmpy >>= 1;
            shiftexp++;
        }
    }

    x = (signx < 0) ? -tmpx : tmpx;
    y = (signy < 0) ? -tmpy : tmpy;
}

// discombobulization
{
    int32_t theta;
    int32_t yi, i;
    int32_t tmpx, tmpy;
    const uint8_t *arctanptr;

    tmpx = x;
    tmpy = y;

    /* Get the vector into the right half plane */
    theta = 0;
    if (tmpx < 0) {
        tmpx = -tmpx;
        tmpy = -tmpy;
        theta = 2 * QUARTER;
    }

    if (tmpy > 0)
        theta = - theta;
    
    arctanptr = arctantab;
    if (tmpy < 0) {    /* Rotate positive */
        yi = tmpy + (tmpx << 1);
        tmpx  = tmpx - (tmpy << 1);
        tmpy  = yi;
        theta -= 283; // *arctanptr++;  /* Subtract angle */
    } else {      /* Rotate negative */
        yi = tmpy - (tmpx << 1);
        tmpx  = tmpx + (tmpy << 1);
        tmpy  = yi;
        theta += 283; // *arctanptr++;  /* Add angle */
    }

    for (i = 0; i <= MAXITER; i++) {
        if (tmpy < 0) {    /* Rotate positive */
            yi = tmpy + (tmpx >> i);
            tmpx  = tmpx - (tmpy >> i);
            tmpy  = yi;
            theta -= *arctanptr++;
        } else {      /* Rotate negative */
            yi = tmpy - (tmpx >> i);
            tmpx  = tmpx + (tmpy >> i);
            tmpy  = yi;
            theta += *arctanptr++;
        }
    }

    x = tmpx;
    y = theta;
}

return up_java::up_lang::uc_float::fromInternal(y);

