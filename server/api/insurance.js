export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { carValue, isNew, hasGPS, paymentPlan } = body

  let coefficient
  if (carValue < 40000) coefficient = 8
  else if (carValue < 100000) coefficient = 5
  else if (carValue < 200000) coefficient = 4
  else if (carValue < 400000) coefficient = 2
  else return { premium: "Nie można oszacować składki dla samochodów powyżej 400000 zł netto." }

  // If the car is not new (isNew is false), the coefficient is incremented by 1.
  if (!isNew) coefficient += 1

  // The initial premium is calculated as a percentage of the car value, using the coefficient.
  let premium = carValue * (coefficient / 100)

  // If the car does not have a GPS (hasGPS is false), the premium is increased by 11%.
  if (!hasGPS) premium *= 1.11


  // If the payment plan is more than one installment:
  // A flat fee of 200 is added to the premium.
  // If the payment plan is for two installments, the premium is increased by 2%.
  // If the payment plan is for more than two installments, the premium is increased by 4%.
  if (paymentPlan > 1) {
    premium += 200
    premium *= paymentPlan === 2 ? 1.02 : 1.04
  }

  return { premium: Math.round(premium) }
})
