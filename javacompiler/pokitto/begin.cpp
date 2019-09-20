#include <cstdint>
#include <cstdio>
#include <initializer_list>

#define FIXED_POINTS_USE_NAMESPACE
#define FIXED_POINTS_NO_RANDOM
#include "FixedPoints/FixedPoints.h"

#ifdef DEBUG
#define CRASH() (*((std::uint32_t*)0) = 1)
#else
#define CRASH()
#endif

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
#define __IDIV__( num, den ) ((*(LPC_ROM_API_T * *) 0x1FFF1FF8UL)->divApiBase->sidiv( (num), (den) ))
/* // actually runs slower on hardware

extern "C" unsigned __aeabi_uidiv(unsigned numerator, unsigned denominator){
    return __UDIV__(numerator, denominator);
}

extern "C" signed __aeabi_idiv(signed numerator, signed denominator){
    return __IDIV__(numerator, denominator);
}
*/

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

#ifndef POKITTO_BAS

using sptr_t = uint16_t;

constexpr void *__inflate_ptr__( sptr_t s ){
    return s ? 
        (void *) (std::uintptr_t(s)+0x10000000) :
        0;
}

constexpr sptr_t __deflate_ptr__( void *obj ){
    return obj ? std::uintptr_t(obj) - 0x10000000 : 0;
}


constexpr up_java::up_lang::uc_Object *__objFromShort__( sptr_t s ){
    return (up_java::up_lang::uc_Object *) (std::uintptr_t(s&~3)+0x10000000);
}

constexpr sptr_t __shortFromObj__( up_java::up_lang::uc_Object *obj ){
    return std::uintptr_t(obj) - 0x10000000;
}

#else

using sptr_t = uintptr_t;

constexpr void *__inflate_ptr__( sptr_t s ){
    return (void *) s;
}

constexpr sptr_t __deflate_ptr__( void *obj ){
    return (sptr_t) obj;
}


constexpr up_java::up_lang::uc_Object *__objFromShort__( sptr_t s ){
    return (up_java::up_lang::uc_Object *) std::uintptr_t(s&~3);
}

constexpr sptr_t __shortFromObj__( up_java::up_lang::uc_Object *obj ){
    return std::uintptr_t(obj);
}

#endif

bool __managed__ = true;

namespace up_java {
    namespace up_lang {

        class uc_Object {
        public:
            static uint32_t __gray_count__;
            static sptr_t __first__;
            sptr_t __next__;
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
            CRASH();
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
    
    sptr_t *p;
    uc_ArrayCPPIterator(sptr_t *p) : p(p) {}
    
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

    sptr_t *elements;
    up_java::up_lang::uc_int length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( up_java::up_lang::uc_int length ) : elements(nullptr), length(length) {
        if( length == 0 )
            return;
        elements = new sptr_t[length];
        for( up_java::up_lang::uc_int i=0; i<length; ++i )
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
        elements = new sptr_t[init.size()];
        this->length = init.size();
        auto it = init.begin();
        for( uint32_t i=0; i<init.size(); ++i )
            elements[i] = __deflate_ptr__(*it++);
        return this;
    }

