#include <cstdint>
#include <cstdio>
#include <initializer_list>

#define FIXED_POINTS_USE_NAMESPACE
#define FIXED_POINTS_NO_RANDOM
#include "FixedPoints/FixedPoints.h"

#ifndef POKITTO_BAS

typedef struct {
    int quot;
    int rem;
} IDIV_RETURN_T;

typedef struct {
    unsigned quot;
    unsigned rem;
} UIDIV_RETURN_T;

typedef struct {
    int (*sidiv)(int numerator, int denominator); /*!< Signed integer division */
    unsigned (*uidiv)(unsigned numerator, unsigned denominator); /*!< Unsigned integer division */
    IDIV_RETURN_T (*sidivmod)(int numerator, int denominator); /*!< Signed integer division with remainder */
    UIDIV_RETURN_T (*uidivmod)(unsigned numerator, unsigned denominator); /*!< Unsigned integer division
									    with remainder */
} ROM_DIV_API_T;

typedef struct {
const uint32_t usbdApiBase; /*!< USBD API function table base address */
const uint32_t reserved0;
/*!< Reserved */
const uint32_t reserved1;
/*!< Reserved */
const void *pPWRD; /*!< Power API function table base address */
const ROM_DIV_API_T *divApiBase; /*!< Divider API function table base address */
} LPC_ROM_API_T;

#define LPC_ROM_API 

#define __MODULO__( num, den ) ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->uidivmod( (num), (den) ).rem)

#define __UDIV__( num, den ) ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->uidiv( (num), (den) ))
#define __IDIV__( num, den ) ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->idiv( (num), (den) ))

void miniitoa(unsigned long n, char *buf, uint8_t base=10 ){
    unsigned long i = 0;

    do{
	UIDIV_RETURN_T div = ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->uidivmod( n, base ));
	char digit = div.rem;

	if( digit < 10 ) digit += '0';
	else digit += 'A';
	    
	buf[i++] = digit;
	n = div.quot;
	
    }while( n > 0 );

    buf[i--] = 0;

    for( unsigned long j=0; i>j; --i, ++j ){
	char tmp = buf[i];
	buf[i] = buf[j];
	buf[j] = tmp;
    }

}

#else

void miniitoa(unsigned long n, char *buf, uint8_t base=10 ){
    unsigned long i = 0;

    do{
	// UIDIV_RETURN_T div = ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->uidivmod( n, base ));
	char digit = n % base;

	if( digit < 10 ) digit += '0';
	else digit += 'A';
	    
	buf[i++] = digit;
	n /= base;
	
    }while( n > 0 );

    buf[i--] = 0;

    for( unsigned long j=0; i>j; --i, ++j ){
	char tmp = buf[i];
	buf[i] = buf[j];
	buf[j] = tmp;
    }

}
#endif

void __print__( const char *str ){
    char *usart = (char*) 0x40008000;
    usart[0xC] = 3;
    while( *str )
        usart[0] = *str++;
}

void __print__( int i ){
    char buff[13];
    miniitoa(i, buff, 10);
    __print__(buff);
}

extern "C" void __wrap_exit(int);
extern void *_codesize;
extern "C" void __top_Ram0_32();

namespace up_java {
    namespace up_lang {
        typedef int64_t uc_long;
        typedef uint64_t uc_ulong;
        typedef int32_t uc_int;
        typedef uint32_t uc_uint;
        typedef int16_t uc_short;
        typedef uint16_t uc_ushort;
        typedef int8_t uc_byte;
        typedef uint8_t uc_ubyte;
        typedef bool uc_boolean;
        typedef FixedPoints::SFixed<23, 8> uc_float;
        typedef float uc_double;
        typedef char uc_char;
        typedef void uc_void;
        typedef const void *uc_pointer;

        class uc_Object;
    }
}

void miniftoa( up_java::up_lang::uc_float v, char *c ){
    using FLOAT = up_java::up_lang::uc_float;
    char *cp = c;
    if( v < 0 ){
        *cp++ = '-';
        v = -v;
    }
    miniitoa( v.getInteger(), cp, 10 );

    while(*cp)
        cp++;
                
    if( cp - c < 9 ){
        FLOAT f = FLOAT::fromInternal(v.getFraction());
        FLOAT ten = 10;
        *cp++ = '.';
        while( f.getInternal() && cp - c < 10 ){
            f *= ten;
            int digit = f.getInteger();
            f = FLOAT::fromInternal(f.getFraction());
            *cp++ = '0' + digit;
        }
        *cp++ = 0;
    }
}

