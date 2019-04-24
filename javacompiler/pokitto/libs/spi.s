.code 16
.syntax unified
.include "lpc.i"

spi_init_data:
	
	.word 0
	
	
	.global spi_init
	.func spi_init
spi_init:
	push {lr}
	ldr r0, =spi_init_data
	bl PVCOPY
	pop {pc}
	
	.endfunc
