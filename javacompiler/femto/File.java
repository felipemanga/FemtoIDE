package femto;

public class File {
    pointer raw = null;
    
    @CPP(include="File")
    public void init() {
        if (raw != null) 
            return;
        __inline_cpp__("raw = new File();");
    }

    public void close() {
        __inline_cpp__("delete ((File*)raw);");
        raw = null;
    }
    
    public boolean isOpen() {
        boolean open;
        __inline_cpp__("open = raw && *((File*)raw)");
        return open;
    }
    
    public boolean openRO(String name) {
        boolean success;
        init();
        __inline_cpp__("success = ((File*)raw)->openRO(name->getPointer());");
        if (!success)
            close();
        return true;
    }

    public boolean openRW(String name) {
        return openRW(name, true, false);
    }

    public boolean openRW(String name, boolean create) {
        return openRW(name, create, false);
    }

    public boolean openRW(String name, boolean create, boolean append) {
        boolean success;
        init();
        __inline_cpp__("success = ((File*)raw)->openRW(name->getPointer(), create, append);");
        if (!success)
            close();
        return true;
    }
    
    public int tell() {
        if (!isOpen())
            return 0;
        int pos = 0;
        __inline_cpp__("pos = ((File*)raw)->tell();");
        return pos;
    }
    
    public void seek(int pos) {
        if (isOpen()) {
            __inline_cpp__("((File*)raw)->seek(pos);");
        }
    }
    
    public int size() {
        if (!isOpen())
            return 0;
        int size = 0;
        __inline_cpp__("size = ((File*)raw)->size();");
        return size;
    }
    
    public int toPointer(pointer ptr, int bufferSize) {
        int max = 0;
        if (isOpen()) {
            __inline_cpp__("max = ((File*)raw)->read((void*)ptr, bufferSize);");
        }
        return max;
    }
    
    public byte[] toArray() {
        return toArray(size());
    }
    
    public int toArray(byte[] buffer) {
        pointer ptr;
        __inline_cpp__("ptr = buffer->elements;");
        return toPointer(ptr, buffer.length);
    }

    public byte[] toArray(int maxLength) {
        var buffer = new byte[maxLength];
        toArray(buffer);
        return buffer;
    }
    
    public String toString(int maxLength) {
        String result;
        if (isOpen()) {
            __inline_cpp__("
            auto buffer = new char[maxLength + 1];
            result = new up_java::up_lang::uc_String(buffer);
            buffer[((File*)raw)->read(buffer, maxLength)] = 0;
            ");
        }
        return result;
    }
    
    public String toString() {
        return toString(size());
    }
    
    public void write(String str) {
        if (isOpen()) {
            __inline_cpp__("((File*)raw)->write(str->getPointer(), str->length());");
        }
    }
    
    public void write(byte[] arr) {
        if (isOpen()) {
            __inline_cpp__("((File*)raw)->write(arr->elements, arr->length);");
        }
    }
}
