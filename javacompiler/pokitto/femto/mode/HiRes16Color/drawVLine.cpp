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

std::uint32_t screenWidth = width();

if( std::uint32_t(x)>=screenWidth || std::uint32_t(y)>=std::uint32_t(height()) || h<=0 )
    return;
        
char mask;
if( x&1 ){
    color = color&0xF;
    mask = 0xF0;
}else{
    color = color<<4;
    mask = 0x0F;
}

int halfWidth = screenWidth>>1;
int rem = h;
auto *b = buffer->elements+y*halfWidth+(x>>1);

while( rem ){
    *b = (*b&mask) | color;
    b += halfWidth;
    rem--;
}

