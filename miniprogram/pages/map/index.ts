// 设置背景语音信息
const backgroundAudioManager = wx.getBackgroundAudioManager();
backgroundAudioManager.title = "景点播报";
backgroundAudioManager.epname = "景点播报";
backgroundAudioManager.singer = "主持人";
backgroundAudioManager.coverImgUrl =
  "http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000";

// 天府软件园b区5栋区域坐标
const INIT_POLYGON = [
  {
    latitude: 30.54635991972162,
    longitude: 104.07099928984013,
  },
  {
    latitude: 30.546343863269584,
    longitude: 104.07171574696989,
  },
  {
    latitude: 30.54597571130357,
    longitude: 104.07166780562493,
  },
  {
    latitude: 30.545918366632,
    longitude: 104.07111914327926,
  },
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    current: {
      latitude: 0,
      longitude: 0,
    },

    polygons: [
      {
        points: INIT_POLYGON,
        strokeWidth: 2,
      },
    ],

    // 是否在附近
    isInNear: false,
  },

  // 获取当前地图的中心坐标
  getCurrentCenter() {
    wx.getLocation({
      type: "gcj02",
      altitude: "false",
      success: (result) => {
        this.setData({
          current: {
            latitude: result.latitude,
            longitude: result.longitude,
          },
        });
      },
      fail: () => {},
      complete: () => {},
    });
  },

  // 获取用户实时位置坐标
  getRealTimePosition() {
    const _locationChangeFn = (result: any) => {
      console.log("location change", result);

      const isIn = this.isInPolygon(result);

      if (isIn && !this.data.isInNear) {
        this.onInCallback();
      }

      if (!isIn && this.data.isInNear) {
        this.onOutCallback();
      }
    };
    wx.startLocationUpdate({
      success: (res) => {
        wx.onLocationChange(_locationChangeFn);
      },
      fail: (err) => {},
    });
  },

  onLoad: function () {
    this.getCurrentCenter();

    this.getRealTimePosition();
  },

  // 在附近时回调函数
  onInCallback() {
    this.setData({
      isInNear: true,
    });
    console.log("进入软件园b区5栋范围内, 播放音频");
    // 设置了 src 之后会自动播放
    backgroundAudioManager.src =
      "https://xiyoutianxia.oss-cn-hangzhou.aliyuncs.com/upload/000.mp3";
  },

  // 退出附近时回调函数
  onOutCallback() {
    this.setData({
      isInNear: false,
    });
    console.log("退出软件园b区5栋范围内, 停止播放音频");
    backgroundAudioManager.stop();
  },

  // 判断实时位置是否在软件园b区5栋附近
  isInPolygon(result: any) {
    let isIn = false;
    for (let i = 0; i < INIT_POLYGON.length; i++) {
      const r = this.getDistance(
        result.latitude,
        result.longitude,
        INIT_POLYGON[i].latitude,
        INIT_POLYGON[i].longitude
      );

      if (Number(r) < 91) {
        isIn = true;
      }
    }

    return isIn;
  },

  Rad(d: number) {
    //根据经纬度判断距离
    return (d * Math.PI) / 180.0;
  },

  // 获取两个坐标之间的距离
  getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    // lat1用户的纬度
    // lng1用户的经度
    // lat2商家的纬度
    // lng2商家的经度
    var radLat1 = this.Rad(lat1);
    var radLat2 = this.Rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.Rad(lng1) - this.Rad(lng2);
    var s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
        )
      );
    s = s * 6378.137;
    s = Math.round(s * 10000000) / 10000000;

    console.log("经纬度计算的距离:" + (s * 1000).toFixed(2));
    return (s * 1000).toFixed(2);
  },
});
