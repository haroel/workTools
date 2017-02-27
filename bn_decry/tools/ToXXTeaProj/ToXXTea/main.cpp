//
//  main.cpp
//  ToXXTea
//
//  Created by howe on 15/7/28.
//  Copyright (c) 2015年 howe. All rights reserved.
//

#include <iostream>
#include <vector>
#include <map>

#include "Platform.h"
#include "XXTeaUtil.h"

#include <stdlib.h>
#include <algorithm>

extern "C" {

#include "easylzma/simple.h"

};

const std::string configFile = "__config.txt";

std::string encry_key = XXTEA_KEY;

using namespace std;

std::string project_path = "";

std::vector<std::string> ignore_formats = {".svn", ".git", ".DS_Store",".ttf",".TTF",".mp3",".meta",".wav" ,".manifest"};// ignore encry file format

std::map<string,bool> compress_Or_encry_formats = { {".xml",false },{".plist",false },{".csb",false },{".json",false },{".ExportJson",false },{".js",true },{".altas",true },{".anim",false },{".prefab",true }   };

void ToUpperString(string &str)
{
    transform(str.begin(), str.end(), str.begin(), (int (*)(int))toupper);
}
void ToLowerString(string &str)
{
    transform(str.begin(), str.end(), str.begin(), (int (*)(int))tolower);
}

void encryFile(const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    
    size_t outsize;
    char* newBuffer = XXTeaUtil::encryptBuffer((char*)buffer, size, encry_key.c_str(), &outsize);
    if (newBuffer)
    {
        XXTeaUtil::saveFile(filepath, newBuffer, outsize);
        printf("The file %s  has encryed!\n",filepath.c_str());
        delete [] newBuffer;
    }
    delete [] buffer;
}

void decryFile (const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    size_t outsize;
    char* newBuffer = XXTeaUtil::decryptBuffer((char*)buffer, size, encry_key.c_str(), &outsize);
    if (newBuffer)
    {
        XXTeaUtil::saveFile(filepath, newBuffer, outsize);
        printf("The file %s  has Decryted !\n",filepath.c_str());
        delete [] newBuffer;
    }
    delete [] buffer;
}

void compressFile(const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    
    size_t outsize;
    char* newBuffer = XXTeaUtil::compressBuffer((char*)buffer, size, &outsize);
    if (newBuffer)
    {
        XXTeaUtil::saveFile(filepath, newBuffer, outsize);
        printf("The file %s  has compressed!\n",filepath.c_str());
        delete [] newBuffer;
    }
    delete [] buffer;
}

void compressAndEnryFile(const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    
    if (XXTeaUtil::isXXTeaBuffer((char *)buffer, size) || XXTeaUtil::isLzmaBuffer((char *)buffer, size))
    {
        delete [] buffer;
        return;
    }
    size_t compresssize;
    char* compressBuffer = XXTeaUtil::compressBuffer((char*)buffer, size, &compresssize);
    if (compressBuffer)
    {
        size_t encryoutsize;
        auto encryBuffer = XXTeaUtil::encryptBuffer(compressBuffer, compresssize, encry_key.c_str(), &encryoutsize);
        if (encryBuffer)
        {
            XXTeaUtil::saveFile(filepath, encryBuffer, encryoutsize);
            printf("The file %s  has Compressed  And encryted!\n",filepath.c_str());
            delete [] encryBuffer;
        }
        delete [] compressBuffer;
    }
    delete [] buffer;
}

void DecryAndUncompressFile(const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    
    if (XXTeaUtil::isXXTeaBuffer((char *)buffer, size)) // first decryed then uncompress
    {
        size_t decrySize;
        char* decryBuffer = XXTeaUtil::decryptBuffer((char*)buffer, size, encry_key.c_str(), &decrySize);
        
        if (XXTeaUtil::isLzmaBuffer((char *)decryBuffer, decrySize))
        {
            size_t unCompressSize;
            char  *uncompressBuffer = XXTeaUtil::unCompressBuffer(decryBuffer, decrySize, &unCompressSize);
            XXTeaUtil::saveFile(filepath, uncompressBuffer, unCompressSize);
            printf("The file %s  has Decryted And Uncompress!\n",filepath.c_str());
            delete []uncompressBuffer;
        }
        else
        {
            XXTeaUtil::saveFile(filepath, decryBuffer, decrySize);
        }
        delete [] decryBuffer;
    }
    else if (XXTeaUtil::isLzmaBuffer((char *)buffer, size))
    {
        size_t unCompressSize;
        char  *uncompressBuffer = XXTeaUtil::unCompressBuffer((char *)buffer, size, &unCompressSize);
        
        if (XXTeaUtil::isXXTeaBuffer((char *)buffer, size))
        {
            size_t decrySize;
            char* decryBuffer = XXTeaUtil::decryptBuffer((char*)uncompressBuffer, unCompressSize, encry_key.c_str(), &decrySize);
            XXTeaUtil::saveFile(filepath, decryBuffer, decrySize);
            delete [] decryBuffer;
        }
        else
        {
            XXTeaUtil::saveFile(filepath, uncompressBuffer, unCompressSize);
        }
        delete [] uncompressBuffer;
    }
    delete [] buffer;
}

