#define MODE15_LOOP				\
    "ands %[tmp], %[color]" "\n"		\
    "lsrs %[tmp], 2" "\n"			\
    "ldr %[tmp], [%[palette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"                 \
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"	\
    "movs %[tmp], 0x0F" "\n"                    \
    "ands %[tmp], %[color]" "\n"		\
    "str %[WRBit], [%[LCD], 124]" "\n"          \
    "lsls %[tmp], 2" "\n"			\
    "ldr %[tmp], [%[palette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"                 \
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"	\
    "movs %[tmp], 0xF0" "\n"                    \
    "lsrs %[color], 8" "\n"			\
    "str %[WRBit], [%[LCD], 124]" "\n"

#define MODE15_ENDLOOP                          \
    "ands %[tmp], %[color]" "\n"                \
    "lsrs %[tmp], 2" "\n"                       \
    "ldr %[tmp], [%[palette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"			\
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"       \
    "movs %[tmp], 0x0F" "\n"			\
    "ands %[tmp], %[color]" "\n"                \
    "str %[WRBit], [%[LCD], 124]" "\n"		\
    "lsls %[tmp], 2" "\n"                       \
    "ldr %[tmp], [%[palette], %[tmp]]" "\n"     \
    "str %[tmp], [%[LCD]]" "\n"			\
    "str %[WRBit], [%[LCD], %[CLR]]" "\n"       \
    "ldm %[scrbuf]!, {%[color]}" "\n"		\
    "movs %[tmp], 0xF0" "\n"			\
    "str %[WRBit], [%[LCD], 124]" "\n"
    
uint8_t *end=&buffer[0x4BA0]+4;
volatile uint32_t palette[16];
for( uint32_t i=0; i<16; ++i )
    palette[i] = uint32_t(paletteptr[i]) << 3;

uint32_t WRBit = 1<<12, color, tmp;
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
    [palette]"l" (palette)
      
    :
    "cc"
    );
    
#undef MODE15_LOOP
#undef MODE15_ENDLOOP
