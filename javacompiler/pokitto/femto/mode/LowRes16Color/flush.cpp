uc_ScreenMode::flush();
beforeFlush();

uint32_t scanline[110];

const uint8_t *scrbuf = (uint8_t*) &buffer->arrayRead(0);
volatile uint32_t lpalette[16];
for( uint32_t i=0; i<16; ++i )
    lpalette[i] = uint32_t(palette->arrayRead(i)) << 3;

uint16_t *paletteptr = &palette->arrayRead(0);
uint32_t x,y,byte,c,t=1<<12;

#define MODE2_INNER_LOOP_B				\
	       "	str %[c], [%[LCD], 0]"    "\n"	\
	       "	movs %[c], 252"		  "\n"	\
	       "	str %[t], [%[LCD], %[c]]" "\n"	\
	       "	subs %[x], 1"             "\n"	\
	       "	str %[t], [%[LCD], 124]"  "\n"	\
	       "	str %[t], [%[LCD], %[c]]" "\n"  \
    	       "	ldm %[scanline]!, {%[c]}" "\n"	\
	       "	str %[t], [%[LCD], 124]"  "\n"

    asm volatile(
	".syntax unified"         "\n"

	"mov r10, %[scanline]"    "\n"
	"mov r11, %[t]"           "\n"

	"mode2OuterLoop:"        "\n"

	"movs %[x], 110"          "\n"
	"mode2InnerLoopA:"


	"	ldrb %[byte], [%[scrbuf],0]"   "\n"
	"	lsrs %[c], %[byte], 4"    "\n"

	"	movs %[t], 15" "\n"
	"	ands %[byte], %[t]"    "\n"

	"	lsls %[c], 2"             "\n"
	"	ldr %[t], [%[paletteptr], %[c]]"      "\n"
	"	str %[t], [%[LCD], 0]"    "\n"
	"	stm %[scanline]!, {%[t]}" "\n"
	"	mov %[c], r11" "\n"
	"	movs %[t], 252"   "\n"
	"	str %[c], [%[LCD], %[t]]" "\n"
	"	lsls %[byte], %[byte], 2"             "\n"
	"	str %[c], [%[LCD], 124]"  "\n"
	"	str %[c], [%[LCD], %[t]]" "\n"
	"	ldr %[t], [%[paletteptr], %[byte]]"      "\n"	
	"	str %[c], [%[LCD], 124]"  "\n"

	"	str %[t], [%[LCD], 0]"    "\n"
	"	stm %[scanline]!, {%[t]}" "\n"
	"	mov %[c], r11" "\n"
	"	movs %[t], 252"   "\n"
	"	str %[c], [%[LCD], %[t]]" "\n"
	"	adds %[scrbuf], %[scrbuf], 1" "\n"
	"	str %[c], [%[LCD], 124]"  "\n"
	"	str %[c], [%[LCD], %[t]]" "\n"
	"	subs %[x], 2"          "\n"
	"	str %[c], [%[LCD], 124]"  "\n"
	"	bne mode2InnerLoopA"  "\n"

	"mov %[scanline], r10"    "\n"
	"movs %[x], 110"          "\n"
	"mov %[t], r11"           "\n"
    	       "	ldm %[scanline]!, {%[c]}" "\n"
	"mode2InnerLoopB:"
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	MODE2_INNER_LOOP_B
	"	bne mode2InnerLoopB"     "\n"

	"mov %[scanline], r10"    "\n"
	"movs %[t], 1"              "\n"
	"movs %[c], 88"             "\n"
	"add %[y], %[t]"            "\n" // y++... derpy, but it's the outer loop
	"cmp %[y], %[c]"            "\n"
	"bne mode2OuterLoop"       "\n" // if y != 88, loop

	: // outputs
	  [c]"+l" (c),
	  [t]"+l" (t),
	  [x]"+l" (x),
	  [y]"+h" (y),  // +:Read-Write l:lower (0-7) register
	  [scrbuf]"+l" (scrbuf)

	: // inputs
	  [LCD]"l" (0xA0002188),
	  [scanline]"l" (scanline),
	  [paletteptr]"l" (lpalette),
	  [byte]"l" (byte)
	: // clobbers
	  "cc", "r10", "r11"
	);


#undef MODE2_INNER_LOOP_B
