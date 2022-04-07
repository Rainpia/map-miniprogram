const backgroundAudioManager = wx.getBackgroundAudioManager();
backgroundAudioManager.title = "景点播报";
backgroundAudioManager.epname = "景点播报";
backgroundAudioManager.singer = "主持人";
backgroundAudioManager.coverImgUrl =
  "http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000";

// 天府软件园b区5栋区域
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
  },
  onLoad: function () {
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

        const r = this.getDistance(
          result.latitude,
          result.longitude,
          INIT_POLYGON[0].latitude,
          INIT_POLYGON[0].longitude
        );

        console.log("xxxxxxx", `${r}`);
      },
      fail: () => {},
      complete: () => {},
    });

    this.location();

    backgroundAudioManager.onPlay(() => {
      console.log("play");
    });
  },

  onCallback() {
    console.log("进入软件园b区5栋范围内");
    // 设置了 src 之后会自动播放
    backgroundAudioManager.src =
      "https://xiyoutianxia.oss-cn-hangzhou.aliyuncs.com/upload/000.mp3";
  },

  isInPolygon(result: any) {
    let isIn = false;
    for (let i = 0; i < INIT_POLYGON.length; i++) {
      const r = this.getDistance(
        result.latitude,
        result.longitude,
        INIT_POLYGON[i].latitude,
        INIT_POLYGON[i].longitude
      );
      if (Number(r) < 200) {
        isIn = true;
      }
    }

    return isIn;
  },

  // 获取位置信息
  getWxLocation() {
    wx.showLoading({
      title: "定位中...",
      mask: true,
    });
    return new Promise((resolve: any, reject) => {
      const _locationChangeFn = (result: any) => {
        console.log("location change", result);
        wx.hideLoading();

        if (this.isInPolygon(result)) {
          this.onCallback();
        }
      };
      wx.startLocationUpdate({
        success: (res) => {
          wx.onLocationChange(_locationChangeFn);
          resolve();
        },
        fail: (err) => {
          reject();
        },
      });
    });
  },

  async location() {
    const that = this;
    try {
      await that.getWxLocation();
    } catch (error) {
      return;
    }
  },

  Rad(d: number) {
    //根据经纬度判断距离
    return (d * Math.PI) / 180.0;
  },
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
