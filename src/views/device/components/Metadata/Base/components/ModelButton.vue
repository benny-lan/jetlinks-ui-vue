<template>
  <j-button :disabled="disabled" style="padding-left: 0;" type="link">
    <AIcon type="SettingOutlined" />
    配置
  </j-button>
</template>

<script name="ModelButton" setup>

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>

</style>
