//
//  Platform.cpp
//  ModelStudio
//
//  Created by howe on 15/6/25.
//
//

#include "Platform.h"
#include <iostream>

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include <io.h>
#include <ShlObj.h>
#include<direct.h>
#define F_OK   0
#else
#include <unistd.h>
#include <stdio.h>
#include <dirent.h>
#include <sys/stat.h>
#endif

using namespace std;


int create_multi_dir(const char *path)
{
    int i, len;
    
    len = strlen(path);
	const int len1 = len + 1;
    char *dir_path = new char[len1];
    dir_path[len] = '\0';
    
    strncpy(dir_path, path, len);
    
    for (i=0; i<len; i++)
    {
        if (dir_path[i] == '/' && i > 0)
        {
            dir_path[i]='\0';
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
			if ( _access(dir_path, F_OK) < 0)
			{
				if (_mkdir(dir_path) < 0)
				{
					printf("mkdir=%s:msg=%s\n", dir_path, strerror(errno));
					return -1;
				}
			}
#else
			if (access(dir_path, F_OK) < 0)
			{
				if (mkdir(dir_path, 0755) < 0)
				{
					printf("mkdir=%s:msg=%s\n", dir_path, strerror(errno));
					return -1;
				}
			}
#endif
            dir_path[i]='/';
        }
    }
	delete dir_path;
    return 0;
}

std::vector<std::string> fileArray;
void _loopFiles(const std::string &folderPath,int type)
{
#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
    _finddata_t FileInfo;
    std::string strfind = folderPath + "/*";
    long Handle = _findfirst(strfind.c_str(), &FileInfo);
    if (Handle == -1L)
    {
		std::string errorlog = "Canot open dir!" + folderPath;
        fprintf(stderr,"Canot open dir: %s\n", errorlog.c_str());
		return;
    }
    do{
        if (FileInfo.attrib & _A_SUBDIR)
        {
            if( (strcmp(FileInfo.name,".") != 0 ) &&(strcmp(FileInfo.name,"..") != 0))
            {
                std::string newPath = folderPath + "/" + FileInfo.name;
                if (type == 1)
                {
                    fileArray.push_back(newPath);
                    continue;
                }
                _loopFiles(newPath,type);
            }
        }
        else
        {
            if (type == 0)
            {
                std::string filename = (folderPath + "/" + FileInfo.name);
                fileArray.push_back(filename);
            }
        }
    }while (_findnext(Handle, &FileInfo) == 0);
    _findclose(Handle);
#else
    DIR *dp;
    struct dirent *entry;
    struct stat statbuf;
    if((dp = opendir(folderPath.c_str())) == NULL)
    {
        fprintf(stderr,"cannot open directory: %s\n", folderPath.c_str());
        return;
    }
    chdir(folderPath.c_str());
    while((entry = readdir(dp)) != NULL)
    {
        lstat(entry->d_name,&statbuf);
        if(S_ISDIR(statbuf.st_mode))
        {
            if(strcmp(".",entry->d_name) == 0 || strcmp("..",entry->d_name) == 0)
            {
                continue;
            }
            if (type == 1)
            {
                //dir
                fileArray.push_back(folderPath + "/" + entry->d_name);
                continue;
            }
            _loopFiles(folderPath + "/" + entry->d_name,type);
        }
        else
        {
            if (type == 0)
            {
                std::string filename = entry->d_name;
                fileArray.push_back(folderPath + "/" + filename);
            }
        }
    }
    chdir("..");
    closedir(dp);
#endif
}

std::vector<std::string> Platform::loopFiles(const std::string &folderPath)
{
    fileArray.clear();
    _loopFiles(folderPath,0);
    return fileArray;
}

std::vector<std::string> Platform::loopDirectories(const std::string &folderPath)
{
    fileArray.clear();
    _loopFiles(folderPath,1);
    return fileArray;
}
