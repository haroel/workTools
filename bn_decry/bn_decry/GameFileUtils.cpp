//
//  GameFileUtils.cpp
//  MegoGame
//
//  Created by howe on 15/7/13.
//

//  JUST for Android
//

#include "GameFileUtils.h"
#include "decry/XXTeaUtil.h"

#include "base/ZipUtils.h" // obb use ZipUtil parseZipData


using namespace std;
using namespace cocos2d;

FileUtils *s_DefaultFileUtils = nullptr;
GameFileUtils * s_GameFileUtils = nullptr;


std::string __XXTEA_KEY(DEFAULT_XXTEA_KEY);
void initGameFileUtils(const std::string &key)
{
    if (key.size() > 0)
    {
        __XXTEA_KEY = key;
    }
    GameFileUtils::getClassInstance();
}

#pragma mark - GameFileUtils

GameFileUtils * GameFileUtils::getClassInstance()
{
    if (s_GameFileUtils == nullptr)
    {
        s_GameFileUtils = new GameFileUtils();
        s_GameFileUtils->init();
    }
    return s_GameFileUtils;
}
GameFileUtils::GameFileUtils()
{
    
}

GameFileUtils::~GameFileUtils()
{
    s_GameFileUtils = nullptr;
}

FileUtils * GameFileUtils::getCocosFileUtils()
{
    return s_DefaultFileUtils;
}

bool GameFileUtils::init()
{
    GAME_FILEUTILS_SUPER_CLASS::init();
    s_DefaultFileUtils = FileUtils::getInstance(); // Save the cocos fileUtils
    
    FileUtils::s_sharedFileUtils = nullptr;
    FileUtils::setDelegate(this);
    CCLOG("GameFileUtils init");
    return true;
}
//
//ValueMap GameFileUtils::getValueMapFromData(const char* filedata, int filesize)
//{
// 
//    
//    return GAME_FILEUTILS_SUPER_CLASS::getValueMapFromData( filedata , filesize);
//}

std::string GameFileUtils::getStringFromFile(const std::string& filename)
{
    Data _data = this->getDataFromFile(filename);
    if (!_data.isNull())
    {
        auto size = _data.getSize();
        auto buffer = _data.getBytes();
        
        char* strBuffer = ( char*) malloc( size );
        memset(strBuffer, 0, size);
        
        for (size_t i = 0; i < size; i++)
        {
            strBuffer[i] = buffer[i];
        }
        strBuffer[size] = '\0';
        
        _data.clear();
        std::string ret(strBuffer);
        free(strBuffer);
        return ret;
    }
    return "";
}
Data GameFileUtils::getDataFromFile(const std::string& filename)
{
    Data _data = s_DefaultFileUtils->getDataFromFile(filename);
    if (_data.isNull())
    {
        return _data;
    }
    XXTeaUtil::decryptBuffer(_data, __XXTEA_KEY); // decry buffer
    XXTeaUtil::unCompressLzmaBuffer(_data);     // uncompress file;
    return _data;
}

unsigned char* GameFileUtils::getFileData(const std::string& filename, const char* mode, ssize_t * size)
{
    Data _data(this->getDataFromFile(filename));
    if (size)
    {
        *size = _data.getSize();
    }
    auto buffer = _data.getBytes();
    unsigned char* pbuffer = (unsigned char*)malloc(_data.getSize());
    for (size_t i = 0; i < _data.getSize(); i++)
    {
        pbuffer[i] = buffer[i];
    }
    return pbuffer;
}













