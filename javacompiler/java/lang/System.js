module.exports = `
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
            __inline_cpp__("#ifdef POKITTO\n*((uint32_t*)p) = v;\n#endif\n");
        }
        public static uint read32( uint p ){
            uint out;
            __inline_cpp__("#ifdef POKITTO\nout = *((uint32_t*)p);\n#endif\n");
            return out;
        }
        public static void write8( uint p, byte v ){
            __inline_cpp__("#ifdef POKITTO\n*((uint8_t*)p) = v;\n#endif\n");
        }
        public static byte read8( uint p ){
            byte out;
            __inline_cpp__("#ifdef POKITTO\nout = *((uint8_t*)p);\n#endif\n");
            return out;
        }
    }

    public static void gc(){
        __inline_cpp__("uc_Object::__gc__()");
    }

    public static uint currentTimeMillis(){
        __inline_cpp__("#ifdef POKITTO\nreturn __timer;\n#else\n");
__inline_cpp__("using namespace std::chrono;\n\
return duration_cast< milliseconds >(\n\
    system_clock::now().time_since_epoch()\n\
).count();\n\
#endif\n");
        return 0;
    }

    public static class out {

        public static void println( String s ){
            __inline_cpp__("std::printf(\\"%s\\\\n\\", s->__c_str())");
        }

        public static void println( int s ){
            __inline_cpp__("std::printf(\\"%d\\\\n\\", (int) s)");
        }

    }
    
}
`;
