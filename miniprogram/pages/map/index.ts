import { scenicSpots } from '../../utils/mock'
import Geo from '../../utils/geo'

// 设置背景语音信息
const backgroundAudioManager = wx.getBackgroundAudioManager();


const setBackgroundAudioManager = ({title, epname, singer, coverImgUrl, src}: {title: string, epname: string, singer: string, coverImgUrl: string, src: string}) => {
  backgroundAudioManager.title = title;
  backgroundAudioManager.epname = epname;
  backgroundAudioManager.singer = singer;
  backgroundAudioManager.coverImgUrl = coverImgUrl
  backgroundAudioManager.src = src;

  console.log(`进入${title}范围内, 播放音频`);
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 地图中心
    current: {
      latitude: 0,
      longitude: 0,
    },
    // 绘制景点
    polygons: [] as any,
    // 保存景点相关信息
    polygonInfos: [] as any,
    // 记录当前播报的景点的index
    isInIndex: -1,
  },

  onLoad: async function () {
    this.getCurrentCenter();

    await this.preparePolygons()

    this.getRealTimePosition();
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

  // 准备景点相关数据
  async preparePolygons(){
    const res: any[] = await new Promise((resolve) => {
      resolve(scenicSpots)
    })

    this.setData({
      polygons: res.map(({audioInfo, ...rest}) => ({...rest})),
      polygonInfos: res.map((item) => {
        const points: any[] = []
        item.points.forEach((i: any) => {
          points.push(i.latitude);
          points.push(i.longitude);
        })
        return {
          ...item,
          polygon: Geo.toPolygon(points)
        }
      })
    })
  },

  

  // 获取用户实时位置坐标
  getRealTimePosition() {
    const _locationChangeFn = (result: any) => {
      console.log("location change", result);

      let containIndex = this.getCurrentPolygonIndex(result);
      console.log('xxxxxxx', containIndex, this.data.isInIndex)

      if(containIndex !== -1 && containIndex !== this.data.isInIndex ) {
        this.onInCallback(containIndex)
      } 

      if(containIndex === -1 && this.data.isInIndex !== -1) {
        this.onOutCallback()
      }

    };

    wx.startLocationUpdate({
      success: () => {
        wx.onLocationChange(_locationChangeFn);
      },
      fail: () => {},
    });
  },

  // 进入景点时回调函数
  onInCallback(index: number) {
    this.setData({
      isInIndex: index,
    });
    setBackgroundAudioManager(this.data.polygonInfos[index].audioInfo)
  },

  // 退出景点时回调函数
  onOutCallback() {
    this.setData({
      isInIndex: -1,
    });
    console.log("退出景区, 停止播放音频");
    backgroundAudioManager.stop();
  },

  // 获取当前景点的index
  getCurrentPolygonIndex(result: any) {
    let containIndex = -1;

    for (let i = 0; i < this.data.polygonInfos.length; i++) {
      if(this.data.polygonInfos[i].polygon.contains({x: result.latitude, y: result.longitude})) {
        containIndex = i;
      }
    }

    return containIndex;
  },
});
