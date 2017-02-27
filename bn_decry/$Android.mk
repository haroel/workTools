LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

ifeq ($(USE_ARM_MODE),1)
LOCAL_ARM_MODE := arm
endif

LOCAL_SRC_FILES := hellojavascript/main.cpp \
				   ../../Classes/AppDelegate.cpp \
				   ../../Classes/SDKManager.cpp \
				   ../../Classes/jsb_anysdk_basic_conversions.cpp \
				   ../../Classes/manualanysdkbindings.cpp \
				   ../../Classes/jsb_anysdk_protocols_auto.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../Classes
# 加密库的代码文件路径
LOCAL_C_INCLUDES += $(LOCAL_PATH)/../../../bn_decry/bn_decry

LOCAL_STATIC_LIBRARIES := cocos2d_js_static 
# 把加密的静态库编译到动态库中
LOCAL_STATIC_LIBRARIES += bndecry_static 

LOCAL_WHOLE_STATIC_LIBRARIES := PluginProtocolStatic

LOCAL_EXPORT_CFLAGS := -DCOCOS2D_DEBUG=2 -DCOCOS2D_JAVASCRIPT

include $(BUILD_SHARED_LIBRARY)


$(call import-module, scripting/js-bindings/proj.android)
# 链接加密库的mk的路径
$(call import-module, ../../bn_decry) 