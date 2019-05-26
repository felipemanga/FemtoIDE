if( w<0 ){
    x += w;
    w = -w;
}

if( x < 0 ){
    w += x;
    x = 0;
}

if( x+w>=220 )
    w = 220 - x;

if( uint32_t(x)>=220 || uint32_t(y)>=176 || w<1 )
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
auto *b = buffer->elements+y*110+(x>>1);

while( rem ){
    *b++ = color;
    rem--;
}

if( w&1 )
    setPixel( x+w-1, y, color );
