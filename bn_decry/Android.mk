LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := bndecry_static

LOCAL_MODULE_FILENAME := libbndecry

ifeq ($(USE_ARM_MODE),1)
LOCAL_ARM_MODE := arm
endif

LOCAL_SRC_FILES := bn_decry/GameFileUtils.cpp \
		bn_decry/decry/xxtea.c \
		bn_decry/decry/XXTeaUtil.cpp \
		bn_decry/decry/easylzma/common_internal.c \
		bn_decry/decry/easylzma/decompress.c \
		bn_decry/decry/easylzma/lzip_header.c \
		bn_decry/decry/easylzma/lzma_header.c \
		bn_decry/decry/easylzma/simple.c \
		bn_decry/decry/easylzma/pavlov/7zCrc.c \
		bn_decry/decry/easylzma/pavlov/Alloc.c \
		bn_decry/decry/easylzma/pavlov/LzmaDec.c \
		bn_decry/decry/easylzma/pavlov/LzmaLib.c 


LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/..

LOCAL_C_INCLUDES := $(LOCAL_PATH)/..
#此处需要映射到cocos2d-x引擎的目录
LOCAL_C_INCLUDES += $(LOCAL_PATH)/../cocos2d-x/cocos

LOCAL_CFLAGS += -fexceptions

include $(BUILD_STATIC_LIBRARY)
