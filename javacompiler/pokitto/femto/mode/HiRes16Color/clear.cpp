color &= 0xF;
color |= color<<4;
uint32_t col32 = color | (color<<8) | (color<<16) | (color<<24);
uint32_t *b = (uint32_t*) &buffer->arrayRead(0);
uint32_t len = buffer->length;
for( int i=0; i<len; i+=32 ){
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
}
