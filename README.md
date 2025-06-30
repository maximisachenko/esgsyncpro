# ESG Energy Management Platform

A modern, data-driven energy consumption management platform built with Next.js, TypeScript, and Material UI. This application helps organizations monitor, analyze, and optimize their energy consumption for better sustainability and ESG compliance.

## 🌟 Features

### Core Functionality
- **Interactive Data Table**: Advanced table with sorting, filtering, and pagination
- **Energy Consumption Tracking**: Monitor energy usage over the last 12 months
- **Cost Analysis**: Track energy costs and savings
- **Savings Performance**: Visual indicators for energy efficiency improvements
- **Real-time Editing**: Inline editing capabilities for data management

### Data Management
- **Add New Records**: Easy form-based data entry
- **Edit/Delete Records**: Full CRUD operations
- **Advanced Filtering**: Filter by consumption, cost, and date ranges
- **Smart Sorting**: Sort by any column with visual indicators

### Import/Export Capabilities
- **CSV Import**: Upload existing energy data from CSV files
- **Multiple Export Formats**:
  - CSV for spreadsheet applications
  - Excel (.xlsx) with auto-formatted columns
  - PDF reports with professional styling
  - JSON for data integration
  - XML for system interoperability

### Analytics & Visualization
- **Summary Dashboard**: Key metrics at a glance
- **Savings Indicators**: Color-coded performance indicators (green ≥10%, red <10%)
- **Trend Analysis**: Month-over-month savings percentage calculations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd esg-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🛠 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **Data Grid**: MUI X Data Grid
- **Styling**: Material UI Theme System
- **File Processing**: 
  - Papa Parse (CSV)
  - SheetJS (Excel)
  - jsPDF (PDF generation)
  - xml2js (XML processing)

## 📊 Data Structure

The application manages energy data with the following structure:

```typescript
interface EnergyData {
  id: string;
  date: string;                  // Month/Year format
  energyConsumption: number;     // kWh
  energyCost: number;           // USD
  energySaved: number;          // kWh saved vs baseline
  moneySaved: number;           // USD saved vs baseline
  savingsPercentage: number;    // % savings vs previous month
}
```

## 🎯 Key Features for Investors

### 1. **Professional Dashboard**
- Clean, modern interface suitable for executive presentations
- Real-time data visualization with color-coded performance indicators
- Summary cards showing total consumption, costs, and savings

### 2. **Advanced Data Management**
- Comprehensive CRUD operations
- Smart data validation and error handling
- Bulk import/export capabilities for integration with existing systems

### 3. **ESG Compliance Ready**
- Built-in sustainability metrics tracking
- Automated savings calculations and reporting
- Export capabilities for compliance documentation

### 4. **Scalable Architecture**
- TypeScript for type safety and maintainability
- Component-based architecture for easy extension
- Modern React patterns with hooks and context

### 5. **Enterprise Features**
- Professional PDF reporting
- Multi-format data export
- Responsive design for all devices
- Production-ready build process

## 🔧 Usage Guide

### Adding Energy Data
1. Click the "Add Row" button in the top toolbar
2. Fill in the required fields (date, consumption, cost, savings)
3. Click "Add" to save the new record

### Editing Data
1. Click the edit icon (pencil) next to any row
2. Modify the values directly in the table
3. Press Enter or click the save icon to confirm changes

### Filtering Data
1. Click the "Filter" button in the toolbar
2. Set minimum/maximum values for consumption or cost
3. Click "Apply" to filter the data

### Exporting Data
1. Click the "Export" button in the toolbar
2. Choose your preferred format (CSV, Excel, PDF, JSON, XML)
3. The file will be automatically downloaded

### Importing Data
1. Click the "Import CSV" button
2. Select a CSV file with the proper column structure
3. Data will be automatically imported and added to the table

## 📈 Savings Performance Indicators

The platform automatically calculates and displays savings performance:
- **Green Indicator (●)**: ≥10% energy savings compared to previous month
- **Red Indicator (●)**: <10% energy savings compared to previous month
- **Percentage Display**: Exact savings percentage for detailed analysis

## 🤝 Contributing

This project is designed for investor demonstration and can be extended with additional features such as:
- Advanced analytics and charting
- Multi-tenant support
- API integration with energy providers
- Advanced reporting and dashboards
- Real-time data streaming

## 📄 License

MIT License - see LICENSE file for details.

## 🌱 Sustainability Impact

This platform helps organizations:
- Track and reduce energy consumption
- Meet ESG compliance requirements
- Identify cost-saving opportunities
- Monitor sustainability progress over time
- Generate reports for stakeholder communication

---

**Built for the future of sustainable energy management** 🌍
