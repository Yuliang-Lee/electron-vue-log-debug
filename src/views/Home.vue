<template>
  <div class="home">
    <el-tabs type="border-card">
      <el-tab-pane label="test">
        <assemble></assemble>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Assemble from '@/components/assemble/Assemble'

export default {
  name: 'Home',
  components: {
    Assemble,
  },
  data() {
    return {

    }
  },
  methods: {

  }
}
</script>

<style lang="scss">
.home {
  width: 500px;

}

.icon-wenjianjia {
  margin: 0px 0 0 4px;
  line-height: 1.5;
  vertical-align: middle;
  font-size: 18px;
  cursor: pointer;

}
</style>
