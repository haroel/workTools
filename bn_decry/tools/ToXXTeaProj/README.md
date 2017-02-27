# lzmaAndXXtea
lzmaAndXXtea
资源加密+压缩工具

加密方法：
 > 生成unix可执行文件后,在该目录下新建一个__config.txt文件，里面配置加密的资源路径目录和加密key，用=分割，如果不配置，则默认从当前目录下查找workspace目录，并加密该目录下的文件

    __config.txt
    /Users/howe/Desktop/test=hello


以上表示用hello作为加密钥匙来加密/Users/howe/Desktop/test目录下的文件
{".svn", ".git", ".DS_Store",".ttf",".TTF",".mp3",".meta",".wav" }; 这些格式的文件将不会被加密