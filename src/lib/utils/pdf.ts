// Server-side PDF generation using @react-pdf/renderer
// This file is imported only from API routes (server-side)
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1A7F5A",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A7F5A",
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1A7F5A",
    padding: 6,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colDate: { width: "15%" },
  colDesc: { width: "30%" },
  colCategory: { width: "20%" },
  colType: { width: "15%" },
  colValue: { width: "20%", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#999",
  },
  entradaText: { color: "#16a34a" },
  saidaText: { color: "#dc2626" },
});

interface PDFTransaction {
  date: string;
  description: string;
  categoryName: string;
  type: "ENTRADA" | "SAIDA";
  value: number;
}

interface PDFData {
  groupName: string;
  period: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  transactions: PDFTransaction[];
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDatePDF(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

function RelatorioPDF({ data }: { data: PDFData }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, "KONTA"),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `${data.groupName} — ${data.period}`
        )
      ),
      // Summary
      React.createElement(
        View,
        { style: styles.summaryRow },
        React.createElement(
          View,
          { style: styles.summaryCard },
          React.createElement(Text, { style: styles.summaryLabel }, "Saldo"),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            formatBRL(data.saldo)
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryCard },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Total Entradas"
          ),
          React.createElement(
            Text,
            { style: [styles.summaryValue, styles.entradaText] },
            formatBRL(data.totalEntradas)
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryCard },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Total Saídas"
          ),
          React.createElement(
            Text,
            { style: [styles.summaryValue, styles.saidaText] },
            formatBRL(data.totalSaidas)
          )
        )
      ),
      // Table Header
      React.createElement(
        View,
        { style: styles.tableHeader },
        React.createElement(Text, { style: styles.colDate }, "Data"),
        React.createElement(Text, { style: styles.colDesc }, "Descrição"),
        React.createElement(Text, { style: styles.colCategory }, "Categoria"),
        React.createElement(Text, { style: styles.colType }, "Tipo"),
        React.createElement(Text, { style: styles.colValue }, "Valor")
      ),
      // Table Rows
      ...data.transactions.map((t, i) =>
        React.createElement(
          View,
          {
            key: i,
            style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}],
          },
          React.createElement(
            Text,
            { style: styles.colDate },
            formatDatePDF(t.date)
          ),
          React.createElement(Text, { style: styles.colDesc }, t.description),
          React.createElement(
            Text,
            { style: styles.colCategory },
            t.categoryName
          ),
          React.createElement(
            Text,
            {
              style: [
                styles.colType,
                t.type === "ENTRADA" ? styles.entradaText : styles.saidaText,
              ],
            },
            t.type === "ENTRADA" ? "Entrada" : "Saída"
          ),
          React.createElement(
            Text,
            {
              style: [
                styles.colValue,
                t.type === "ENTRADA" ? styles.entradaText : styles.saidaText,
              ],
            },
            formatBRL(t.value)
          )
        )
      ),
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          null,
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`
        ),
        React.createElement(Text, null, "Konta — Controle Financeiro")
      )
    )
  );
}

export async function gerarPDF(data: PDFData): Promise<Buffer> {
  const element = React.createElement(RelatorioPDF, { data });
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}

export type { PDFData, PDFTransaction };
