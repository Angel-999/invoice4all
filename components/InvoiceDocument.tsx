import { Font, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { toWords } from "number-to-words";

Font.register({
    family: "Roboto",
    fonts: [
        { src: "/fonts/Roboto-Regular.ttf" },
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
    ],
});

type Stop = { type: string; city: string; zip: string; datetime: string };
type Item = { description: string; notes: string; quantity: number; cost: number; stops: Stop[] };

export type InvoicePayload = {
    id: string;
    load_number: string;
    date: string;
    carrier: { name: string; address: string; address2: string; phone: string; email: string };
    broker: { name: string; address: string; address2: string; phone: string; email: string };
    items: Item[];
    color?: string;
    secondaryColor?: string;
    adjustments?: { quickpayFeePercent?: number; fixedFee?: number };
};

export const InvoiceDocument = ({ payload }: { payload: InvoicePayload }) => {
    const primary = `#${payload.color || "134A9E"}`;
    const secondary = `#${payload.secondaryColor || "134A9E"}`;

    const styles = StyleSheet.create({
        page: {
            paddingTop: 58,
            paddingBottom: 58,
            paddingLeft: 44,
            paddingRight: 46,
            fontFamily: "Helvetica",
            fontSize: 9, // default font size for all text inside this Page
            lineHeight: 1.4,
        },
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        title: { fontSize: 28, color: primary, fontWeight: "light" },
        section: { marginBottom: 15 },
        label: { fontWeight: "bold", fontSize: 10 },
        labelBig: { fontWeight: "bold", fontSize: 12, lineHeight: 1.5 },
        table: { display: "flex", flexDirection: "column" },
        tableHeader: { flexDirection: "row", backgroundColor: secondary, color: "#fff", padding: 5 },
        tableRow: { flexDirection: "row", padding: 5, paddingBottom: 10, borderBottomWidth: 0.5, borderColor: "#555555" },
        cell: { flex: 6 },
        total: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end" },
        stop: { marginLeft: 10 },
    });

    // calculate totals
    const itemsTotal = payload.items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const quickpayFee = (payload.adjustments?.quickpayFeePercent || 0) * itemsTotal / 100;
    const fixedFee = payload.adjustments?.fixedFee || 0;
    const total = itemsTotal - quickpayFee + fixedFee;
    const dollars = Math.floor(total);
    const cents = Math.round((total - dollars) * 100);

    let totalInWords = toWords(dollars); // e.g., "two thousand"
    if (cents > 0) {
        totalInWords += ` and ${cents.toString().padStart(2, "0")} cents`;
    }

    // Capitalize first letter
    totalInWords = totalInWords.charAt(0).toUpperCase() + totalInWords.slice(1);
    return (
        <Page size="A4" style={styles.page}>
            {/* Carrier / Broker + Invoice Summary */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                {/* Left column: Carrier / Broker */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{payload.carrier.name}</Text>
                    <Text>{payload.carrier.address}</Text>
                    <Text>{payload.carrier.address2}</Text>
                    <Text>{payload.carrier.phone}</Text>
                    <Text>{payload.carrier.email}</Text>

                    <View style={{ marginTop: 55 }}>
                        <Text style={{ fontSize: 10, fontWeight: "light" }}>Bill To</Text>
                        <Text style={styles.labelBig}>{payload.broker.name}</Text>
                        <Text>{payload.broker.address}</Text>
                        <Text>{payload.broker.address2}</Text>
                    </View>
                </View>

                {/* Right column: Invoice Summary */}
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={styles.title}>Invoice</Text>
                    <Text style={{ fontSize: 12, marginTop: 25, fontWeight: "bold" }}># {payload.id}</Text>
                    <Text style={{ marginTop: 25, fontWeight: "bold" }}>Rate</Text>
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                        ${payload.items.reduce((sum, item) => sum + item.cost * item.quantity, 0).toFixed(2)}
                    </Text>


                    <View style={{ marginTop: 25, width: 200, alignSelf: "flex-end" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
                            <Text style={{ width: 100, textAlign: "right" }}>Invoice Date:</Text>
                            <Text>{new Date(payload.date).toLocaleDateString()}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
                            <Text style={{ width: 100, textAlign: "right" }}>Load:</Text>
                            <Text>{payload.load_number}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ flex: 2 }}>#</Text>
                    <Text style={{ flex: 30 }}>Description</Text>
                    <Text style={{ flex: 3 }}>Qty</Text>
                    <Text style={styles.cell}>Rate</Text>
                    <Text style={styles.cell}>Amount</Text>
                </View>

                {payload.items.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={{ flex: 2 }}>{idx + 1}</Text>
                        {/* Description + stops inside the same cell */}
                        <Text style={[styles.cell, { flex: 30 }]}>
                            {/* Description always on its own line */}
                            <Text style={{ fontSize: 10 }}>
                                {item.description}
                            </Text>

                            {/* Force line break */}
                            {"\n"}

                            {/* Notes, if any */}
                            {item.notes && (
                                <>
                                    <Text>{item.notes}</Text>

                                </>
                            )}

                            {/* Stops */}
                            {item.stops.map((stop) => (
                                <Text
                                    key={stop.city + stop.datetime}
                                    style={{ fontSize: 9, fontWeight: "normal", lineHeight: 1.2 }}
                                >
                                    {"\n"}
                                    {stop.type}
                                    {stop.datetime ? ` - ${new Date(stop.datetime).toLocaleDateString()}` : ""}
                                    {"\n"}    {stop.city}{stop.zip ? `, ${stop.zip}` : ""}
                                </Text>
                            ))}
                        </Text>

                        <Text style={{ flex: 3 }}>{item.quantity}</Text>
                        <Text style={styles.cell}>${item.cost.toFixed(2)}</Text>
                        <Text style={styles.cell}>${(item.cost * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={{ marginTop: 10, width: 225, alignSelf: "flex-end" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingRight: 5 }}>
                    <Text style={{ width: 120, textAlign: "right" }}>Sub Total</Text>
                    <Text>${itemsTotal.toFixed(2)}</Text>
                </View>

                {quickpayFee > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingRight: 5 }}>
                        <Text style={{ width: 120, textAlign: "right" }}>Quickpay {payload.adjustments?.quickpayFeePercent}%</Text>
                        <Text>-${quickpayFee.toFixed(2)}</Text>
                    </View>
                )}

                {/* Fixed Fee */}
                {fixedFee > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingRight: 5 }}>
                        <Text style={{ width: 120, textAlign: "right" }}>Fixed Fee</Text>
                        <Text>+${fixedFee.toFixed(2)}</Text>
                    </View>
                )}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 3, backgroundColor: "#f0f0f0", paddingVertical: 10, paddingRight: 5 }}>
                    <Text style={{ width: 120, textAlign: "right", fontWeight: "bold", fontSize: 10 }}>Total</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 10 }}>${total.toFixed(2)}</Text>
                </View>

                <Text style={{ marginTop: 5, paddingHorizontal: 20, fontWeight: "bold", fontStyle: "italic", color: "#444444", textAlign: "right" }}>
                    (USD) {totalInWords.charAt(0).toUpperCase() + totalInWords.slice(1)}
                </Text>
            </View>
            <View style={{ marginTop: 25 }}>
                <Text style={{ fontSize: 10, color: "#444444" }}>Notes</Text>
                <Text style={{ fontSize: 8, color: "#444444" }}>
                    All Check will be made payable to Company Name{"\n"}
                    If you have questions about this bill, please use the following contact information:{"\n"}
                    {payload.carrier.phone} or {payload.carrier.email} {"\n"}
                    Thank you for your trust.
                </Text>
            </View>
        </Page>
    );
};