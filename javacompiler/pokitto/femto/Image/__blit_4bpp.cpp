
void *out = &screen->buffer->arrayRead(0);
const uint32_t displayWidth = screen->width(),
    displayHeight = screen->height();
const uint8_t *data = (uint8_t *)src;
uint8_t *buffer = (uint8_t *)out;
uint32_t width = data[0];
uint32_t height = data[1];
const uint8_t *img = data+2;
width += width & 1;
if( x <= -int32_t(width) || x >= int32_t(displayWidth) || y <= -int32_t(height) || y >= int32_t(displayHeight) )
    return;

int32_t osx = x, osy = y;
int32_t isx = 0, isy = 0, iex = width, iey = height;

if( x < 0 ){
    osx = 0;
    isx = -x;
}

if( x + width >= displayWidth ){
    iex = (displayWidth - x);
}

if( y < 0 ){
    osy = 0;
    if( flip ){
        iey = height + y;
    }else{
        isy = -y;
    }
}

if( y + height >= displayHeight ){
    if( flip ){
        isy += (y + height) - displayHeight;
    }else{
        iey = displayHeight - y;
    }
}

int32_t ostride;
if( flip ){
    buffer += (displayWidth * (iey - isy - 1)) >> 1;
    ostride = -(((displayWidth + (iex - isx)) >> 1));
}else{
    ostride = ((displayWidth - (iex - isx)) >> 1);
}
uint32_t istride = (width - (iex - isx)) >> 1;

buffer += (displayWidth * osy + osx)>>1;
img += (width * isy + isx)>>1;

y = iey - isy;
if( y < 0 ) y = -y;

int sx = (iex - isx - 1) >> 1;

if( mirror ){
    ostride += ((sx+1)<<1);
    img += (width - iex)>>1;
    buffer += sx;
}

if( osx & 1 ){
    
    if( flip )
        ostride -= iex&1;

    if( mirror ){
        buffer++;

        for( ; y > 0; y--, img += istride, buffer += ostride ){
            uint8_t next = *img++;
            if( !(iex&1) )
                *buffer = (*buffer&0x0F) + (next&0xF0);
            buffer--;
            if( sx )
            {
                for( x = sx; x > 0; x--, buffer-- ){
                    uint8_t hi = next&0x0F;
                    next = *img++;
                    uint8_t lo = next&0xF0;               
                    *buffer = hi+lo;
                }
            }
            *buffer = (*buffer&0xF0) + (next&0x0F);
        }
        
    }else{
        for( ; y > 0; y--, img += istride, buffer += ostride ){
            uint8_t next = *img++;
            *buffer = (*buffer&0xF0) + (next>>4);
            buffer++;
            if( sx )
            {
                for( x = sx; x > 0; x--, buffer++ ){
                    uint8_t hi = next<<4;
                    next = *img++;
                    uint8_t lo = next>>4;
                    *buffer = hi+lo;
                }
            }
            if( !(iex&1) )
                *buffer = (*buffer&0x0F) + (next<<4);
        }
    }

}else{

    if( flip )
        ostride -= isx&1;

    if( mirror ){
        img -= isx>>1;


        for( ; y > 0; y--, img += istride, buffer += ostride ){
            for( x = sx+1; x > 0; x--, buffer-- ){
                uint8_t b = *img++;
                b = (b>>4) | (b<<4);
                *buffer = b;
            }
        }
    }else{
        for( ; y > 0; y--, img += istride, buffer += ostride ){
            for( x = sx+1; x > 0; x-- ){
                *buffer++ = *img++;
            }
        }
    }
}

