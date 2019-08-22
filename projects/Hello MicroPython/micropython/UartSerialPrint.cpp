
#include "Pokitto.h"
#include <cstdarg>
#include <stdio.h>

extern "C" int pc_putc(int c) { return putchar(c);}
extern "C" int pc_getc() {return 0;}
extern "C" void pc_puts(const char* strWithNull) { puts(strWithNull); }
extern "C" void pc_putsn(const char* str, int len) {}
extern "C" int pc_printf(const char* format, ...) {return 0;}

