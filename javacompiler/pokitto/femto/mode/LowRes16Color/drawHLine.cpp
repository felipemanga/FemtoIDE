if( w<0 ){
    x += w;
    w = -w;
}

if( x < 0 ){
    w += x;
    x = 0;
}

const std::uint32_t screenWidth = 110;
const std::uint32_t screenHeight = 88;

if( (x + w) >= (int32_t) screenWidth )
    w = screenWidth - x;

if( std::uint32_t(x)>=screenWidth || std::uint32_t(y)>=screenHeight || w<1 )
    return;
        
color = (color<<4) | (color&0xF);

auto *b = buffer->elements+y*(screenWidth>>1)+(x>>1);

if( x&1 ){
    // setPixel(x, y, color);
    *b++ = (*b & 0xF0) | (color&0xF);
    w--;
    x++;
    if(!w)
        return;
}

int rem = (w>>1);

while( rem ){
    *b++ = color;
    rem--;
}

if( w&1 )
    setPixel( x+w-1, y, color );
