if( w<0 ){
    x += w;
    w = -w;
}

if( x < 0 ){
    w += x;
    x = 0;
}

const std::uint32_t screenWidth = 220;
const std::uint32_t screenHeight = 176;

if( (x + w) >= (int32_t) screenWidth )
    w = screenWidth - x;

if( std::uint32_t(x)>=screenWidth || std::uint32_t(y)>=screenHeight || w<1 )
    return;
        
color = (color<<4) | (color&0xF);
color |= color<<8;
color |= color<<16;

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

while( rem && (uintptr_t(b)&3)){
    *b++ = color;
    rem--;
}

while( rem >= 4 ){
    *((uint32_t*)b) = color;
    b += 4;
    rem -= 4;
}

while( rem ){
    *b++ = color;
    rem--;
}

if( w&1 )
    *b = (*b & 0xF) | (color&0xF0);
    // setPixel( x+w-1, y, color );
