let Geo: any = {};

/**
 * 定义常量
 */

//地球半径（米）
Geo.EARTH_RADIUS = 6371004;

/**
 * 将米转换成度
 * @param meterValue 以米为单位的值
 * @returns {number}
 */
Geo.meter2Degree = function (meterValue: number) {
  return (meterValue / (2 * Math.PI * Geo.EARTH_RADIUS)) * 360;
};

/**
 * 求两点之间的距离
 * @param point1
 * @param point2
 * @returns {number}
 */
Geo.calTwoPointsLenth = function (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) {
  let tempX = point1.x - point2.x;
  let tempY = point1.y - point2.y;
  return Math.sqrt(tempX * tempX + tempY * tempY);
};

/**
 * 经纬度点
 * gps点
 */
Geo.Point = {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  },
};

/**
 * 多边形面区域
 */
Geo.Polygon = {
  constructor(points: any[]) {
    this.array = points;
    if (this.array.length < 3)
      throw new Error("Polygon formation requires at least three points");
    this._calCenter();
  },

  /**
   * 计算外接矩形范围
   * @private
   */
  _calCenter() {
    let boundsMinX = Number.MAX_VALUE;
    let boundsMinY = Number.MAX_VALUE;
    let boundsMaxX = Number.MIN_VALUE;
    let boundsMaxY = Number.MIN_VALUE;

    for (let i = 0; i < this.array.length; i++) {
      let point = this.array[i];
      boundsMinX = Math.min(boundsMinX, point.x);
      boundsMinY = Math.min(boundsMinY, point.y);
      boundsMaxX = Math.max(boundsMaxX, point.x);
      boundsMaxY = Math.max(boundsMaxY, point.y);
    }
    //计算中心点
    this.center = new Geo.Point(
      boundsMinX + (boundsMaxX - boundsMinX) / 2,
      boundsMinY + (boundsMaxY - boundsMinY) / 2
    );
  },

  /**
   * 计算某个点是否在一个多边形内
   * 为了性能考虑，倘若多边形过多，这时候可以先用中心点计算距离进行一个初步的筛查，然后再进一步计算
   * @param point
   * @param distance 阈值，如果小于这个阈值再进行进一步计算，单位米，会在之后转换单位
   * @returns {boolean}
   */
  contains(point: { x: number; y: number }, distance = 25) {
    let temp = Geo.meter2Degree(distance);
    //首先通过中心点进行一个大致的判断如果多边形中心点距离GPS点小于阈值再进行精确判断
    if (Geo.calTwoPointsLenth(this.center, point) < temp) {
      return this.containsPoint(point);
    }
    return false;
  },

  /**
   * 判断一个点是否在该多边形中
   * @param point 要判断的点
   * @returns {boolean}
   */
  containsPoint(point: { x: number; y: number }) {
    let hits = 0;
    let lastPoint = this.array[this.array.length - 1];

    let curPoint;
    for (let i = 0; i < this.array.length; lastPoint = curPoint, i++) {
      curPoint = this.array[i];

      if (curPoint.y === lastPoint.y) continue;

      let leftx;
      if (curPoint.x < lastPoint.x) {
        if (point.x >= lastPoint.x) continue;
        leftx = curPoint.x;
      } else {
        if (point.x >= curPoint.x) continue;
        leftx = lastPoint.x;
      }

      let test1, test2;
      if (curPoint.y < lastPoint.y) {
        if (point.y < curPoint.y || point.y >= lastPoint.y) continue;
        if (point.x < leftx) {
          hits++;
          continue;
        }
        test1 = point.x - curPoint.x;
        test2 = point.y - curPoint.y;
      } else {
        if (point.y < lastPoint.y || point.y >= curPoint.y) continue;
        if (point.x < leftx) {
          hits++;
          continue;
        }
        test1 = point.x - lastPoint.x;
        test2 = point.y - lastPoint.y;
      }

      if (
        test1 <
        (test2 / (lastPoint.y - curPoint.y)) * (lastPoint.x - curPoint.x)
      ) {
        hits++;
      }
    }
    return (hits & 1) != 0;
  },
};

/**
 * 转换成点point对象
 * @param x
 * @param y
 * @returns {Point}
 */
Geo.toPoint = function (x: number, y: number) {
  return new Geo.Point(x, y);
};

/**
 * 转换为Polygon对象
 * 输入数据格式: [x, y, x, y, x, y ...]
 * @param array
 * @returns {Polygon}
 */
Geo.toPolygon = function (array: number[]) {
  let list = [];
  let len = array.length / 2;
  for (let i = 0; i < len; i++) {
    let x = array[i * 2];
    let y = array[i * 2 + 1];
    list.push(new Geo.Point(x, y));
  }
  return new Geo.Polygon(list);
};

export default Geo;
