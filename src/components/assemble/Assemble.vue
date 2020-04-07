<template>
  <div class="assemble">
    <el-form :model="form" label-position="left">
      <el-form-item label="选择目录" label-width="70px" style="margin-top:16px;" :error="dirErrorText">
        <el-input v-model="form.destPath" readonly size="mini" class="dir-text"></el-input>
        <i class="iconfont icon-wenjianjia" @click="handleOpenDirectory" />
      </el-form-item>
    </el-form>

    <div class="center" style="margin-top: 8px;">
      <el-button type="primary" :disabled="dirError" :loading="processing" @click="beginAssemble">开始处理</el-button>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import WorkerAssemble from './logic.worker.js'
const { promises: fsPromise } = require('fs')
const { log } = require('@/utils/log')

export default {
  name: 'Assemble',
  data() {
    return {
      processed: false,
      dirError: true,
      processing: false,
      dirErrorText: '',
      form: {
        destPath: '',
        excelFilter: 'only', // only | name
        excelName: '',
        totalSubDir: 0
      },
      processList: []
    }
  },
  computed: {
  },
  mounted() {
    this.worker = new WorkerAssemble()
    this.init()
  },
  beforeDestroy() {
  },
  methods: {
    init() {
      this.worker.addEventListener('message', ({ data: obj }) => {
        if (obj.type && this[obj.type] && typeof this[obj.type] === 'function') {
          this[obj.type](obj)
        }
      })

      this.worker.onerror = (evt) => {
        log.error(evt.message)
        this.processList.push({
          type: 'error',
          errorMsg: evt.message
        })
      }
    },

    subdirStart(obj) {
      const { processList } = this
      processList.push({
        id: Date.now(),
        type: 'process',
        dirName: obj.dirName,
        finished: false,
      })
    },
    subdirEnd(obj) {
      const { processList } = this
      const current = processList.find(item => item.dirName === obj.dirName)
      current.finished = true
    },
    subdirError(obj) {
      const { processList } = this
      const current = processList[processList.length - 1]
      current.finished = true
      current.errorMsg = obj.errorMsg
    },
    end(obj) {
      const { processList } = this
      this.processing = false
      this.processed = true
      processList.push({
        type: 'success',
        message: '文件已生成!'
      })
    },
    error(obj) {
      const { processList } = this
      this.processing = false
      this.processed = true
      processList.push({
        type: 'error',
        errorMsg: obj.message
      })
    },

    destPath(obj) {
      const { form } = this
      form.destPath = obj.destPath
      form.totalSubDir = obj.totalSubDir

      if (obj.totalSubDir === 0) {
        this.dirError = true
        this.dirErrorText = '所选目录下找不到文件夹, 请重新选择'
      } else {
        this.dirError = false
        this.dirErrorText = ''
      }
    },

    async handleOpenDirectory() {
      const result = await remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      log.debug(result)
      if (!result.canceled) {
        const filePath = result.filePaths[0]
        const dir = await fsPromise.opendir(filePath)

        let totalSubDir = 0
        for await (const dirent of dir) { // 每个子文件夹包含一个专辑
          if (dirent.isDirectory()) {
            totalSubDir++
          }
        }
        this.destPath({ totalSubDir, destPath: filePath })
        // customSend(event, 'assemble:dest-path', { destPath: filePath, totalSubDir })
      }
    },

    async beginAssemble() {
      const { form, processed, $refs } = this

      if (processed) {
        this.processed = false
        this.processList = []
      }
      this.processing = true

      this.$nextTick(_ => {
        this.worker.postMessage({
          type: 'assemble:begin-scan',
          filePath: form.destPath,
          fileType: form.excelFilter,
          fileName: form.excelName
        })
        // $refs.detail.setAttribute('open', true)
      })
    },
  }
}
</script>

<style lang="scss">
.assemble {

}
.dir-text {
  width: 370px;
}

.filter {
  .el-form-item__label {
    float: none;
  }
}
.result-block {
  width: 100%;
  height: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  overflow: auto;

  .result-status {
    font-style: italic;
    &.finished {
      color: $success;
    }
    &.error {
      color: $danger;
    }
  }

  .error-msg {
    color: $danger;
  }
}
.file-name {
  margin-left: 8px;
  width: 240px;
}
</style>>
