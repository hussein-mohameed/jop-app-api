import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottom: '1pt solid #eeeeee',
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
  },
  bold: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});

interface PayslipData {
  employeeName: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

const PayslipDocument = ({ data }: { data: PayslipData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Payslip</Text>
        
        <View style={styles.row}>
          <Text style={styles.bold}>Employee Name:</Text>
          <Text style={styles.text}>{data.employeeName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.bold}>Period:</Text>
          <Text style={styles.text}>{data.period}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.bold}>Basic Salary:</Text>
          <Text style={styles.text}>${data.basicSalary.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.bold}>Allowances:</Text>
          <Text style={styles.text}>${data.allowances.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.bold}>Deductions:</Text>
          <Text style={styles.text}>${data.deductions.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, { marginTop: 20, borderTop: '2pt solid #000', paddingTop: 10 }]}>
          <Text style={styles.bold}>Net Salary:</Text>
          <Text style={styles.bold}>${data.netSalary.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export class PdfGeneratorService {
  /**
   * Generates a payslip PDF stream
   */
  static async generatePayslip(data: PayslipData): Promise<NodeJS.ReadableStream> {
    const stream = await renderToStream(<PayslipDocument data={data} />);
    return stream;
  }
}
