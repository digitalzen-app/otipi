<template>
  <div id="qr-code-full-region"></div>
</template>

<scrip lang="ts">
export default {
  name: "QrcodeScanner",
  props: {
    qrbox: {
      type: Number,
      default: 250,
    },
    fps: {
      type: Number,
      default: 10,
    },
  },
  mounted() {
    const config = {
      fps: this.fps,
      qrbox: this.qrbox,
    };
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-code-full-region",
      config
    );
    html5QrcodeScanner.render(this.onScanSuccess);
  },
  methods: {
    onScanSuccess(decodedText, decodedResult) {
      this.$emit("result", decodedText, decodedResult);
    },
  },
};
</script>

<style>
#qr-code-full-region {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
#html5-qrcode-button-camera-stop {
  display: none;
}
</style>