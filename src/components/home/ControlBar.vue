<template>
  <div class="ControlBar">
    <!-- 播放音乐 -->
    <!-- autoplay 如果出现该属性，则音频在就绪后马上播放。 -->
    <!-- loop 如果出现该属性，则每当音频结束时重新开始播放。 -->
    <!-- muted 如果出现该属性，则音频输出为静音。 -->
    <!-- controls 如果出现该属性，则向用户显示音频控件（比如播放/暂停按钮）。 -->
    <!-- src支持跨域连接，这里可以直接写链接，src只支持get请求的跨域，JSONP就是运用script标签src属性的这个原理 。-->
    <audio :src="`https://music.163.com/song/media/outer/url?id=${songDetail[0].id}.mp3`" :autoplay="isAutoPlay"
      ref='audio' @timeupdate="timeUpdate" @play="changeIcon(true)" @pause="changeIcon(false)" @ended="next()"></audio>
    <el-drawer title="我是标题" :visible.sync="detailPlay" direction="btt" :before-close="handleClose" append-to-body class="drawer">
      <span>我来啦!</span>
    </el-drawer>
    <!-- 进度条 -->
    <div class="progress">
      <el-slider class="progressSlider" v-model="progress" :max="duration" :show-tooltip="false"
        @change="changeProgress"></el-slider>

      <!-- <input type="range" min='0' :step='Math.floor(duration/100)':max='duration' v-model='currentTime' style="width: 100%;height: 2px;" > -->
    </div>
    <!-- 控件 -->
    <div class="control r-flex">
      <!-- 左 -->
      <div class="left w-h r-flex">
        <div class="imgs" @click="updateDetailPlay(true) ">
          <img class="pointer" :src="songDetail[0].al.picUrl" v-if='songDetail[0].al.picUrl' />
          <img class="pointer" src="@/assets/imgs/wy-logo.jpg" v-else />
        </div>
        <div class="info">
          <p class="song pointer text-h-n-e">{{ songDetail[0].name }}</p>
          <p class="singer pointer text-h-n-e fs12">{{ songDetail[0].ar[0].name }}</p>
        </div>
        <div class="fa-pg fa fa-heart-o" :class="isLike ? 'fa-pg fa-heart' : ''"
          @click="playlist.length != 0 ? like() : ''">
        </div>
      </div>
      <!-- 中 -->
      <div class="middle w-h r-flex">
        <span @click="playlistIndex > 0 ? prev() : $message('客官，已经是第一首了')" class="fa-pg fa fa-step-backward"></span>
        <span @click="playlist.length != 0 ? play() : ''">
          <!-- 尽量不使用v-if切换播放暂停图标，减少对dom的增加删除等操作 -->
          <i :class="isPlay ? 'fa-pg fa fa-pause' :'fa-pg fa fa-play'"></i>
        </span>
        <span @click="playlistIndex < playlist.length - 1 ? next() : $message('客官，已经是最后一首了')"
          class="fa-pg fa fa-step-forward"></span>
      </div>
      <!-- 右 -->
      <!-- fa-volume-down fa-volume-off -->
      <div class="right w-h r-flex">
        <div :class="volumeOff ? 'fa-pg fa fa-volume-off' : 'fa-pg fa fa-volume-up'"></div>
        <div class="volume">
          <el-slider class="volumeSlider" height="1px" v-model="volume" @input="changeVolume" :show-tooltip="false">
          </el-slider>
        </div>
        <div class="fa-pg fa fa-bars"></div>
      </div>
    </div>
    <!-- 播放列表 -->
  </div>
</template>
 
<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      progress: 0,// 进度
      isLike: false,//
      volume: 100,// 声音
      volumeOff: false,// 静音
      songDetail: [{
        id: 18057481, // 歌曲id
        name: "In A Notebook ", // 歌曲名称
        ar: [{ //歌手
          name: "Goldmund",
        }],
        al: { // 专辑
          name: "The Malady Of Elegance",
          picUrl: "https://p2.music.126.net/vwTBDbUbHmDRrAYg6gxxfQ==/109951163439384227.jpg",
        },
        mv: 0,
      }],
    };
  },
  computed: {
    ...mapState(['playlist', 'playlistIndex', 'isPlay', 'isAutoPlay', 'duration', 'currentTime','detailPlay']),// 解构
   
  },
  mounted(){
    
  },
  methods: {
    // 解构
    ...mapMutations(['changePlay', 'changePlaylistIndex', 'changeAutoPlay', 'updateDuration','changeCurrentTime','updateDetailPlay']),

    // 播放或暂停按钮的回调
    play() {
      if (this.$refs.audio.paused) {
        this.$refs.audio.play() // 播放
        this.changePlay(true)// 暂停图标
        this.changeAutoPlay(true)// 暂停自动播放
        this.updateDuration(this.$refs.audio.duration)// 修改时长
      } else {
        this.$refs.audio.pause() // 暂停
        this.changePlay(false)// 播放图标
      }
    },
    async getSongDetail(){
      let res = await this.$api.music.reqSongDetails(this.playlist[this.playlistIndex])
      this.songDetail = res.songs
    },
    // 监听audio播放状态修改图标
    changeIcon(boolean) {
      this.changePlay(boolean)
      if(this.$refs.audio.duration == 'Nan'){
        this$message.warning("暂无版权")
        this.next()
      }
      if(boolean) {
        this.updateDuration(this.$refs.audio.duration)// 修改时长
      }
      console.log("end", this.$refs.audio.duration, 'start',this.$refs.audio.currentTime)
    },

    // 上一首
    prev() {
      this.changePlaylistIndex(this.playlistIndex - 1)
    },

    // 下一首
    next() {
      this.changePlaylistIndex(this.playlistIndex + 1)
    },

    // audio时间发生变化时，修改进度条。
    // 使用updated或vuex，数据量大时性能拉胯、卡，这里改用audio自带timeUpdate()方法
    timeUpdate(){
      this.progress = this.$refs.audio.currentTime
    },

    // 进度条的回调
    changeProgress(e) {
      this.progress = Math.floor((e / 100) * this.$refs.audio.duration)
      this.$refs.audio.currentTime = this.progress
    },

    // 改变音量条回调，改变当前audio的音量，input事件是实时触发的
    changeVolume(e) {
      this.$refs.audio.volume = e / 100;
      // 静音
      if (this.volumeOff && e > 0) {
        this.volumeOff = false;
      } else if (e == 0 && this.volumeOff == false) {
        this.volumeOff = true;
      }
    },

    // 喜欢该音乐
    like() { },
    handleClose(done) {
      this.updateDetailPlay( false)
      done();
    },

  },
  watch:{
    'isAutoPlay'(newVal,oldVal){
      // console.log(newVal,oldVal);
      if(!newVal){
        this.$refs.audio.pause()
      }
    },
    'playlistIndex'(newVal,oldVal){
      if(newVal!=oldVal){
        this.getSongDetail()
      }
    }
  }
};
</script>