void __print__( up_java::up_lang::uc_float f ){
    char buff[15];
    miniftoa(f, buff);
    __print__(buff);
}

constexpr up_java::up_lang::uc_Object *__inflate_ptr__( uint16_t s ){
    return s ? 
        (up_java::up_lang::uc_Object *) (std::uintptr_t(s)+0x10000000) :
        0;
}

constexpr uint16_t __deflate_ptr__( up_java::up_lang::uc_Object *obj ){
    return obj ? std::uintptr_t(obj) - 0x10000000 : 0;
}


constexpr up_java::up_lang::uc_Object *__objFromShort__( uint16_t s ){
    return (up_java::up_lang::uc_Object *) (std::uintptr_t(s&~3)+0x10000000);
}

constexpr uint16_t __shortFromObj__( up_java::up_lang::uc_Object *obj ){
    return std::uintptr_t(obj) - 0x10000000;
}

bool __managed__ = true;

namespace up_java {
    namespace up_lang {

        class uc_Object {
        public:
            static uint32_t __gray_count__;
            static uint16_t __first__;
            uint16_t __next__;
            uint16_t __refCount__;

            uc_Object(){
                if( __managed__ ){
                    __refCount__ = 0;
                    __next__ = __first__;
                    __first__ = __shortFromObj__(this);
                }else{
                    __next__ = 3;
                    __refCount__ = 1;
                }
            }

            virtual ~uc_Object(){}
            
            virtual uint32_t __sizeof__( );
            virtual bool __instanceof__( uint32_t id );

            bool __is_marked__(int m){
                uint32_t c = __next__&3;
                
                if( m == 2 ){
                    if( !c ){
                        __next__ |= 2;
                        __gray_count__++;
                    }
                    return true;
                }
                
                return c == 3;
            }

            virtual void __mark__(int m){
                if( (__next__&3) == 2 )
                    __gray_count__--;
                __next__ |= m;
            }
            void __hold__(){ __refCount__++; }
            void __release__(){ __refCount__--; }
            static void __gc__();
        };
    }
}

using uc_Object = up_java::up_lang::uc_Object;

template<typename T>
class __ref__ {
public:
    T *ptr;
    
    __ref__():ptr(nullptr){
    };

    __ref__( T *p ):ptr(nullptr){
        *this = p;
    }

    template<typename OT>
    __ref__(__ref__<OT> &o):ptr(nullptr){
        *this = o.ptr;
    }
    
    template<typename OT>
    __ref__(const __ref__<OT> &o):ptr(nullptr){
        *this = o.ptr;
    }

    template<typename OT>
    __ref__(__ref__<OT>&&o):ptr(nullptr){
        ptr = o.ptr;
        o.ptr = nullptr;
    }

    template<typename OT>
    __ref__(const __ref__<OT>&&o):ptr(nullptr){
        ptr = o.ptr;
        ptr->__hold__();
    }

    __ref__<T> &operator =(T *p){
        if( p ) p->__hold__();
        if( ptr ) ptr->__release__();
        ptr = p;
        return *this;
    }

    template<typename OT>
    __ref__<T> &operator =(const __ref__<OT> &&ot){
        *this = ot.ptr;
        return *this;
    }

    ~__ref__(){
        if(ptr) ptr->__release__();
    }

    T *operator ->() const {
        if(!ptr){
            __print__("Null pointer exception\n");
        }
        return ptr;
    }

    operator T *() const {
        return ptr;
    }

};

uint32_t dudBytes;

template<typename T, bool isReference>
class uc_ArrayCPPIterator {
public:
    typedef T *TP;
    typedef uc_ArrayCPPIterator<T, isReference> Self;
    
    uint16_t *p;
    uc_ArrayCPPIterator(uint16_t *p) : p(p) {}
    
    Self& operator++() {
        p++;
        return *this;
    }
    
    bool operator != (const Self &other){
        return p != other.p;
    }

    T* operator *(){
        return static_cast<TP>(__inflate_ptr__( *p ));
    }
};

template<typename T>
class uc_ArrayCPPIterator<T, false> {
public:
    typedef T *TP;
    typedef uc_ArrayCPPIterator<T, false> Self;
    
