.code 16
.global init_LCD
.syntax unified

.include "lcd.i"	

.func init_LCD
init_LCD:
	push {lr}
	
	ldr r0, =SCREENBUFFER
	ldr r1, =LCDWIDTH*LCDHEIGHT/4/4
	ldr r2, =0xAAAAAAAA
	bl wordset
	ldr r1, =LCDWIDTH*LCDHEIGHT/4/4
	ldr r2, =0x55555555
	bl wordset
	ldr r1, =LCDWIDTH*LCDHEIGHT/4/4
	ldr r2, =0xFFFF0000
	bl wordset
	ldr r1, =LCDWIDTH*LCDHEIGHT/4/4
	movs r2, 1
	bl wordset
	
	pop {pc}
	.pool
.endfunc
