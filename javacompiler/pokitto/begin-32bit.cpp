#include <cstdint>
#include <cstdio>
#include <initializer_list>

#define FIXED_POINTS_USE_NAMESPACE
#define FIXED_POINTS_NO_RANDOM
#include "FixedPoints/FixedPoints.h"
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
    }
}

namespace up_java {
    namespace up_lang {

        class uc_Object {
        public:
            static uint16_t __next_generation__;
            static uc_Object *__first__;
            uint16_t __generation__, __refCount__ = 0;
            uc_Object *__next__;

            uc_Object(){
                __generation__ = __next_generation__;
                __next__ = __first__;
                __first__ = this;
            }

            virtual ~uc_Object(){}

            virtual bool __instanceof__( uint32_t id );

            virtual void __mark__(){ __generation__ = __next_generation__; }
            void __hold__(){ __refCount__++; }
            void __release__(){ __refCount__--; }
            static void __gc__();
        };
    }
}

using uc_Object = up_java::up_lang::uc_Object;

template<typename T>
class __ref__ {
    T *ptr;
public:
    __ref__():ptr(nullptr){};

    __ref__( T *p ):ptr(nullptr){
        (*this) = p;
    }

    __ref__(const __ref__ &o ):ptr(nullptr){
        (*this) = o.ptr;
    }

    __ref__<T> &operator =(T *p){
        if( p ) p->__hold__();
        if( ptr ) ptr->__release__();
        ptr = p;
        return *this;
    }

    ~__ref__(){
        if(ptr) ptr->__release__();
    }

    T *operator ->() const{
        return ptr;
    }

    operator T *() const {
        return ptr;
    }

};

uint32_t dudBytes;

template<typename T, bool isReference>
class uc_Array : public uc_Object {
    typedef T *TP;
    typedef uc_Array<T, isReference> Self;

public:
    TP *elements;
    uint32_t *refCount;
    uint32_t length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( uint32_t length ){
        elements = new TP[length];
        this->length = length;
        for( uint32_t i=0; i<length; ++i )
            elements[i] = nullptr;
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

    Self *loadValues( std::initializer_list<TP> init ){
        release();
        elements = new TP[init.size()];
        this->length = init.size();
        auto it = init.begin();
        for( uint32_t i=0; i<init.size(); ++i )
            elements[i] = *it++;
        return this;
    }

    TP& access( int32_t offset ){ // to-do: bounds-check?
        return elements[ offset ];
    }

    virtual void __mark__() override {
        uc_Object::__mark__();
        for( uint32_t i=0; i<length; ++i ){
            if( elements[i] )
                elements[i]->__mark__();
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

    uc_Array( uint32_t length ){
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


    Self *loadValues( std::initializer_list<T> init ){
        if( elements ) release();
        elements = new T[init.size()];
        this->length = init.size();
        auto it = init.begin();
        for( uint32_t i=0; i<init.size(); ++i )
            elements[i] = *it++;
        return this;
    }

    T& access( uint32_t offset ){ // to-do: bounds-check?
        if( offset >= length ){
            T *r = (T*) &dudBytes;
            dudBytes = 0;
            return *r;
        }
        return elements[ offset ];
    }

};

template<typename T>
using __array = __ref__<uc_Array<T, true>>;
template<typename T>
using __array_nat = __ref__<uc_Array<T, false>>;


uint16_t uc_Object::__next_generation__ = 1;
uc_Object *uc_Object::__first__ = nullptr;

void __on_failed_alloc(){
    uc_Object::__gc__();
}

void uc_Object::__gc__(){

    for( uc_Object *ptr = __first__; ptr; ptr = ptr->__next__ ){
        if( ptr->__refCount__ )
            ptr->__mark__();
    }

    uc_Object **prev = &__first__;
    for( uc_Object *ptr = __first__, *next; ptr; ptr = next ){
        next = ptr->__next__;
        if( ptr->__generation__ != __next_generation__ ){
            *prev = next;
            delete ptr;
        }else{
            prev = &ptr->__next__;
        }
    }
	
    __next_generation__++;

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

            bool __instanceof__( uint32_t id );

            char access( uint32_t i ){
                if(!ptr) return 0;
                return ptr[i];
            }
        
            uint32_t length(){
                if( !ptr ) return 0;
                const char *x = ptr;
                while( *x ) x++;
                return uintptr_t(x) - uintptr_t(ptr);
            }
        
            const char *__c_str(){
                return ptr;
            }

            static uc_String *valueOf( uint32_t v ){
                char *c = new char[11];
                miniitoa( v, c, 10 );
                return new uc_String(c);
            }
        };
    }    
}

__ref__<up_java::up_lang::uc_String> __str__( const char *s ){
    up_java::up_lang::uc_String *str = new up_java::up_lang::uc_String(s);
#ifndef POKITTO
    str->isStatic = true;
#endif    
    return str;
}

inline constexpr const void *__add__(const void *l, int32_t r ){
    return ((const uint8_t*)l)+r;
}

inline constexpr int64_t __add__(int64_t l, int64_t r){
    return l+r;
}

inline constexpr int __add__(uint32_t l, int32_t r){
    return l+r;
}

inline constexpr int __add__(int32_t l, uint32_t r){
    return l+r;
}

inline constexpr int __add__(uint32_t l, uint32_t r){
    return l+r;
}

inline constexpr int __add__(int32_t l, int32_t r){
    return l+r;
}

inline constexpr int16_t __add__(int16_t l, int16_t r){
    return l+r;
}

inline constexpr float __add__(float l, float r){
    return l+r;
}

inline constexpr double __add__(double l, double r){
    return l+r;
}

up_java::up_lang::uc_String *__add__(up_java::up_lang::uc_String *l, up_java::up_lang::uc_String *r){
    char *ch = new char[l->length() + r->length()];
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

volatile std::uint32_t __timer;
extern "C" {
    void SysTick_Handler(void) {
        __timer += 10;
    }
}
