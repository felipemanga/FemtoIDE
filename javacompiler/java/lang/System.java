package java.lang;

public class System {

    public static class memory {

	public static uint LDR( pointer p ){
            uint ret;
            __inline_cpp__("ret = *((volatile uint32_t*)p)");
            return ret;
	}
	public static ushort LDRH( pointer p ){
            ushort ret;
            __inline_cpp__("ret = *((volatile uint16_t*)p)");
            return ret;
	}
	public static ubyte LDRB( pointer p ){
            ubyte ret;
            __inline_cpp__("ret = *((volatile uint8_t*)p)");
            return ret;
	}

	public static void STR( pointer p, uint v ){
		__inline_cpp__("*((volatile uint32_t*)p) = v;");
	}
	public static void STRH( pointer p, ushort v ){
		__inline_cpp__("*((volatile uint16_t*)p) = v;");
	}
	public static void STRB( pointer p, ubyte v ){
		__inline_cpp__("*((volatile uint8_t*)p) = v;");
	}

	public static void SET( pointer p, uint v ){
		__inline_cpp__("*((volatile uint32_t*)p) |= v;");
	}
	public static void SETH( pointer p, ushort v ){
		__inline_cpp__("*((volatile uint16_t*)p) |= v;");
	}
	public static void SETB( pointer p, ubyte v ){
		__inline_cpp__("*((volatile uint8_t*)p) |= v;");
	}

	public static void CLR( pointer p, uint v ){
		__inline_cpp__("*((volatile uint32_t*)p) &= ~v;");
	}
	public static void CLRH( pointer p, ushort v ){
		__inline_cpp__("*((volatile uint16_t*)p) &= ~v;");
	}
	public static void CLRB( pointer p, ubyte v ){
		__inline_cpp__("*((volatile uint8_t*)p) &= ~v;");
	}
        
        public static void write32( uint p, uint v ){
            __inline_cpp__("*((volatile uint32_t*)p) = v;");
        }
        public static uint read32( uint p ){
            uint out;
            __inline_cpp__("out = *((volatile uint32_t*)p);");
            return out;
        }
        public static void write8( uint p, byte v ){
            __inline_cpp__("#ifdef POKITTO
*((uint8_t*)p) = v;
#endif
");
        }
        public static byte read8( uint p ){
            byte out;
            __inline_cpp__("#ifdef POKITTO
out = *((uint8_t*)p);
#endif
");
            return out;
        }
    }

    /// Terminates the program.
    public static void exit(int num){
        __inline_cpp__("::__wrap_exit(num)");
    }

    /// Runs the garbage collector.
    public static void gc(){
        __inline_cpp__("uc_Object::__gc__()");
    }

    private static long bootTime;

    /// Returns the amount of milliseconds since the epoch
    public static long currentTimeMillis(){
        __inline_cpp__("
#ifdef POKITTO
	if(!bootTime){
		bootTime = ((uint32_t*)0x40024000)[2];
		bootTime *= 1000;
	}

	volatile unsigned int *SysTick = (unsigned int *) 0xE000E010UL;
	uint32_t systick_ms = ((((SysTick[1]-SysTick[2])>>9)*699)>>16);
	return bootTime + __timer + systick_ms;
#else
	using namespace std::chrono;
	return duration_cast< milliseconds >(
	    system_clock::now().time_since_epoch()
	).count();
#endif
");
        return 0;
    }

    /// Contains functions for manipulating the standard output stream.
    public static class out {

        /// Prints a `String` to the standard output stream.
        public static void print( String s ){
            __inline_cpp__("__print__(s->__c_str())");
        }

        /// Prints an `int` to the standard output stream.
        public static void print( int s ){
            __inline_cpp__("__print__((int) s)");
        }

        /// Prints a `String` to the standard output stream, and then terminates the line.
        public static void println( String s ){
            __inline_cpp__("__print__(s->__c_str())");
            __inline_cpp__("__print__(\"\\n\")");
        }

        /// Prints a `long` to the standard output stream, and then terminates the line.
        public static void println( long s ){
            __inline_cpp__("__print__((int) s)");
            __inline_cpp__("__print__(\"\\n\")");
        }

        /// Prints a `float` to the standard output stream, and then terminates the line.
        public static void println( float s ){
            __inline_cpp__("__print__( s)");
            __inline_cpp__("__print__(\"\\n\")");
        }

    }
    
}
