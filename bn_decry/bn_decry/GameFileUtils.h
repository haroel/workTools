//
//  GameFileUtils.h
//  MegoGame
//
//  Created by howe on 15/7/13.
//
//
//  Custom FileUtils . used for Decryption 、 Google play obb
//
//

#ifndef __MegoGame__GameFileUtils__
#define __MegoGame__GameFileUtils__

#include <stdio.h>
#include "cocos2d.h"
#include "platform/CCFileUtils.h"

using namespace cocos2d;

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include "platform/android/CCFileUtils-android.h"
#define  GAME_FILEUTILS_SUPER_CLASS FileUtilsAndroid

#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
#include "decry/_FileUtils-apple.h"
#define  GAME_FILEUTILS_SUPER_CLASS FileUtilsApple2

#elif (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include "platform/win32/CCFileUtils-win32.h"
#define  GAME_FILEUTILS_SUPER_CLASS FileUtilsWin32
#endif

void initGameFileUtils(const std::string &key);

class CC_DLL GameFileUtils : public GAME_FILEUTILS_SUPER_CLASS
{
    friend class FileUtils;
public:
    GameFileUtils();
    
    static GameFileUtils * getClassInstance();
    virtual ~GameFileUtils();
    
    FileUtils * getCocosFileUtils();
    
    virtual bool init() override;
    
    
//    virtual ValueMap getValueMapFromData(const char* filedata, int filesize) override;
    
    virtual unsigned char* getFileData(const std::string& filename, const char* mode, ssize_t * size) override;
    /**
     *  Creates binary data from a file.
     *  @return A data object.
     */
    virtual Data getDataFromFile(const std::string& filename) override;
    /**
     *  Gets string from a file.
     */
    virtual std::string getStringFromFile(const std::string& filename) override;
    
    
private:
    std::unordered_map<std::string,Data> m_csbDataMap; // csb file caches
    
};

#endif /* defined(__MegoGame__GameFileUtils__) */
