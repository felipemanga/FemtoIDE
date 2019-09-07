package femto.hardware;

public class EEPROM {

    static char read(int address){
        char value;
        //2) EEprom Read
        //Command code: 62
        //Param0: eeprom address (byte, half-word or word aligned)
        //Param1: RAM address (byte, half-word or word aligned)
        //Param2: Number of bytes to be read ( Byte, Half-words read are ok)
        //Param3: System Clock Frequency (CCLK) in kHz
        //
        //Return Code CMD_SUCCESS | SRC_ADDR_NOT_MAPPED | DST_ADDR_NOT_MAPPED
    __inline_cpp__("
        typedef int (*IAP)(unsigned int[], unsigned int[]);
        IAP iap_entry = (IAP) 0x1fff1ff1;
    
    	unsigned int command[5], result[4];
    	command[0] = 62;
    	command[1] = (uint32_t) address;
    	command[2] = (uint32_t) &value;
    	command[3] = 1;
#ifdef _OSCT
    	command[4] = 0x11940;
#else
    	command[4] = 0xBB80;
#endif
    	/* Invoke IAP call...*/
	    // __disable_irq();
        __asm volatile (\"cpsid i\" : : : \"memory\");
  	    iap_entry( command, result);
  	    // __enable_irq();
        __asm volatile (\"cpsie i\" : : : \"memory\");
    	if (result[0] != 0){
    		//Trap error
    		while(1);
	    }
    ");
        
        return value;
    }
    
    static void write(int address, char value){
    __inline_cpp__("
        typedef int (*IAP)(unsigned int[], unsigned int[]);
        IAP iap_entry = (IAP) 0x1fff1ff1;
    	unsigned int command[5], result[4];
        result[0] = 0;
    	command[0] = 61;
    	command[1] = (uint32_t) address;
    	command[2] = (uint32_t) &value;
    	command[3] = 1;
#ifdef _OSCT
    	command[4] = 0x11940;
#else
    	command[4] = 0xBB80;
#endif
    
    	/* Invoke IAP call...*/
        // __disable_irq();
        __asm volatile (\"cpsid i\" : : : \"memory\");

    	iap_entry(command, result);

    	// __enable_irq();
        __asm volatile (\"cpsie i\" : : : \"memory\");

    	while (result[0] != 0); // error, halt
    ");
    }
}
