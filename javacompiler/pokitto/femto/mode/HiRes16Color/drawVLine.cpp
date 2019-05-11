if( h < 0 ){
    y += h;
    h = -h;
}

if( y < 0 ){
    h += y;
    y = 0;
}

if( y+h>=176 )
    h = 176 - y;

if( (uint32_t)x>=220 || (uint32_t)y>=176 || h<=0 )
    return;
        
char mask;
if( x&1 ){
    color = color&0xF;
    mask = 0xF0;
}else{
    color = color<<4;
    mask = 0x0F;
}

int rem = h;
auto *b = buffer->elements+y*110+(x>>1);

while( rem ){
    *b = (*b&mask) | color;
    b += 110;
    rem--;
}

