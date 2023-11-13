<template>
  <j-modal
      :title="title"
      :confirmLoading="loading"
      :width="400"
      @cancel="cancel"
      @ok="ok"
      visible
  >
    <div style="height: 300px; width: 100%;">
      <vue-cropper
          ref="cropper"
          :auto-crop-height="200"
          :fixed-box="true"
          :auto-crop-width="200"
          :autoCrop="true"
          :img="img"
          outputType="jpg"
      ></vue-cropper>
    </div>
  </j-modal>
</template>

<script lang="ts" name="UploadCropper" setup>
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper';
import { fileUpload } from '@/api/comm';

const props = defineProps({
  img: {
    type: String
  },
  title: {
    type: String,
    default: '图片编辑'
  }
})

const emit = defineEmits(['cancel', 'ok'])

const imgUrl = ref()
const cropper = ref()
const loading = ref(false)

const ok = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    console.log(data)
    let formData = new FormData()
    formData.append('file', data, new Date().getTime() + '.jpg')

    imgUrl.value = data
    loading.value = true
    fileUpload(formData).then(res => {
      if (res.success) {
        emit('ok', res.result)
      }
    }).finally(() => {
      loading.value = false
    })
  })

}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>

</style>
