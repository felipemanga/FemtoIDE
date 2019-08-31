/**************************************************************************/
/*!
    @file     PokittoCookie.cpp
    @author   Jonne Valola

    @section LICENSE

    Software License Agreement (BSD License)

    Copyright (c) 2018, Jonne Valola
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
    3. Neither the name of the copyright holders nor the
    names of its contributors may be used to endorse or promote products
    derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**************************************************************************/

package femto;
import hardware.EEPROM;

public class Cookie {

    static final int SBNOMOREKEYS = 1;
    static final int SBNOTENOUGHBLOCKSFREE = 2;
    static final int SBMAXKEYS = 48; //number of available keys
    static final int SBMAXBLOCKS = 112; //0xF8C (settings reserved area) - 0x180 (start of block table) / 32 bytes (block size)
    static final int SBBLOCKSIZE = 32; //block size in bytes
    static final int SBKEYSIZE = 8;
    static final int SBINVALIDSLOT = 255;
    static final int SBINVALIDBLOCK = -1;

    /** keystring
     * identification string for the Cookie
     */
    char[] _key = new char[SBKEYSIZE];

    /** Status
     * false = uninitialized
     * true = ready
     */
    boolean _status;

    /** Pointer
     * pointer to cookie data
     */
    pointer _pointer;

    /** Head
     * data "head" for byte write/read operations
     */
    int _head;

    /** Datasize
     * size (in bytes) of cookie data to be saved and reloaded
     */
    ushort _datasize;

    /** Keyorder
     * order number of key in key table
     */
    ubyte _keyorder;

    /** Current block
     * block number that we are reading/writing
     */
    char _block;

    public Cookie() {
        _status = false;
        _keyorder = SBINVALIDSLOT;
    }

    private int initialize() {
        //initialize is called from begin() and can be called several times during program run
        int datasize = (int) _datasize;
        // check if key already exists
        _keyorder = exists(_key);
        if (_keyorder < SBMAXKEYS) {
            // key already exists
            // check amount of existing storage reserved for cookie
            datasize -= getAssignedBlocks() * SBBLOCKSIZE;
            if (datasize <= 0) {
                // the size of data matches the size requested
                // therefore retrieve data from storage
                _status = true; //were good to go
                loadCookie();
            } else {
                // if that does not cover the whole size (maybe a newer version of program, who knows)
                // then do not load but reserve more blocks and store a new version
                while (datasize > 0) {
                    if (reserveBlock()) datasize -= SBBLOCKSIZE;
                    else return SBNOTENOUGHBLOCKSFREE; //no space to allocate
                }
                _status = true; //were good to go
                eraseKeytableEntry(_keyorder);
                writeKeyToKeytable(_key, _keyorder); // write the key in the key table in EEPROM
                saveCookie();
            }
        } else {
            // new key needed
            // check if we have free keyslots
            _keyorder = getFreeKeytableSlot();
            if (_keyorder >= SBMAXKEYS) return SBNOMOREKEYS; //no space for key
            // check if we have free storage blocks
            if (getFreeBlocks() * SBBLOCKSIZE < datasize) return SBNOTENOUGHBLOCKSFREE; //no space to allocate
            while (datasize > 0) {
                //reserve enough blocks for the data until all data can fit
                if (reserveBlock()) datasize -= SBBLOCKSIZE;
                else return SBNOTENOUGHBLOCKSFREE; //no space to allocate
            }
        }

        _status = true; // we're good to go
        eraseKeytableEntry(_keyorder);
        writeKeyToKeytable(_key, _keyorder); // write the key in the key table in EEPROM
        return 0;
    }

