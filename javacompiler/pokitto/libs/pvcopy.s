.code 16
.syntax unified

.global PVCOPY
.func PVCOPY
PVCOPY:
	push {r4, lr}
	ldr r4, =jmptbl
	movs r2, r0
next:	
	movs r3, #3
	ldm r2!, {r0, r1}
	cmp r0, #0
	beq exit
	ands r3, r0
	lsls r3, #2
	ldr r3, [r4, r3]
	bx r3
	
exit:
	pop {r4, pc}
	
PVCOPYSET:
	str r1, [r0]
	b next
	
PVCOPYFUN:
	movs r3, r0
	movs r0, r1
	lsrs r1, r3, #24
	lsls r3, #8
	lsrs r3, #8
	adds r1, #1
1:	
	push {r1, r2, r3, r4}
	blx r3
	pop {r1, r2, r3, r4}
	subs r1, #1
	beq next
	ldm r2!, {r0}
	b 1b

PVCOPYOR:
	lsrs r0, #2
	lsls r0, #2
	ldr r3, [r0]
	orrs r3, r1
	str r3, [r0]
	b next
	
PVCOPYAND:
	lsrs r0, #2
	lsls r0, #2
	ldr r3, [r0]
	ands r3, r1
	str r3, [r0]
	b next

	.pool
jmptbl:	
	.word PVCOPYSET+1
	.word PVCOPYFUN+1
	.word PVCOPYOR+1
	.word PVCOPYAND+1
.endfunc
	
