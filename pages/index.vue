<template>
  <form @submit.prevent="calculatePremium" class="space-y-6 max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <div class="space-y-1">
      <Label for="carValueNet" class="block text-gray-700">Wartość samochodu (netto):</Label>
      <Input type="number" v-model.number="carValueNet" @input="updateGrossFromNet" required class="w-full px-3 py-2 border border-gray-300 rounded-md" />
    </div>
    
    <div class="space-y-1">
      <Label for="carValueGross" class="block text-gray-700">Wartość samochodu (brutto):</Label>
      <Input type="number" v-model.number="carValueGross" @input="updateNetFromGross" required class="w-full px-3 py-2 border border-gray-300 rounded-md" />
    </div>

    <div class="space-y-1">
      <Label for="carYear" class="block text-gray-700">Rok produkcji samochodu:</Label>
      <Select v-model="carYear" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Wybierz rok produkcji" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="year in availableYears" :key="year" :value="year">{{ year }}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <div class="space-y-1 flex items-center space-x-3">
      <Input id="hasGPS" type="checkbox" :checked="hasGPS" @change="toggleGPS" class="form-checkbox h-5 w-5 text-blue-600" />
      <Label for="hasGPS" class="block text-gray-700">Czy samochód ma GPS (Pakiet Drive+)?</Label>
    </div>

    <div class="space-y-1">
      <Label for="paymentPlan" class="block text-gray-700">Liczba rat:</Label>
      <Select v-model="paymentPlan" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Liczba rat" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="plan in paymentPlans" :key="plan.value" :value="plan.value">{{ plan.text }}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    
    <Button type="submit" :disabled="carValueNet === 0" class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Oblicz składkę</Button>
  </form>

  <div v-if="premium !== null" class="mt-6 p-4 bg-green-100 rounded-lg text-center">
    <h2 class="text-lg font-bold text-green-700">Wynik</h2>
    <p class="text-green-700">
      {{ isNaN(premium) ? premium : `Składka: ${premium} zł netto / ${(premium * 1.23).toFixed(2)} zł brutto` }}
    </p>
    <p v-if="paymentPlan > 1 && carValueNet < 400000" class="text-green-700">
      Rata: {{ (premium / paymentPlan).toFixed(2) }} zł netto / {{ (premium / paymentPlan  * 1.23).toFixed(2) }} zł brutto
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Current year and 4 previous years
const currentYear = new Date().getFullYear()
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i)

// Payment plans
const paymentPlans = [
  { value: 1, text: 'Jednorazowo' },
  { value: 2, text: '2 raty' },
  { value: 4, text: '4 raty' },
]

const carValueNet = ref(0)
const carValueGross = ref(0)
const carYear = ref(null)
const isNew = computed(() => carYear.value >= currentYear - 1)
const hasGPS = ref(true)
const paymentPlan = ref(1)
const premium = ref(null)

const toggleGPS = () => {
  hasGPS.value = !hasGPS.value
}

// Watchers to reset premium on carValueNet, carValueGross or carYear change
watch([carValueNet, carValueGross, carYear, hasGPS, paymentPlan], () => {
  premium.value = null
})

// Update gross value when net value changes
const updateGrossFromNet = () => {
  if (carValueNet.value) {
    carValueGross.value = (carValueNet.value * 1.23).toFixed(2)
  } else {
    carValueGross.value = 0
  }
}

// Update net value when gross value changes
const updateNetFromGross = () => {
  if (carValueGross.value) {
    carValueNet.value = (carValueGross.value / 1.23).toFixed(2)
  } else {
    carValueNet.value = 0
  }
}

const calculatePremium = async () => {
  if (carYear.value < currentYear - 4) {
    premium.value = "Nie obsługujemy samochodów starszych niż 5 lat."
    return
  }

  const response = await fetch('/api/insurance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      carValue: carValueNet.value,
      isNew: isNew.value,
      hasGPS: hasGPS.value,
      paymentPlan: paymentPlan.value,
    }),
  })
  const data = await response.json()
  premium.value = data.premium
}
</script>