    public int begin(String idkey) {
        pointer data;
        int datasize;
        __inline_cpp__("
            data = ( &_block) + 1; 
            datasize = __sizeof__() - (((uintptr_t)data) - ((uintptr_t)this));
            ");
        _status = false; 
        _datasize = (ushort) datasize; // sizeof(this); //do not include the data of the parent Cookie instance
        _pointer = data; // warning! hardcoded! sizeof(this); //point to the beginning of the inherited instance

        cleanKeytable();

        boolean ended = false;
        for (int t = 0; t < 8; t++) {
            char c;
            if (ended || idkey[t] == 0) {
                ended = true;
                c = ' ';
            } else {
                c = idkey[t];
            }
            _key[t] = c;
        }

        initialize();
        return 0; //success
    }

    boolean saveCookie() {
        if (!_status || _pointer == null)
            return false; //return if not initialized
        pointer p = _pointer;
        _head = 0;
        _block = 0;
        _block = findMyNextBlock();
        for (int i = 0; i < (int) _datasize; i++)
            writeQueue(System.memory.LDRB(p++));
        return true;
    }

    boolean loadCookie() {
        if (!_status || _pointer == null)
            return false;

        pointer p = _pointer;
        _head = 0;
        _block = 0;
        _block = findMyNextBlock();

        for (int i = 0; i < (int) _datasize; i++)
            System.memory.STRB(p++, readQueue());

        return true;
    }

    void deleteCookie() {
        if (!_status) return;
        // free all blocks held by Cookie
        for (int i = 0; i < SBMAXBLOCKS; i++) {
            if (isMyBlock(i))
                freeBlock(i);
        }
        // erase Cookie entry from keytable
        eraseKeytableEntry(_keyorder);
        // set status to deleted
        _status = false;
    }

    int exists(char[] idkey) {
        for (int i = 0; i < SBMAXKEYS; i++) {

            if ( EEPROM.read(i * SBKEYSIZE) == idkey[0]) {
                int total = 0;
                for (int j = 0; j < SBKEYSIZE; j++) {
                    if (EEPROM.read(i * SBKEYSIZE + j) == idkey[j]) total++;
                }
                if (total == SBKEYSIZE) return i; // return the keyslot number where key exists
            }

        }
        return SBINVALIDSLOT; //not found
    }

    int getFreeKeytableSlot() {
        int freeslot = SBINVALIDSLOT;
        for (int i = 0; i < SBMAXKEYS; i++) {

            if (EEPROM.read(i * SBKEYSIZE) == 0) {
                freeslot = i;
                break;
            }

        }
        return freeslot;
    }

    int getAssignedBlocks() {
        int assignedblocks = 0;
        for (int i = 0; i < SBMAXBLOCKS; i++) {
            if (isMyBlock(i)) assignedblocks++;
        }
        return assignedblocks;
    }

    int getFreeBlocks() {
        int freeblocks = 0;
        for (int i = 0; i < SBMAXBLOCKS; i++) {
            if (isFreeBlock(i)) freeblocks++;
        }
        return freeblocks;
    }

    boolean isFreeBlock(int n) {
        if (n >= SBMAXBLOCKS) return false;

        if ((EEPROM.read(SBMAXKEYS * SBKEYSIZE + n) & 0x80) == 0) 
            return true; //highest bit 0, its free

        return false; //its not free
    }

    boolean isMyBlock(int n) {
        if (n >= SBMAXBLOCKS) return false;
        if (isFreeBlock(n)) return false; //"free" blocks can not be "reserved" at the same time!

        char temp;
        int address;
        address = (SBMAXKEYS * SBKEYSIZE + n);
        temp = EEPROM.read(address);
        if ((temp & 0x7F) == _keyorder) return true;

        return false; //its not your block
    }

    boolean blockIsOwnedBy(int n, int k) {
        if (n >= SBMAXBLOCKS) return false;
        if (k >= SBMAXKEYS) return false;
        if (isFreeBlock(n)) return false; //"free" blocks can not be "owned" by anyone

        char temp;
        int address;
        address = (SBMAXKEYS * SBKEYSIZE + n);
        temp = EEPROM.read(address);
        if ((temp & 0x7F) == k) return true;

        return false; //its not your block
    }

    void writeKeyToKeytable(char[] key, int slot) {
        for (int i = 0; i < SBKEYSIZE; i++) {

            EEPROM.write((slot * SBKEYSIZE + i), key[i]);

        }
    }

    void readKeytableEntry(int n, char[] answer) {
        answer[8] = 0;
        if (n >= SBMAXKEYS) n = SBMAXKEYS - 1;
        for (int i = 0; i < SBKEYSIZE; i++) {

            answer[i] = EEPROM.read((n * SBKEYSIZE + i));

        }
    }

    char getBlockTableEntry(int n) {
        if (n >= SBMAXBLOCKS) 
            return 0x80; // out of bounds will return a reserved block marker
        return EEPROM.read((SBKEYSIZE * SBMAXKEYS + n));
    }

    void readBlock(int n, char[] data) {
        for (int i = 0; i < SBBLOCKSIZE; i++) {
            data[i] = 0;

            if (n < SBMAXBLOCKS)
                data[i] = EEPROM.read((SBKEYSIZE * SBMAXKEYS + SBMAXBLOCKS + n * SBBLOCKSIZE + i));

        }
    }

    void formatKeytable() {
        for (int j = 0; j < SBMAXKEYS; j++) {
            for (int i = 0; i < SBKEYSIZE; i++) {

                EEPROM.write((j * SBKEYSIZE + i), 0);

            }
        }
    }

    void freeBlock(int n) {
        if (n >= SBMAXBLOCKS) return; //out of bounds

        // delete entry from blocktable
        EEPROM.write((SBKEYSIZE * SBMAXKEYS + n), 0);

        for (int i = 0; i < SBBLOCKSIZE; i++) {

            // wipe data in the block
            EEPROM.write((SBKEYSIZE * SBMAXKEYS + SBMAXBLOCKS + n * SBBLOCKSIZE + i), 0);

        }
    }

    boolean reserveBlock() {
        for (int i = 0; i < SBMAXBLOCKS; i++) {

            // reserve block from blocktable
            if (isFreeBlock(i)) {
                //free block found, mark it for us in the blocktable
                EEPROM.write((SBKEYSIZE * SBMAXKEYS + i), _keyorder | 0x80);
                return true;
            }

        }
        return false; // no free block found
    }

    void eraseKeytableEntry(int n) {
        if (n >= SBMAXKEYS) n = SBMAXKEYS - 1;
        for (int i = 0; i < SBKEYSIZE; i++) {

            EEPROM.write((n * SBKEYSIZE + i), 0);

        }
    }

    void cleanKeytable() {
        //Remove any keys without blocks
        for (int entry = 0; entry < SBMAXKEYS; entry++) {
            if (EEPROM.read(entry * SBKEYSIZE) != 0) {
                boolean isEmpty = true;
                for (int block = 0; block < SBMAXBLOCKS; block++)
                    if (blockIsOwnedBy(block, entry)) {
                        isEmpty = false;
                        break;
                    }
                //this entry has no blocks reserved, so lets clean it from the keytable
                if (isEmpty) eraseKeytableEntry(entry);
            }
        }
        for (int block = 0; block < SBMAXBLOCKS; block++) {
            int blockentry = EEPROM.read((SBMAXKEYS * SBKEYSIZE + block));
            if ((blockentry & 0x80) != 0) {
                blockentry &= 0x7F;
                boolean isEmpty = true;
                for (int key = 0; key < SBMAXKEYS; key++) {
                    if (EEPROM.read(key * SBKEYSIZE) != 0) {
                        isEmpty = false;
                        break;
                    }
                }
                if (isEmpty) EEPROM.write((SBMAXKEYS * SBKEYSIZE + block), 0);
            }
        }
    }

    char readQueue() {
        char data = 0;

        int address;
        address = SBMAXKEYS * SBKEYSIZE + SBMAXBLOCKS + SBBLOCKSIZE * _block + _head % SBBLOCKSIZE;
        data = EEPROM.read(address);

        _head++;
        if (_head % SBBLOCKSIZE == 0 && _head != 0) {
            _block++;
            _block = findMyNextBlock();
        }
        return data;
    }

    void writeQueue(char data) {

        EEPROM.write((SBMAXKEYS * SBKEYSIZE + SBMAXBLOCKS + SBBLOCKSIZE * _block + _head % SBBLOCKSIZE), data);

        _head++;
        if (_head % SBBLOCKSIZE == 0 && _head != 0) {
            _block++;
            _block = findMyNextBlock();
        }
    }

    int findMyNextBlock() {
        if (!_status) return SBINVALIDBLOCK;
        for (int i = _block; i < SBMAXBLOCKS; i++)
            if (isMyBlock(i)) return i;
        return SBINVALIDBLOCK;
    }

}
