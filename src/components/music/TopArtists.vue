<template>
    <div class="TopArtist">
        <TitleBar name='热门艺人' :path="`/searchMore?type=${100}`" /><!-- {path:'/path',query:{id:'123'}} :path=-->
        <div class='artist grid'>
            <Circles v-for='artist in artists' :key="artist.id" :circles='artist' :path="`/artist?id=${artist.id}`" />
        </div>
    </div>
</template>

<script>
import Circles from '@/components/item/Circles.vue'
import TitleBar from '@/components/bar/TitleBar.vue'
export default {
    name: 'TopArtist',
    data() {
        return {
            artists:[],
        }
    },
    components: {
        TitleBar,
        Circles,
    },
    created() {
        this.getTopArtist()
    },
    methods:{
        async getTopArtist() {
            if (this.$getStorage('musicArtists')) {
                this.artists = this.$getStorage('musicArtists')
                return
            }
            let res = await this.$api.music.reqTopArtist()
            this.artists=res.artists.slice(0,5)
            this.$setStorage({ key: "musicArtists", value: this.artists })
        }
    },
}
</script>

<style lang="scss" scoped>

.artist {
    grid-template-columns: repeat(5, 1fr);

}
</style>