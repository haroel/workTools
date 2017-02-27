//
//  XXTeaUtil.cpp
//  ModelStudio
//
//  Created by howe on 15/7/28.
//
//

#include "XXTeaUtil.h"
#include "xxtea.h"

extern "C" {
#include "easylzma/simple.h"
};

bool XXTeaUtil::decryptBuffer(cocos2d::Data &data,const std::string &key)
{
    if (isXXTeaBuffer(data.getBytes(),data.getSize()))
    {
        auto fileBuffer = data.getBytes();
        auto fileLen = data.getSize() - XXTEAHeader_LEN;
        
        size_t out_len;
        auto deBuff = xxtea_decrypt(&fileBuffer[XXTEAHeader_LEN], fileLen, key.c_str(), &out_len);
        data.clear();
        data.fastSet( (unsigned char*)deBuff, out_len);
        return true;
    }
    return false;
}

bool XXTeaUtil::unCompressLzmaBuffer (cocos2d::Data &data)
{
    if (isLzmaBuffer(data.getBytes(),data.getSize()))
    {
        auto pbuffer = data.getBytes();
//        size_t len = data.getSize();
        size_t fileLen = data.getSize() - LZMAHeader_LEN;
        
//        unsigned char *newStr = new unsigned char[fileLen];
//        for (size_t i = LZMAHeader_LEN;i < len;i++)
//        {
//            newStr[i - LZMAHeader_LEN] = pbuffer[i];
//        }
        unsigned char *outData = nullptr;
        size_t outLen;
        int ret= simpleDecompress(ELZMA_lzma, &pbuffer[LZMAHeader_LEN], fileLen, &outData, &outLen);
//        delete [] newStr;
        if (ret == ELZMA_E_OK)
        {
            data.clear();
            data.fastSet(outData, outLen);
            return true;
        }
    }
    return false;
}