if( w<0 ){
    x += w;
    w = -w;
}

if( x < 0 ){
    w += x;
    x = 0;
}

std::uint32_t screenWidth = width();

if( (x + w) >= (int32_t) screenWidth )
    w = screenWidth - x;

if( std::uint32_t(x)>=screenWidth || std::uint32_t(y)>=std::uint32_t(height()) || w<1 )
    return;
        
color = (color<<4) | (color&0xF);

if( x&1 ){
    setPixel(x, y, color);
    w--;
    x++;
    if(!w)
        return;
}

int rem = (w>>1);
auto *b = buffer->elements+y*(screenWidth>>1)+(x>>1);

while( rem ){
    *b++ = color;
    rem--;
}

if( w&1 )
    setPixel( x+w-1, y, color );
