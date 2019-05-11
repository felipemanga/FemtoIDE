if( x>=220 || y>=176 || !w )
    return;
        
if( x+w>=220 )
    w = 220 - x;

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

while( rem-- )
    *b++ = color;

if( w&1 )
    setPixel( x+w-1, y, color );