    TP p;
    uc_ArrayCPPIterator(TP p) : p(p) {}
    
    Self& operator++() {
        p++;
        return *this;
    }
    
    bool operator != (const Self &other){
        return p != other.p;
    }

    T& operator *(){
        return *p;
    }
};

template<typename TA, typename T, bool isReference>
class uc_ArrayIterator {
public:
    const TA& array;
    typedef uc_ArrayCPPIterator<T, isReference> Iterator;

    uc_ArrayIterator(const TA &array) : array(array) {
    }
    
    Iterator begin() const {
        return Iterator(array.elements);
    }

    Iterator end() const {
        return Iterator(array.elements + array.length);
    }
};


template<typename T, bool isReference>
class uc_Array : public uc_Object {
public:

    typedef T *TP;
    typedef uc_Array<T, isReference> Self;

    uint16_t *elements;
    uint32_t length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( uint32_t length ) : elements(nullptr), length(length) {
        elements = new uint16_t[length];
        for( uint32_t i=0; i<length; ++i )
            elements[i] = 0;
    }

    virtual ~uc_Array(){
        release();
    }

    uc_ArrayIterator<Self, T, isReference> iterator(){
        return uc_ArrayIterator<Self, T, isReference>(*this);
    }

    void release(){
        if( elements ){
            delete[] elements;
            elements = nullptr;
        }
    }

    Self *loadValues( std::initializer_list<TP> init ){
        release();
        elements = new uint16_t[init.size()];
        this->length = init.size();
        auto it = init.begin();
        for( uint32_t i=0; i<init.size(); ++i )
            elements[i] = __deflate_ptr__(*it++);
        return this;
    }

    __ref__<T> arrayRead( int32_t offset ){ // to-do: bounds-check?
        if( !elements || offset < 0 || offset >= length ){
            __print__("Array access out of bounds\n");
        }
        return static_cast<TP>( __inflate_ptr__(elements[ offset ]) );
    }

    TP arrayWrite( int32_t offset, const TP &value ){
        if( !elements || offset < 0 || offset >= length ){
            __print__("Array access out of bounds\n");
        }
        
        elements[ offset ] = __deflate_ptr__(value);
        return value;
    }

    void __mark__(int m) override {
        if( __is_marked__(m) )
            return;
        
        uc_Object::__mark__(m);
        
        if( !elements )
            return;
        
        for( uint32_t i=0; i<length; ++i ){
            if( elements[i] ){
                __inflate_ptr__(elements[i])->__mark__(m);
            }
        }
    }

};

template<typename T>
class uc_Array<T, false> : public uc_Object {
    typedef T *TP;
    typedef uc_Array<T, false> Self;

public:
    T *elements;
    uint32_t length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( uint32_t length ) : elements(nullptr) {
        elements = new T[length];
        this->length = length;
        for( uint32_t i=0; i<length; ++i )
            elements[i] = 0;
    }

    virtual ~uc_Array(){
        release();
    }

    void release(){
        if( elements ){
            delete[] elements;
            elements = nullptr;
        }
    }

    uc_ArrayIterator<Self, T, false> iterator(){
        return uc_ArrayIterator<Self, T, false>(*this);
    }

    Self *loadValues( const std::initializer_list<T> &init ){
        if( elements ) release();
        elements = new T[init.size()];
        this->length = init.size();
        auto it = init.begin();
        for( uint32_t i=0; i<init.size(); ++i )
            elements[i] = *it++;
        return this;
    }

    T &arrayRead( uint32_t offset ){ // to-do: bounds-check?
        if( !elements || offset >= length ){
            __print__("Array access out of bounds\n");
        }
        return elements[ offset ];
    }

    T &arrayWrite( uint32_t offset, T value ){
        if( !elements || offset >= length ){
            __print__("Array access out of bounds\n");
        }
        elements[ offset ] = value;
        return elements[ offset ];
    }

};

template<typename T>
using __array = __ref__<uc_Array<T, true>>;
template<typename T>
using __array_nat = __ref__<uc_Array<T, false>>;

extern unsigned int __allocated_memory__;
uint32_t uc_Object::__gray_count__ = 0;
uint16_t uc_Object::__first__ = 0;

void __on_failed_alloc(){
    uc_Object::__gc__();
}

