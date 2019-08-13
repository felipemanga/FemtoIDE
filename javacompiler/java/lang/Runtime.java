package java.lang;

public class Runtime {
    private Runtime(){}

    private static final Runtime _instance = new Runtime();

    /// Returns the runtime object associated with the current Java application.
    public static Runtime getRuntime(){ return _instance; }

    /// Returns the number of processors available to the Java virtual machine.
    public int availableProcessors(){ return 1; }

    /// Returns the total amount of memory in the Java virtual machine.
    public int totalMemory(){
        int total;
        __inline_cpp__("total = int(&__top_Ram0_32)");
        return total - 0x10000000;
    }

    /// Returns the amount of free memory in bytes.
    public int freeMemory(){
        int memory;
        __inline_cpp__("memory = __allocated_memory__");
        return totalMemory() - memory;
    }
}
