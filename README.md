# 微信小程序-景点，语音播报解决方案

## 描述

地图上有 n 个景点，当用户进入景点范围内，系统自动播报相关景点介绍

## 涉及痛点

- 如何获取用户实时位置坐标
- 如何确认景点范围
- 如何确定语音播放时机
- 如何播放语音

## 解决方案

- `wx.onLocationChange` 配合 `wx.startLocationUpdate` 获取实时位置坐标

- 微信小程序自带组件 `map` 的 `polygons` 属性可以画出景点多边形

- 轮询景点，判断用户坐标是否在景点范围内，如果在的话，即播放语音

- 微信小程序提供了 `BackgroundAudioManager` 对象来播放背景音频

## 优化方案

### 景点太多，每次都轮训所有景点，成本太高，如果解决？

事先设置一个阈值，先判断用户坐标跟各个景点的中心坐标的距离是否在这个阈值范围内，如果不在，则过滤，如果在，则再次计算用户坐标是否在景点范围内，具体方法见 `/miniprogram/utils/geo.ts` 文件

### 在景点内部的每次位置变化，都会触发语音播放回调，如何防止重复播放语音

利用一个 `flag` 判断当前是否已经在某个景点，如果在的话，就不需要再次调回调方法了

## 参考

- [微信小程序地图组件](https://developers.weixin.qq.com/miniprogram/dev/component/map.html)

- [微信小程序地图组件 deme](https://github.com/TencentLBS/TencentMapMiniProgramDemo)

- [创建一个小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html#%E4%BD%A0%E7%9A%84%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%B0%8F%E7%A8%8B%E5%BA%8F)

- [微信小程序背景音频对象](https://developers.weixin.qq.com/miniprogram/dev/api/media/background-audio/BackgroundAudioManager.html)

- [微信小程序全局配置文件，requiredBackgroundModes 属性](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#requiredBackgroundModes)
