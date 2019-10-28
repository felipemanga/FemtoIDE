uint8_t *scrbuf = (uint8_t*) buffer->elements;
uint16_t *paletteptr = (uint16_t*) palette->elements;
uint8_t offset = 0;

#define MODE13_INNER_LOOP_A						\
	       "	add %[t], %[t], r10"	   "\n" 		\
	       "	uxtb %[c], %[t] " "\n"				\
	       "	lsls %[c], 1"             "\n"			\
	       "	ldrh %[t], [%[paletteptr], %[c]]"      "\n"	\
	       "	lsls %[t], %[t], 3"       "\n"			\
	       "	str %[t], [%[LCD], 0]"    "\n"			\
	       "	movs %[c], 252"   "\n"				\
	       "	str %[offset], [%[LCD], %[c]]" "\n"		\
	       "	stm %[scanline]!, {%[t]}"      "\n"		\
	       "	str %[offset], [%[LCD], 124]"  "\n"		\
	       "	str %[offset], [%[LCD], %[c]]" "\n"		\
	       "	adds %[scrbuf], %[scrbuf], 1" "\n"		\
	       "	ldrb %[t], [%[scrbuf],0]"   "\n"		\
	       "	str %[offset], [%[LCD], 124]"  "\n"

// This can be made 1 cycle faster (x -= 10 instead of x--),
// but there will be noise
#define MODE13_INNER_LOOP_B					\
	       "	str %[c], [%[LCD], 0]"    "\n"		\
	       "	str %[offset], [%[LCD], %[t]]" "\n"	\
	       "	ldr %[c], [%[scanline]]"   "\n"		\
	       "	str %[offset], [%[LCD], 124]"  "\n"	\
	       "	str %[offset], [%[LCD], %[t]]" "\n"	\
	       "	adds %[scanline], 4"             "\n"	\
	       "	subs %[x], 1"			"\n"	\
	       "	str %[offset], [%[LCD], 124]"  "\n"

// void Pokitto::lcdRefreshMode13(uint8_t * scrbuf, uint16_t* paletteptr, uint8_t offset){
   uint32_t scanline[110]; // read two nibbles = pixels at a time
   uint32_t x, y=0, c, t;

   asm volatile(
	 ".syntax unified"              "\n"
	 "mov r10, %[offset]"           "\n"
	 "movs %[offset], 1"            "\n"
	 "lsls %[offset], %[offset], 12""\n"

	 "mode13OuterLoop:"             "\n"

	 "movs %[x], 110"               "\n"
	 "ldrb %[t], [%[scrbuf],0]"     "\n"
	 "mode13InnerLoopA:"
	 MODE13_INNER_LOOP_A
	 MODE13_INNER_LOOP_A
	 "	subs %[x], 2"           "\n"
	 "	bne mode13InnerLoopA"   "\n"

	 "subs %[scanline], 220"        "\n"
	 "subs %[scanline], 220"        "\n"

	 "movs %[x], 110"               "\n"
	 "movs %[t], 252"               "\n"
	 "ldm %[scanline]!, {%[c]}"     "\n"
	 "mode13InnerLoopB:"
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 MODE13_INNER_LOOP_B
	 "bne mode13InnerLoopB"      "\n"

	 "subs %[scanline], 220"     "\n"
	 "subs %[scanline], 224"     "\n"
	 "movs %[t], 1"              "\n"
	 "movs %[c], 88"             "\n"
	 "add %[y], %[t]"            "\n"
	 "cmp %[y], %[c]"            "\n"
	 "bne mode13OuterLoop"       "\n" // if y != 88, loop

	 : // outputs
	   [c]"+l" (c),
	   [t]"+l" (t),
	   [x]"+l" (x),
	   [y]"+h" (y),  // +:Read-Write l:lower (0-7) register
	   [scrbuf]"+l" (scrbuf),
	   [offset]"+l" (offset)

	 : // inputs
	   [LCD]"l" (0xA0002188),
	   [scanline]"l" (scanline),
	   [paletteptr]"l" (paletteptr)

	 : // clobbers
	   "cc", "r10"
       );

#undef MODE13_INNER_LOOP_A
#undef MODE13_INNER_LOOP_B

