// components/MyDocument.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { flexDirection: "row", backgroundColor: "#fff" },
  section: { margin: 10, padding: 10, flexGrow: 1 },
});

export const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Hello, this is a PDF generated with React-PDF!</Text>
      </View>
    </Page>
  </Document>
);