<style lang="scss" scoped>
::vv-deep.el-drawer{
  height: 100% !important;;
}
.ControlBar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  min-width: 960px;
  height: 66px;
  background-color: white;
  //  设置背景透明
  background-color: rgba(0, 0, 0, 0.01);
}

.progress {
  width: 100%;
  height: 5px;
  box-sizing: border-box;

  // 音乐播放时长轨道长度
  .progressSlider {
    width: 100%;
    height: 2px;
  }

  // 修改element-ui轨道宽度
  ::v-deep .el-slider__runway {
    background-color: #ccc;
    height: 2px;
    margin: 0;
    padding: 0;
  }

  // 修改element-ui滑动按钮
  ::v-deep .el-slider__button {
    z-index: 100;
    width: 10px;
    height: 10px;
    border: 1px solid #fff; //!important 提高指定样式规则的应用优先权（优先级）
    background-color: black;
    display: none;
  }

  // 修改滑过的轨道颜色和宽度
  ::v-deep .el-slider__bar {
    height: 2px;
    border-radius: 2px;
    background-color: blue;

    &:hover {
      background-color: black;
    }
  }
}


.control {
  justify-content: space-between;
  align-items: center;

  // 动态计算宽度
  .w-h {
    width: calc(100vw / 3);
    height: 61px;
  }

  .left {
    align-items: center;
    overflow: hidden;

    .imgs {
      // min-width: 46px;
      // 上-右-下-左
      // margin: 0 10px 0 0;
      border-radius: .625rem;
      margin-right: 10px;

      img {
        width: 46px;
        height: 46px;
        border-radius: 10px;
      }
    }

    .info {
      // width: calc(100% - 15% - 46px - 10px - 50px);
      overflow: hidden;

      .song {
        width: 100%;
        color: #1e1d1d;
        font-weight: 600;
      }

      .singer {
        margin-top: 5px;
        width: 100%;
        color: #696969;
      }
    }

    .fa-heart {
      color: red;
      margin: 0 10px 0 20px;
    }

    .fa-heart-o {
      color: black;
      margin: 0 10px 0 20px;
    }
  }

  .middle {
    justify-content: center;
    align-items: center;

    span {
      font-size: 20px;

      &:nth-child(2) {
        margin: 0 20px;
        z-index: 100;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .right {
    justify-content: flex-end;
    align-items: center;

    .volume {
      margin: 0 25px 0 10px;

      // 声音轨道长度
      .volumeSlider {
        width: 85px;
      }

      // 修改element-ui轨道宽度
      ::v-deep .el-slider__runway {
        height: 4px;
        margin: 0;
        padding: 0;
      }

      // 修改element-ui滑动按钮
      ::v-deep .el-slider__button {
        z-index: 100;
        width: 10px;
        height: 10px;
        border: 1px solid #fff; //!important 提高指定样式规则的应用优先权（优先级）
        background-color: black;
        display: none;
      }

      // 修改滑动后的颜色和宽度
      ::v-deep .el-slider__bar {
        height: 4px;
        background-color: black;
        border-radius: 2px;

        &:hover {
          background-color: lightblue;
        }
      }
    }

    .fa {
      font-size: 18px;
    }
  }
}

.fa {
  cursor: pointer;
}

@media screen and (max-width: 1200px) {
  .imgs {
    margin: 0 10px 0 15%;
  }

  .fa-bars {
    margin-right: 15%;
  }
}

@media screen and (min-width: 1200px) {
  .imgs {
    margin: 0 10px 0 30%;
  }

  .fa-bars {
    margin-right: 30%;
  }
}



</style>