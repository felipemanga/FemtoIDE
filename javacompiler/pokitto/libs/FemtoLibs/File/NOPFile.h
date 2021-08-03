#pragma once

class File {
public:
    inline static const int error = 1;

    File(){}

    File(const File&) = delete;

    File(File&& other){}

    ~File(){}

    void close(){}

    operator bool(){
        return false;
    }

    File& openRO(const char *name) {
        return *this;
    }

    File& openRW(const char *name, bool create, bool append) {
        return *this;
    }

    uint32_t size(){
        return 0;
    }

    uint32_t tell(){
        return 0;
    }

    File& seek(uint32_t offset){
        return *this;
    }

    uint32_t read( void *ptr, uint32_t count ){
        return 0;
    }

    uint32_t write( const void *ptr, uint32_t count ){
        return 0;
    }

    template< typename T, size_t S > uint32_t read( T (&data)[S] ){
        return 0;
    }

    template< typename T, size_t S > uint32_t write( const T (&data)[S] ){
        return 0;
    }

    template< typename T >
    T read(){
        return {};
    }

    template< typename T >
    File & operator >> (T &i){
    	return *this;
    }

    template< typename T >
    File & operator << (const T& i){
    	return *this;
    }

    File & operator << (const char *str ){
    	return *this;
    }
};
