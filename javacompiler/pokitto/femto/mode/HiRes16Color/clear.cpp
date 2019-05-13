col = (col&0xF) | (col<<4);
uint32_t col32 = col | (col<<8) | (col<<16) | (col<<24);
uint32_t *b = (uint32_t*) &buffer->arrayRead(0);
for( int i=0; i<0x4BA0; i+=32 ){
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
    *b++ = col32;
}
