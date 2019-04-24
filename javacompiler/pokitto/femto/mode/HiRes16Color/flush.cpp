uc_ScreenMode::flush();

#define MODE15_LOOP				\
    "ands %[tmp], %[color]" "\n"		\
    "lsrs %[tmp], 2" "\n"			\
    "ldr %[tmp], [%[lpalette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"                 \
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"	\
    "movs %[tmp], 0x0F" "\n"                    \
    "ands %[tmp], %[color]" "\n"		\
    "str %[WRBit], [%[LCD], 124]" "\n"          \
    "lsls %[tmp], 2" "\n"			\
    "ldr %[tmp], [%[lpalette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"                 \
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"	\
    "movs %[tmp], 0xF0" "\n"                    \
    "lsrs %[color], 8" "\n"			\
    "str %[WRBit], [%[LCD], 124]" "\n"

#define MODE15_ENDLOOP                          \
    "ands %[tmp], %[color]" "\n"                \
    "lsrs %[tmp], 2" "\n"                       \
    "ldr %[tmp], [%[lpalette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"			\
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"       \
    "movs %[tmp], 0x0F" "\n"			\
    "ands %[tmp], %[color]" "\n"                \
    "str %[WRBit], [%[LCD], 124]" "\n"		\
    "lsls %[tmp], 2" "\n"                       \
    "ldr %[tmp], [%[lpalette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"			\
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"       \
    "ldm %[scrbuf]!, {%[color]}" "\n"		\
    "movs %[tmp], 0xF0" "\n"			\
    "str %[WRBit], [%[LCD], 124]" "\n"

const uint8_t *scrbuf = (uint8_t*) &buffer->access(0);
const uint8_t *end=&scrbuf[0x4BA0]+4;
volatile uint32_t lpalette[16];
for( uint32_t i=0; i<16; ++i )
    lpalette[i] = uint32_t(palette->access(i)) << 3;

uint32_t WRBit = 1<<12, color = 0, tmp = 0;
asm volatile(
".syntax unified" "\n"
"ldm %[scrbuf]!, {%[color]}" "\n"      
"movs %[tmp], 0xF0" "\n"
"mode15Loop%=:" "\n"
MODE15_LOOP
MODE15_LOOP
MODE15_LOOP
MODE15_ENDLOOP      
"cmp %[end], %[scrbuf]" "\n"
"bne mode15Loop%=" "\n"
:
[tmp]"+l" (tmp),
    [color]"+l" (color),
    [end]"+h" (end),
    [scrbuf]"+l" (scrbuf),
    [WRBit]"+l" (WRBit)
      
    :
    [CLR]"l" (252),
    [LCD]"l" (0xA0002188),
    [lpalette]"l" (lpalette)
      
    :
    "cc"
    );
    
#undef MODE15_LOOP
#undef MODE15_ENDLOOP
