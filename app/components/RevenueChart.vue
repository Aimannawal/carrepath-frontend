<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

defineProps({
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) }
})
</script>

<template>
  <Line :data="data" :options="options" />
</template>