void unCompressFile(const std::string &filepath)
{
    size_t size;
    auto buffer = XXTeaUtil::getFileData(filepath, "rb", &size);
    
    size_t outsize;
    char* newBuffer = XXTeaUtil::unCompressBuffer((char*)buffer, size, &outsize);
    if (newBuffer)
    {
        XXTeaUtil::saveFile(filepath, newBuffer, outsize);
        printf("The file %s  has Uncompress!\n",filepath.c_str());
        delete [] newBuffer;
    }
    delete [] buffer;
}

std::string getFileFormat (const std::string &filepath)
{
    size_t pos = filepath.find_last_of(".");
    if (pos >= filepath.length())
    {
        return "";
    }
    std::string format = filepath.substr(pos,filepath.length() - 1);
    return format;
}

bool isCompare (const std::string &filepath, const std::string &format )
{
    return getFileFormat(filepath) == format;
}
// 0 encry ;
// 1 compress;
// 2 encry and compress
int doFileType (const std::string &filepath)
{
    auto format = getFileFormat(filepath);
    
    auto ite = compress_Or_encry_formats.find(format);
    if (ite != compress_Or_encry_formats.end())
    {
        if (ite->second == true)
        {
            return 2;
        }
        return 1;
    }
    return 0;
}


int main(int argc, const char * argv[]) {
    // insert code here...
//    std::cout << "Begin encry file! \n";
//    printf("********************** The key is %s \n",encry_key.c_str());
    
    std::string extFilePath = argv[0];
    std::string exeName = "";
    
    int exe_split;
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
    exe_split = (int)extFilePath.find_last_of("\\");
    project_path = extFilePath.substr(0, exe_split);//
#else
    exe_split = (int)extFilePath.rfind("/");
    project_path = extFilePath.substr(0, exe_split);//
#endif
    
    exeName = extFilePath.substr(exe_split+1, extFilePath.length() - 1);//
    bool isEncry = true; //
    ToLowerString(exeName);
    
    auto pp = exeName.find("to");
    if ( pp == std::string::npos)
    {
        isEncry = false;
        std::cout << "Begin decry 解密 file! \n";
    }else
    {
        std::cout << "Begin encry 加密 file! \n";
    }
//    project_path = "/Users/howe/Documents/three_client/trunk/MegoGame";
    
//    std::string resPath = argv[0];
    std::string resPath =project_path + "/workspace";
    auto config_path = project_path + "/" + configFile;
    if (XXTeaUtil::isFileExist(config_path))
    {
        size_t size;
        auto data = XXTeaUtil::getFileData(config_path, "rt", &size);
        if (data)
        {
            std::string configData("");
            configData = reinterpret_cast<char*>(data);
            vector<string> vectStr;
            XXTeaUtil::strSplit(configData, "=", vectStr);
            if (vectStr.size() > 1)
            {
                resPath = vectStr[0];
                encry_key = vectStr[1];
            }
        }
    }
    const auto &fileArray = Platform::loopFiles(resPath);
	printf("*** res_path :%s  ***key:%s File num:%lu \n", resPath.c_str(), encry_key.c_str(), fileArray.size());

    if (isEncry)
    {
        printf("**********************Begin***************** !\n ");
        for (auto filepath : fileArray)
        {
            if ( !XXTeaUtil::isFileExist(filepath) )
            {
                printf("File is not existed!  %s \n ",filepath.c_str());
                continue;
            }
            bool isIgnore = false;
            for (auto pattern : ignore_formats)
            {
                size_t p = filepath.find(pattern);
                if (p != std::string::npos)
                {
                    isIgnore = true;
                    break;
                }
            }
            if (isIgnore)
            {
                continue;
            }
            int actType = doFileType(filepath);
            switch (actType)
            {
                case 0:
                {
                    encryFile(filepath);
                    break;
                }
                case 1:
                {
                    compressFile(filepath);
                    break;
                }
                case 2:
                {
                    compressAndEnryFile(filepath);
                    break;
                }
                default:
                    break;
            }
        }
        printf("Over done!*********************\n ");
    }
    else
    {
        for (auto filepath : fileArray)
        {
            if ( !XXTeaUtil::isFileExist(filepath) )
            {
                printf("File is not existed!  %s \n ",filepath.c_str());
                continue;
            }
            bool isIgnore = false;
            for (auto pattern : ignore_formats)
            {
                size_t p = filepath.find(pattern);
                if (p != std::string::npos)
                {
                    isIgnore = true;
                    break;
                }
            }
            if (isIgnore)
            {
                continue;
            }
            int actType = doFileType(filepath);
            switch (actType)
            {
                case 0:
                {
                    decryFile(filepath);
                    break;
                }
                case 1:
                {
                    unCompressFile(filepath);
                    break;
                }
                case 2:
                {
                    DecryAndUncompressFile(filepath);
                    break;
                }
                default:
                    break;
            }
        }
        printf("Over done!*********************\n ");
    }
    return 0;
}
