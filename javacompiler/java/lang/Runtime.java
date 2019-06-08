package java.lang;

public class Runtime {
    private Runtime(){}

    private static final Runtime _instance = new Runtime();

    public static Runtime getRuntime(){ return _instance; }
    public int availableProcessors(){ return 1; }
    public int totalMemory(){
        int total;
        __inline_cpp__("total = int(&__top_Ram0_32)");
        return total - 0x10000000;
    }
    public int freeMemory(){ return totalMemory() - __inline_cpp__("__allocated_memory__"); }
}
