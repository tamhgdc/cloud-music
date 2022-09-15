<template>
  <div class="Music">
    <Swiper/>
    <Recommend/>
    <Express/>
    <TopArtists/>
    <TopList/>
  </div>
</template>

<script>
import Swiper from '@/components/music/Swiper.vue'
import Recommend from '@/components/music/Recommend.vue'
import Express from '@/components/music/Express.vue'
import TopArtists from '@/components/music/TopArtists.vue'
import TopList from '@/components/music/TopList.vue'

export default {
    name:'Music',
    components:{
        Swiper,
        Recommend,
        Express,
        TopArtists,
        TopList,
    },
}
</script>

<style lang='scss' scoped>
@media screen and (max-width: 1200px) {
  .Music {
    margin: 0 5%;
  }
}
@media screen and (min-width: 1200px) {
  .Music {
    margin: 0 10%;
  }
}
</style>