extern "C" void _vStackTop(void);

void uc_Object::__gc__(){
    uintptr_t *stackTop = (uintptr_t *) &_vStackTop;
    volatile uintptr_t regs[13], tmp = 0;
    asm volatile(
        ".syntax unified		\n"
        "mov %[tmp], r0			\n"
        "str %[tmp], [%[regs], 0x0]	\n"
        "mov %[tmp], r1			\n"
        "str %[tmp], [%[regs], 0x4]	\n"
        "mov %[tmp], r2			\n"
        "str %[tmp], [%[regs], 0x8]	\n"
        "mov %[tmp], r3			\n"
        "str %[tmp], [%[regs], 0xC]	\n"
        "mov %[tmp], r4			\n"
        "str %[tmp], [%[regs], 0x10]	\n"
        "mov %[tmp], r5			\n"
        "str %[tmp], [%[regs], 0x14]	\n"
        "mov %[tmp], r6			\n"
        "str %[tmp], [%[regs], 0x18]	\n"
        "mov %[tmp], r7			\n"
        "str %[tmp], [%[regs], 0x1C]	\n"
        "mov %[tmp], r8			\n"
        "str %[tmp], [%[regs], 0x20]	\n"
        "mov %[tmp], r9			\n"
        "str %[tmp], [%[regs], 0x24]	\n"
        "mov %[tmp], r10		\n"
        "str %[tmp], [%[regs], 0x28]	\n"
        "mov %[tmp], r11		\n"
        "str %[tmp], [%[regs], 0x28]	\n"
        "mov %[tmp], r12		\n"
        "str %[tmp], [%[regs], 0x28]	\n"
        :
        [tmp]"+l"(tmp)
        :
        [regs]"l"(regs)
        :
        "memory", "cc"
        );
    uintptr_t *stackBottom = (uintptr_t *) regs;
    
    uc_Object *obj;
    __gray_count__ = 0;
    
    for( uint16_t ptr = __first__; ptr>>2; ptr = obj->__next__ ){
        obj = __objFromShort__(ptr);
        uint32_t m = obj->__next__&3;
        uint32_t refCount = obj->__refCount__;

        if( !m && !refCount ){            
            for( uintptr_t *ptr = stackBottom; ptr != stackTop; ++ptr ){
                if( *ptr < (uintptr_t) obj || *ptr > (uintptr_t(obj)+obj->__sizeof__()) )
                    continue;
                refCount = 1;
                break;
            }
        }

        if( (!m && refCount) || (m == 2) ){
            obj->__mark__(3);
        }
    }

    bool dirty = true;
    while( dirty ){
        dirty = false;
        for( uint16_t ptr = __first__; ptr>>2; ptr = obj->__next__ ){
            obj = __objFromShort__(ptr);
            uint32_t m = obj->__next__&3;
            if(m==2){
                obj->__mark__(3);
                dirty = true;
            }
        }
    }
    
    uint16_t *prev = &__first__;
    for( uint16_t ptr = __first__, next; ptr>>2; ptr = next ){
        uc_Object *obj = __objFromShort__(ptr);
        next = obj->__next__;
        if( (next&3) == 2 ){
            __print__("Found Gray Exception\n");
        }
        if( (next&3) != 3 ){
            *prev = next & ~3;
            delete obj;
        }else{
            obj->__next__ &= ~3;
            prev = &obj->__next__;
        }
    }
	
}

namespace up_java {
    namespace up_lang {
        class uc_String : public uc_Object {
            const char *ptr;
        
        public:
#ifndef POKITTO
            bool isStatic;
#endif
        
            uc_String(){
                ptr = nullptr;
#ifndef POKITTO
                isStatic = false;
#endif
            }
        
            ~uc_String(){
#ifndef POKITTO
                if( !isStatic )
#else
                    if( std::uintptr_t(ptr) >= 0x10000000 )   
#endif
                        delete[] ptr;
            }
        
            uc_String(const char *str) : ptr(str){
#ifndef POKITTO
                isStatic = false;
#endif
            }

            virtual uint32_t __sizeof__( );
            bool __instanceof__( uint32_t id );

            char *getPointer(){
                return (char*) ptr;
            }

            char arrayRead( uint32_t i ){
                if(!ptr) return 0;
                return ptr[i];
            }

