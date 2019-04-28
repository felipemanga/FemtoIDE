if( x>=220 || y>=176 || !w )
    return;
        
if( x+w>=220 )
    w = 220 - x;

col = (col<<4) | (col&0xF);

if( x&1 ){
    setPixel(x, y, col);
    w--;
    x++;
    if(!w)
        return;
}

int rem = (w>>1);
auto *b = buffer->elements+y*110+(x>>1);

while( rem-- )
    *b++ = col;

if( w&1 )
    setPixel( x+w-1, y, col );
