package java.lang;

public class System extends Object {

    public static class memory {

	public static uint LDR( pointer p ){
		return __inline_cpp__("*((uint32_t*)p)");
	}
	public static ushort LDRH( pointer p ){
		return __inline_cpp__("*((uint16_t*)p)");
	}
	public static ubyte LDRB( pointer p ){
		return __inline_cpp__("*((uint8_t*)p)");
	}
	public static void STR( pointer p, uint v ){
		__inline_cpp__("*((uint32_t*)p) = v;");
	}
	public static void STRH( pointer p, ushort v ){
		__inline_cpp__("*((uint16_t*)p) = v;");
	}
	public static void STRB( pointer p, ubyte v ){
		__inline_cpp__("*((uint8_t*)p) = v;");
	}

        public static void write32( uint p, uint v ){
            __inline_cpp__("#ifdef POKITTO
*((uint32_t*)p) = v;
#endif
");
        }
        public static uint read32( uint p ){
            uint out;
            __inline_cpp__("#ifdef POKITTO
out = *((uint32_t*)p);
#endif
");
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

    public static void exit(int num){
        __inline_cpp__("::exit(num)");
    }

    public static void gc(){
        __inline_cpp__("uc_Object::__gc__()");
    }

    private static long bootTime;
    public static long currentTimeMillis(){
        __inline_cpp__("
#ifdef POKITTO
	if(!bootTime){
		bootTime = ((uint32_t*)0x40024000)[2];
		bootTime *= 1000;
	}

	unsigned int *SysTick = (unsigned int *) 0xE000E010UL;
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

    public static class out {

        public static void print( String s ){
            __inline_cpp__("__print__(s->__c_str())");
        }

        public static void print( int s ){
            __inline_cpp__("__print__((int) s)");
        }

        public static void println( String s ){
            __inline_cpp__("__print__(s->__c_str())");
            __inline_cpp__("__print__(\"\\n\")");
        }

        public static void println( int s ){
            __inline_cpp__("__print__((int) s)");
            __inline_cpp__("__print__(\"\\n\")");
        }

    }
    
}
