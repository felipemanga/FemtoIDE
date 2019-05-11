#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <chrono>

void miniitoa(unsigned long n, char *buf, uint8_t base=10 ){
    sprintf(buf, "%lu", n);
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
        typedef float uc_float;
        typedef double uc_double;
        typedef char uc_char;
        typedef void uc_void;
        typedef const void *uc_pointer;

        class uc_Object;
    }
}

namespace up_java {
    namespace up_lang {

        class uc_Object {
        public:
            static uint16_t __next_generation__;
            static uc_Object *__first__;
            uint16_t __generation__ = 0, __refCount__ = 0;
            uc_Object *__next__;

            uc_Object(){
                __next__ = __first__;
                __first__ = this;
                // printf("creating\n");
            }

            virtual ~uc_Object(){
                // printf("destroying\n");
            };
            virtual bool __instanceof__( uint32_t id );
            
            bool __is_marked__(){
                return __generation__ == __next_generation__;
            }
            
            virtual void __mark__(){
                __generation__ = __next_generation__;
            }
            virtual void __hold__(){
                __refCount__++;
            }
            virtual void __release__(){
                __refCount__--;
                // printf("release %p %d\n", this, __refCount__ );
            }
            static void __gc__();
        };
    }
}

using uc_Object = up_java::up_lang::uc_Object;

template<typename T>
class __ref__ {
    T *ptr;
public:
    __ref__():ptr(nullptr){
        printf("ref empty %p\n", this);
    };

    __ref__( T *p ):ptr(nullptr){
        printf("ref assign %p from %p\n", p, this);
        *this = p;
    }

    template<typename OT>
    __ref__(__ref__<OT> &o):ptr(nullptr){
        printf("ref copy %p from %p\n", o.ptr, this);
        *this = o.ptr;
    }
    
    template<typename OT>
    __ref__(const __ref__<OT> &o):ptr(nullptr){
        printf("ref const copy %p from %p\n", o.ptr, this);
        *this = o.ptr;
    }

    template<typename OT>
    __ref__(__ref__<OT>&&o):ptr(nullptr){
        printf("move ref %p from %p to %p\n", o.ptr, &o, this);
        ptr = o.ptr;
        o.ptr = nullptr;
    }

    template<typename OT>
    __ref__(const __ref__<OT>&&o):ptr(nullptr){
        ptr = o.ptr;
        ptr->__hold__();
    }
    
    __ref__<T> &operator =(T *p){
        printf("(ref %p from %p)\n", p, this);
        if( p ){
            p->__hold__();
        }
        if( ptr ){
            ptr->__release__();
        }
        ptr = p;
        return *this;
    }

    template<typename OT>
    __ref__<T> &operator =(const __ref__<OT> &&ot){
        *this = ot.ptr;
        return *this;
    }

    ~__ref__(){
        if(ptr){
            ptr->__release__();
        }
    }

    T *operator ->() const {
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
    uint32_t length;

    uc_Array() : elements(nullptr), length(0){}

    uc_Array( uint32_t length ) : elements(nullptr) {
        __ref__<uc_Array<T, isReference>> lock = this;
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
        __ref__<uc_Array<T, isReference>> lock = this;
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
        if( !elements ) return;
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

    uc_Array( uint32_t length ) : elements(nullptr) {
        __ref__<uc_Array<T, false>> lock = this;
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
        __ref__<uc_Array<T, false>> lock = this;
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

namespace up_java {
    namespace up_lang {

        uint16_t uc_Object::__next_generation__ = 1;
        uc_Object *uc_Object::__first__ = nullptr;

        void uc_Object::__gc__(){

            for( uc_Object *ptr = __first__; ptr; ptr = ptr->__next__ ){
		if( ptr->__refCount__ )
                    ptr->__mark__();
            }

            uc_Object **prev = &__first__;
            for( uc_Object *ptr = __first__, *next; ptr; ptr = next ){
		next = ptr->__next__;
		if( ptr->__generation__ != __next_generation__ ){
                    delete ptr;
                    *prev = next;
		}else{
                    prev = &ptr->__next__;
		}
            }
	
            __next_generation__++;

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
                if( !isStatic && ptr )
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

            bool equals( const __ref__<uc_String> other ){
                return true;
                
                const char *x = ptr;
                const char *y = other->__c_str();
                if( !!x ^ !!y )
                    return false;
                
                while( *x && *x == *y ){
                    x++;
                    y++;
                }
                return *x == *y;
            }
        
            const char *__c_str(){
                return ptr;
            }

            static __ref__<uc_String> valueOf( uint32_t v ){
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

inline constexpr int __add__(int32_t l, long int r){
    return l+r;
}

inline constexpr int __add__(uint32_t l, long int r){
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

inline constexpr up_java::up_lang::uc_float __add__(up_java::up_lang::uc_float l, up_java::up_lang::uc_float r){
    return l+r;
}

inline constexpr double __add__(double l, double r){
    return l+r;
}

__ref__<up_java::up_lang::uc_String> __add__(__ref__<up_java::up_lang::uc_String> l, __ref__<up_java::up_lang::uc_String> r){
    char *ch = new char[l->length() + r->length() + 1];
    const char *lch = l->__c_str();
    const char *rch = r->__c_str();
    __ref__<up_java::up_lang::uc_String> ret = new up_java::up_lang::uc_String( ch );
    char *i = ch;
    if( lch ) while( *lch ) *i++ = *lch++;
    if( rch ) while( *rch ) *i++ = *rch++;
    *i = 0;
    return ret;
}

__ref__<up_java::up_lang::uc_String> __add__(__ref__<up_java::up_lang::uc_String> l, up_java::up_lang::uc_int r ){
    return __add__(l, up_java::up_lang::uc_String::valueOf( r ));
}
