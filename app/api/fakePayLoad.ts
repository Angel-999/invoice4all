// app/api/pdf/fakePayload.ts
export const fakeInvoice = {
  id: "782",
  date: new Date().toISOString(),
  carrier: {
    name: "Three Stars Transport Inc",
    address: "1427 Evanwood Ave",
    address2: "La Puente, California 91744",
    phone: "(619) 939-6319",
    email: "threestars039@gmail.com",
  },
  broker: {
    name: "CH GLOBAL",
    address: "9731 SIEMPRE VIVA RD",
    address2: "San Diego, California 92154",
    phone: "(619) 555-1234",
    email: "broker@example.com",
  },
  adjustments: { quickpayFeePercent: 0, fixedFee: 0 },
  items: [
    {
      description: "Line Haul",
      quantity: 1,
      cost: 2000,
      stops: [
        {
          type: "Pickup",
          city: "Sohnen Enterprise - 9043 Siempre Viva Rd, San Diego, CA",
          zip: "92154",
          datetime: new Date().toISOString(),
        },
        {
          type: "Delivery",
          city: "Z & S 26 Electronics, Inc. - 967 E. 11th Street, Los Angeles, CA",
          zip: "90021",
          datetime: new Date().toISOString(),
        },
      ],
    }
  ],
  color: "134A9E",
  secondaryColor: "134A9E",
};
