const uint32_t displayWidth = screen->width(),
    displayHeight = screen->height();
const uint8_t *data = (uint8_t *)src;
uint32_t width = data[0];
uint32_t height = data[1];
const uint8_t *img = data+2;
width += width & 1;
if( x <= 1-int32_t(width) || x >= int32_t(displayWidth) || y <= -int32_t(height) || y >= int32_t(displayHeight) )
    return;

int32_t osx = x, osy = y;
int32_t isx = 0, isy = 0, iex = width, iey = height;

if( x < 0 ){
    osx = 0;
    isx = -x;
    if( isx&1 ){
        osx = 1;
        isx++;
    }
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
int32_t outX = osx, outY = osy;
int32_t ostride;
if( flip ){
    // buffer += (displayWidth * (iey - isy - 1)) >> 1;
    outY += iey - isy - 1;
    ostride = -1; // -(((displayWidth + (iex - isx)) >> 1));
}else{
    ostride = 1; // ((displayWidth - (iex - isx)) >> 1);
}
uint32_t istride = (width - (iex - isx)) >> 1;

// buffer += (displayWidth * osy + osx)>>1;
img += (width * isy + isx)>>1;

y = iey - isy;
if( y < 0 ) y = -y;

int sx = (iex - isx - 1) >> 1;

if( mirror ){
    // ostride += ((sx+1)<<1);
    img += (width - iex)>>1;
    // buffer += sx;
}

auto pixel = [pal](int color){
                 color = static_cast<const short*>(pal)[color];
                 volatile int *LCD = (volatile int*) (0xA0002188);
                 LCD[ 0 ] = color<<3;
                 LCD[252>>2] = 1<<12;                 
                 asm volatile("nop");
                 LCD[124>>2] = 1<<12;
             };

if( osx & 1 ){
    
    //if( flip )
    //    ostride -= iex&1;

    if( mirror ){
        // buffer++;

        for( ; y > 0; y--, img += istride, outY += ostride ){
            up_femto::up_hardware::uc_ST7775::setX(outX);
            up_femto::up_hardware::uc_ST7775::setY(outY);
            up_femto::up_hardware::uc_ST7775::beginStream();
            
            uint8_t next = *img++;
            if( !(iex&1) )
                pixel(next>>4);

            if( sx )
            {
                for( x = sx; x > 0; x-- ){
                    pixel(next&0x0F);
                    next = img[x-1];
                    pixel(next>>4);
                }
                img += sx;
            }

            pixel(next&0x0F);
        }
        
    }else if(!sx){
        iex = !(iex&1);
        for( ; y > 0; y--, img += istride, outY += ostride ){
            up_femto::up_hardware::uc_ST7775::setX(outX);
            up_femto::up_hardware::uc_ST7775::setY(outY);
            up_femto::up_hardware::uc_ST7775::beginStream();
            uint8_t next = *img++;
            pixel(next>>4);
            if( iex )
                pixel(next<<4);
        }
    }else{
        iex = !(iex&1);
        for( ; y > 0; y--, img += istride, outY += ostride ){
            up_femto::up_hardware::uc_ST7775::setX(outX);
            up_femto::up_hardware::uc_ST7775::setY(outY);
            up_femto::up_hardware::uc_ST7775::beginStream();

            uint8_t next = *img++;
            pixel(next>>4);
            for( x = sx; x > 0; x-- ){
                pixel(next&0x0F);
                next = *img++;
                pixel(next>>4);
            }

            if( iex )
                pixel(next&0x0F);
        }
    }

}else{

    // if( flip )
    //    ostride -= isx&1;

    if( mirror ){
        img -= isx>>1;
        for( ; y > 0; y--, img += istride, outY += ostride ){
            up_femto::up_hardware::uc_ST7775::setX(outX);
            up_femto::up_hardware::uc_ST7775::setY(outY);
            up_femto::up_hardware::uc_ST7775::beginStream();
            for( x = sx; x >= 0; x-- ){
                uint8_t b = img[x];
                pixel(b&0x0F);
                pixel(b>>4);
            }
            img += sx+1;
        }

    }else if(y > 0){
        for( ; y > 0; y--, img += istride, outY += ostride ){
            up_femto::up_hardware::uc_ST7775::setX(outX);
            up_femto::up_hardware::uc_ST7775::setY(outY);
            up_femto::up_hardware::uc_ST7775::beginStream();
            for( x = sx+1; x > 0; x-- ){
                uint8_t b = *img++;
                pixel(b>>4);
                pixel(b&0x0F);
            }
        }
    }
}

