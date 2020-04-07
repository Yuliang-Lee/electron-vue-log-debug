const path = require('path')
const fs = require('fs').promises

const XLSX = require('xlsx')
const { log } = require('@/utils/log')

self.addEventListener('message', async(event) => {
  log.info('assemble worker received message:', event.data)
  if (event.data.type === 'assemble:begin-scan') {
    log.info('assemble:begin-scan')

    try {
      await assemble(event.data)
    } catch (error) {
      log.error(error)
      self.postMessage({ type: 'error', message: error.message })
    }
  }
})

/**
 *
 * @param {Object} obj
 * @param {String} obj.filePath
 * @param {String} obj.fileType
 * @param {String} obj.fileName
 */
async function assemble(obj) {
  const { filePath, fileType, fileName } = obj
  const dir = await fs.opendir(filePath)
  const headerSet = new Set()
  const dataList = []
  let filterReg
  if (fileType === 'name') {
    filterReg = new RegExp(`^${fileName}$`)
  } else {
    filterReg = /.*\.(xlsx|xls)$/g
  }

  for await (const dirent of dir) { // 每个子文件夹包含一个专辑
    if (dirent.isDirectory()) {
      const subDirPath = path.join(dir.path, dirent.name)
      log.log(dirent, `subDirPath => ${subDirPath}`)
      self.postMessage({ type: 'subdirStart', dirName: dirent.name })

      const excelFilePath = await findFile(subDirPath, filterReg)
      if (typeof excelFilePath === 'string') {
        const childWorkBook = XLSX.readFile(excelFilePath)
        const firstSheetName = childWorkBook.SheetNames[0]
        const subDataList = XLSX.utils.sheet_to_json(childWorkBook.Sheets[firstSheetName])
        dataList.push(...subDataList)

        for (const subData of subDataList) {
          for (const key in subData) {
            headerSet.add(key)
          }
        }
        await new Promise((resolve) => {
          setTimeout(_ => {
            resolve()
          }, 2000)
        })
        self.postMessage({ type: 'subdirEnd', dirName: dirent.name })
      } else {
        log.error(excelFilePath)
        self.postMessage({ type: 'subdirError', dirName: dirent.name, errorMsg: excelFilePath.message })
        continue
      }
    }
  }

  // 生成文件
  // 如果存在同名文件, 先删除
  let totalFilePath
  try {
    totalFilePath = path.join(filePath, 'total.xlsx')
    await fs.readFile(totalFilePath)
    await fs.unlink(totalFilePath) // 删除文件, 如果本来就不存在会抛异常
  } catch (error) {
    // do nothing
  }

  const wb = XLSX.utils.book_new()
  var ws = XLSX.utils.json_to_sheet(dataList, { header: Array.from(headerSet) })
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
  XLSX.writeFile(wb, totalFilePath)

  self.postMessage({ type: 'end' })
}

/**
 * 在路径下查找指定文件
 * @param {String} startPath 查找的路径
 * @param {RegExp} filterReg 文件名正则
 *
 * @returns {Promise<string | Error>}
 */
async function findFile(startPath, filterReg) {
  // console.log('Starting from dir '+startPath+'/');

  let files
  try {
    files = await fs.readdir(startPath)
  } catch (error) {
    return new Error('目录不存在')
  }
  for (const filename of files) {
    if (filterReg.test(filename)) { // 找出第一个命中的文件即可
      const filePath = path.join(startPath, filename)
      return filePath
    };
  };

  return new Error('文件不存在')
};
