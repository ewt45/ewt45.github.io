export class CustomEdit {
  /**全图宽 */
  fullWidth = 1280;
  /**16:10的全图高 */
  fullHeight = 800;
  /**16:9的全图高 */
  fullHeightShort = 720;
  /**左侧图占全图的比例 */
  toLeftRatio = 0.3;
  /**主图url */
  mainImgSrc = "";
  /**(废弃，用videoInfo里的)分p图url */
  // subImgSrc = "";
  /**输入的bv号 */
  inPutBvid = "";
  /**输入的bv号所属的合集小节序号 为-1说明此视频不属于合集 */
  sectionIndex = -1;
  /**当前正在处理的视频在小节中的序号 */
  currEpisodeIndex = 0;
  /**当前小节分p总数 */
  epCnt = 0;
  /**获取到的视频信息 */
  videoInfo = null;
  /**主图缩放和位移信息 */
  mainImgProps = {
    /**以左上角为原点的x和y偏移值 */
    off: [0, 0],
    /**缩放倍率 */
    scale: 1,
  };
  /**分p图缩放和位移信息 */
  subImgProps = {
    /**以左上角为原点的x和y偏移值 */
    off: [0, 0],
    /**缩放倍率 */
    scale: 1,
  };
  /**文本 */
  titleText = "[幕后花絮] 坏蛋联盟";
  subTitleText = "Maraschino Ruby";
  /**副标题宽度占画布宽度百分比 */
  subTiW = 0.7;
  constructor() { }

}
/** 节流 防止请求b站api频繁导致被禁 */
export class MyThrottle {
  /**上一次发送请求的时间 */
  last: number;
  constructor() {
    this.last = Date.now();
  }
  /**检查是否可以发送请求
   * @params number 距离上一次请求的最短间隔，单位毫秒 */
  valid = (interval: number) => {
    let now = Date.now()
    // console.log('对比两个时间', now - 1000, this.last)
    if (now > this.last + interval) {
      this.last = now;
      return true;
    }
    else
      return false;
  }
}