            char arrayWrite( uint32_t i, char c ){
                __print__("String modified exception\n");
                return c;
            }
        
            uint32_t length(){
                if( !ptr ) return 0;
                const char *x = ptr;
                while( *x ) x++;
                return uintptr_t(x) - uintptr_t(ptr);
            }

            bool equals( const char *other ){
                if( !other )
                    return false;

                const char *x = ptr;
                const char *y = other;
                while( *x && *x == *y ){
                    x++;
                    y++;
                }

                return *x == *y;
            }

            bool equals( uc_String *other ){
                if( !other )
                    return false;
                return equals( other->__c_str() );
            }

            int hashCode(){
                int hash = 7;
                for( int i=0; ptr[i]; ++i ){
                    hash = hash*31 + ptr[i];
                }
                return hash;
            }

            int indexOf( char c ){
                for( int i=0; ptr[i]; ++i ){
                    if(ptr[i] == c)
                        return i;
                }
                return -1;
            }

            uc_String *substring(int start, int end){
                const char *r = ptr;
                while( start ){
                    if( !*r )
                        return new uc_String("");
                    r++;
                    start--;
                    end--;
                }
                
                char *w = new char[end + 1];
                while( end && *r ){
                    *w++ = *r++;
                    end--;
                }
                *w = 0;
                
                return new uc_String(w);
            }

            uc_String *substring(int start){
                return substring(0, length());
            }

            const char *__c_str(){
                return ptr;
            }

            static uc_String *valueOf( up_java::up_lang::uc_float v ){
                char *c = new char[15];
                miniftoa( v, c );
                return new uc_String(c);
            }
            
            static uc_String* valueOf( int32_t v ){
                char *c = new char[11];
                char *cp = c;
                if( v < 0 ){
                    *cp++ = '-';
                    v = -v;
                }
                miniitoa( v, cp, 10 );
                return new uc_String(c);
            }

            static uc_String* valueOf( uint32_t v ){
                char *c = new char[11];
                miniitoa( v, c, 10 );
                return new uc_String(c);
            }

            void __hold__();
            void __release__();

        };
    }    
}

up_java::up_lang::uc_String* __str__( const char *s ){
    return new up_java::up_lang::uc_String(s);
}

inline constexpr const void *__add__(const void *l, int32_t r ){
    return ((const uint8_t*)l)+r;
}

inline constexpr int64_t __add__(int64_t l, int64_t r){
    return l+r;
}

inline constexpr int32_t __add__(uint32_t l, int32_t r){
    return l+r;
}

inline constexpr int32_t __add__(int32_t l, uint32_t r){
    return l+r;
}

inline constexpr uint32_t __add__(uint32_t l, uint32_t r){
    return l+r;
}

inline constexpr int32_t __add__(int32_t l, int32_t r){
    return l+r;
}

inline constexpr int16_t __add__(int16_t l, int16_t r){
    return l+r;
}

inline constexpr up_java::up_lang::uc_float __add__(up_java::up_lang::uc_float l, up_java::up_lang::uc_float r){
    return l+r;
}

inline constexpr double __add__(double l, double r){
    return l+r;
}

up_java::up_lang::uc_String *__add__(up_java::up_lang::uc_String *l, up_java::up_lang::uc_String *r){
    char *ch = new char[l->length() + r->length() + 1];
    const char *lch = l->__c_str();
    const char *rch = r->__c_str();
    up_java::up_lang::uc_String *ret = new up_java::up_lang::uc_String( ch );
    char *i = ch;
    if( lch ) while( *lch ) *i++ = *lch++;
    if( rch ) while( *rch ) *i++ = *rch++;
    *i = 0;
    return ret;
}

up_java::up_lang::uc_String *__add__(up_java::up_lang::uc_String *l, up_java::up_lang::uc_int r ){
    up_java::up_lang::uc_String *sr = up_java::up_lang::uc_String::valueOf( r );
    return __add__(l, sr);
}

up_java::up_lang::uc_String *__add__(up_java::up_lang::uc_String *l, up_java::up_lang::uc_float r ){
    up_java::up_lang::uc_String *sr = up_java::up_lang::uc_String::valueOf( r );
    return __add__(l, sr);
}

volatile std::uint32_t __timer;
extern "C" {
    void SysTick_Handler(void) {
        __timer += 100;
    }
}
