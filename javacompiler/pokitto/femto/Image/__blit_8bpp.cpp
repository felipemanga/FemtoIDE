
void *out = &screen->buffer->arrayRead(0);
const uint32_t displayWidth = screen->width(),
    displayHeight = screen->height();
const uint8_t *data = (uint8_t *)src;
uint8_t *buffer = (uint8_t *)out;
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
    buffer += (displayWidth * (iey - isy));
    ostride = -(displayWidth + (iex - isx));
}else{
    ostride = displayWidth - (iex - isx);
}
uint32_t istride = width - (iex - isx);

buffer += displayWidth * osy + osx;
img += width * isy + isx;

y = iey - isy;
if( y < 0 ) y = -y;

int sx = iex - isx;

if( mirror ){
    ostride += sx + 1;
    img += width - iex;
    buffer += sx;
}

if( mirror ){
    img -= isx;
    for( ; y > 0; y--, img += istride, buffer += ostride ){
        for( x = sx+1; x > 0; x--, buffer-- ){
            *buffer = *img++;
        }
    }
}else if(y > 0){
    for( ; y > 0; y--, img += istride, buffer += ostride ){
        for( x = sx+1; x > 0; x-- ){
            *buffer++ = *img++;
        }
    }
}