    TP arrayRead( int32_t offset ){ // to-do: bounds-check?
        #ifdef DEBUG
        if( !elements || offset < 0 || offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif
        return static_cast<TP>( __inflate_ptr__(elements[ offset ]) );
    }

    TP arrayWrite( int32_t offset, const TP &value ){
        #ifdef DEBUG
        if( !elements || offset < 0 || offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif
        elements[ offset ] = __deflate_ptr__(value);
        return value;
    }

    void __mark__(int m) override {
        if( __is_marked__(m) )
            return;
        
        uc_Object::__mark__(m);
        
        if( !elements )
            return;
        
        for( up_java::up_lang::uc_int i=0; i<length; ++i ){
            if( elements[i] ){
                static_cast<TP>(__inflate_ptr__(elements[i]))->__mark__(m);
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
    up_java::up_lang::uc_int length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( up_java::up_lang::uc_int length ) : elements(nullptr) {
        this->length = length;
        if( length == 0 )
            return;
        elements = new T[length];
        for( up_java::up_lang::uc_int i=0; i<length; ++i )
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
        #ifdef DEBUG
        if( !elements || offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif
        return elements[ offset ];
    }

    T &arrayWrite( uint32_t offset, T value ){
        #ifdef DEBUG
        if( !elements || offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif
        elements[ offset ] = value;
        return elements[ offset ];
    }

};

class BoolRef {
public:
    std::uint32_t *bucket;
    std::uint32_t bit;
    
    operator int(){
        return (*bucket>>bit) & 1;
    }

    BoolRef& operator =(std::uint32_t v){
        if( v != 0 ) *bucket |= 1 << bit;
        else *bucket &= ~(1<<bit);
        return *this;
    }
};

template<>
class uc_Array<bool, false> : public uc_Object {
    typedef bool T;
    typedef T *TP;
    typedef uc_Array<T, false> Self;

public:
    union {
        std::uint32_t *elements;
        std::uint32_t small;
    };

    up_java::up_lang::uc_int length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( up_java::up_lang::uc_int length ) : elements(nullptr) {
        this->length = length;
        if( length > 32 ){
            elements = new std::uint32_t[length>>5];
            for( up_java::up_lang::uc_int i=0; i<(length>>5); ++i )
                elements[i] = 0;
        }else{
            small = 0;
        }
    }

    virtual ~uc_Array(){
        release();
    }

    void release(){
        if( length > 32 ){
            delete[] elements;
            elements = nullptr;
            length = 0;
        }
    }

    uc_ArrayIterator<Self, T, false> iterator(){
        return uc_ArrayIterator<Self, T, false>(*this);
    }

    Self *loadValues( const std::initializer_list<T> &init ){
        if( length > 32 ) release();
        this->length = init.size();

        auto it = init.begin();
        if( this->length > 32 ){
            elements = new std::uint32_t[init.size()>>5];
            for( uint32_t i=0; i<init.size(); ++i )
                elements[i>>5] |= *it++ ? 1<<(i&0x1F) : 0;
        }else{
            for( uint32_t i=0; i<init.size(); ++i )
                small |= *it++ ? 1<<(i&0x1F) : 0;
        }

        return this;
    }

    bool arrayRead( uint32_t offset ){ // to-do: bounds-check?
        #ifdef DEBUG
        if( offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif

        if( length > 32 )
            return (elements[ offset>>5 ] & (1<<(offset&0x1F))) != 0;
        else
            return (small&(1<<offset)) != 0;
    }

    void arrayWrite( uint32_t offset, T value ){
        BoolRef b;
        
        #ifdef DEBUG
        if( offset >= length ){
            __print__("Array access out of bounds\n");
            CRASH();
        }
        #endif

        if( length > 32 )
            b.bucket = &elements[offset>>5];
        else
            b.bucket = &small;

        b.bit = offset&0x1F;

        b = value;
        // return b;
    }

};

extern unsigned int __allocated_memory__;
uint32_t uc_Object::__gray_count__ = 0;
sptr_t uc_Object::__first__ = 0;

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
        "str %[tmp], [%[regs], 0x2C]	\n"
        "mov %[tmp], r12		\n"
        "str %[tmp], [%[regs], 0x30]	\n"
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
    
    for( sptr_t ptr = __first__; ptr>>2; ptr = obj->__next__ ){
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
        for( sptr_t ptr = __first__; ptr>>2; ptr = obj->__next__ ){
            obj = __objFromShort__(ptr);
            uint32_t m = obj->__next__&3;
            if(m==2){
                obj->__mark__(3);
                dirty = true;
            }
        }
    }
    
    sptr_t *prev = &__first__;
    for( sptr_t ptr = __first__, next; ptr>>2; ptr = next ){
        uc_Object *obj = __objFromShort__(ptr);
        next = obj->__next__;
        
        #ifdef DEBUG
        if( (next&3) == 2 ){
            __print__("Found Gray Exception\n");
            CRASH();
        }
        #endif
        
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
        class uc_String;
    }
}

class __str__T {
public:
    operator up_java::up_lang::uc_String*();
    operator __ref__<up_java::up_lang::uc_String>();
    up_java::up_lang::uc_String* operator->();
};

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
            virtual bool __instanceof__( uint32_t id );
            virtual void __mark__(int m);
            
            char *getPointer(){
                return (char*) ptr;
            }

            char arrayRead( uint32_t i ){
                if(!ptr) return 0;
                return ptr[i];
            }

            char arrayWrite( uint32_t i, char c ){
#ifdef DEBUG
                __print__("String modified exception\n");
                CRASH();
#endif                
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

            up_java::up_lang::uc_int hashCode(){
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

            static uc_String *valueOf( up_java::up_lang::uc_long l ){
                return valueOf(uint32_t(l));
            }

            static uc_String *valueOf( up_java::up_lang::uc_byte b ){
                char *c = new char[2];
                c[0] = b;
                c[1] = 0;
                return new uc_String(c);
            }

            static uc_String *valueOf( up_java::up_lang::uc_char c ){
                return valueOf( uc_byte(c) );
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

__str__T& __str__( const char *s ){
    return *(__str__T*)s;
}

__str__T::operator __ref__<up_java::up_lang::uc_String>(){
    return new up_java::up_lang::uc_String((const char*)this);
}

__str__T::operator up_java::up_lang::uc_String*(){
    return new up_java::up_lang::uc_String((const char*)this);
}

up_java::up_lang::uc_String* __str__T::operator->(){
    return new up_java::up_lang::uc_String((const char*)this);
}


char *concatenate(const char *l, const char *r ){
    int len = 1;

    const char *read = l;
    while(*read++) len++;

    read = r;
    while(*read++) len++;

    char *out = new char[len];
    char *write = out;
    write = out;
    while(*l) *write++ = *l++;
    while(*r) *write++ = *r++;

    *write = 0;
    return out;
}

up_java::up_lang::uc_String *operator +(up_java::up_lang::uc_String &l, up_java::up_lang::uc_String &r){
    __ref__<up_java::up_lang::uc_String> rl(&l), rr(&r);
    return new up_java::up_lang::uc_String( concatenate(l.__c_str(), r.__c_str()) );
}

up_java::up_lang::uc_String *operator +(const __str__T &l, up_java::up_lang::uc_String &r){
    __ref__<up_java::up_lang::uc_String> rr(&r);
    return new up_java::up_lang::uc_String( concatenate((char*)&l, r.__c_str()) );
}

up_java::up_lang::uc_String *operator +(up_java::up_lang::uc_String &l, const __str__T &r){
    __ref__<up_java::up_lang::uc_String> rl(&l);
    return new up_java::up_lang::uc_String( concatenate(l.__c_str(), (char*)&r) );
}

template <typename T>
up_java::up_lang::uc_String *operator +( up_java::up_lang::uc_String &l, T r ){
    __ref__<up_java::up_lang::uc_String> rl(&l);
    return l + *up_java::up_lang::uc_String::valueOf( r );
}

template <typename T>
up_java::up_lang::uc_String *operator +( T r, up_java::up_lang::uc_String &l ){
    __ref__<up_java::up_lang::uc_String> rl(&l);
    return *up_java::up_lang::uc_String::valueOf( r ) + l;
}

template <typename T>
up_java::up_lang::uc_String *operator +( const __str__T &l, T r ){
    return new up_java::up_lang::uc_String( concatenate((char*)&l, *up_java::up_lang::uc_String::valueOf( r )) );
}

template <typename T>
up_java::up_lang::uc_String *operator +( T r, const __str__T &l ){
    return new up_java::up_lang::uc_String( concatenate(*up_java::up_lang::uc_String::valueOf( r ), (char*)&l) );
}

up_java::up_lang::uc_String *operator +( const __str__T &l, up_java::up_lang::uc_int r ){
    char buff[13];
    miniitoa(r, buff, 10);
    return new up_java::up_lang::uc_String( concatenate((char*)&l, buff) );
}

up_java::up_lang::uc_String *operator +( up_java::up_lang::uc_int r, const __str__T &l ){
    char buff[13];
    miniitoa(r, buff, 10);
    return new up_java::up_lang::uc_String( concatenate(buff, (char*)&l) );
}

up_java::up_lang::uc_String *operator +( const __str__T &l, up_java::up_lang::uc_float r ){
    char buff[15];
    miniftoa(r, buff);
    return new up_java::up_lang::uc_String( concatenate((char*)&l, buff) );
}

template <typename T>
up_java::up_lang::uc_String *operator +( up_java::up_lang::uc_float r, const __str__T &l ){
    char buff[15];
    miniftoa(r, buff);
    return new up_java::up_lang::uc_String( concatenate(buff, (char*)&l) );
}


volatile std::uint32_t __timer;
extern "C" {
    void SysTick_Handler(void) {
        __timer += 100;
    }
}
