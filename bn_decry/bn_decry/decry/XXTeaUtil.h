//
//  XXTeaUtil.h
//  ModelStudio
//
//  Created by howe on 15/7/28.
//
//

#ifndef __ModelStudio__XXTeaUtil__
#define __ModelStudio__XXTeaUtil__

#include <stdio.h>
#include <string>
#include "cocos2d.h"

#define DEFAULT_XXTEA_KEY       "game"

struct XXTEAHeader
{
    unsigned char   sig[5];             /** Signature. Should be 'xxtea' 5 bytes. */
};
struct LZMAHeader
{
    unsigned char   sig[4];             /** Signature. Should be 'lzma' 4 bytes. */
};

static int XXTEAHeader_LEN =sizeof(XXTEAHeader);

static int LZMAHeader_LEN =sizeof(LZMAHeader);

class XXTeaUtil
{
public:
    
    static bool decryptBuffer(cocos2d::Data &data,const std::string &key);
    
    static bool unCompressLzmaBuffer (cocos2d::Data &data);
    
    static bool isXXTeaBuffer(const unsigned char *buffer, ssize_t len)
    {
        if (static_cast<size_t>(len) < sizeof(struct XXTEAHeader))
        {
            return false;
        }
        struct XXTEAHeader *header = (struct XXTEAHeader*) buffer;
        return header->sig[0] == 'x' && header->sig[1] == 'x' && header->sig[2] == 't' && (header->sig[3] == 'e' && header->sig[4] == 'a');
    }
    
    static bool isLzmaBuffer(const unsigned char *buffer, size_t len)
    {
        if (static_cast<size_t>(len) < sizeof(struct LZMAHeader))
        {
            return false;
        }
        struct LZMAHeader *header = (struct LZMAHeader*) buffer;
        return header->sig[0] == 'l' && header->sig[1] == 'z' && header->sig[2] == 'm' && (header->sig[3] == 'a');
    }
};



#endif /* defined(__ModelStudio__XXTeaUtil__) */
