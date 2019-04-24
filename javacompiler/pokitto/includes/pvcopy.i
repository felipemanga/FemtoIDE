
.macro SET REG:req, VAL:req
.word \REG
.word \VAL
.endm

.macro CALL REG:req, VAL:req
.word (\REG)+1
.word \VAL
.endm

.macro OR REG:req, VAL:req
.word \REG+2
.word \VAL
.endm

.macro AND REG:req, VAL:req
.word \REG+3
.word \VAL
.endm

.macro END
.word 0
.endm
