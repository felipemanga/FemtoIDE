package java.lang;

public class Runtime {
    private Runtime(){}

    private static final Runtime _instance = new Runtime();

    public static Runtime getRuntime(){ return _instance; }
    public int availableProcessors(){ return 1; }
    public int totalMemory(){ return 0x8000; }
    public int freeMemory(){ return 0x8000 - __inline_cpp__("__allocated_memory__"); }
}
