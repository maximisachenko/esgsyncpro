'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ElectricBolt,
  AttachMoney,
} from '@mui/icons-material';
import EnergyDataTable from '@/components/EnergyDataTable';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EnergyData } from '@/types/energy';
import { generateMockData, updateSavingsPercentages } from '@/utils/energyData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Green theme for energy
    },
    secondary: {
      main: '#1976D2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

export default function Home() {
  const t = useTranslations();

  // Initialize data directly to avoid hydration mismatch
  const [energyData, setEnergyData] = useState<EnergyData[]>(() => generateMockData());

  const handleDataChange = (newData: EnergyData[]) => {
    const updatedData = updateSavingsPercentages(newData);
    setEnergyData(updatedData);
  };

  // Calculate summary statistics
  const totalConsumption = energyData.reduce((sum, item) => sum + item.energyConsumption, 0);
  const totalCost = energyData.reduce((sum, item) => sum + item.energyCost, 0);
  const totalSaved = energyData.reduce((sum, item) => sum + item.energySaved, 0);
  const totalMoneySaved = energyData.reduce((sum, item) => sum + item.moneySaved, 0);
  const averageSavingsPercentage = energyData.length > 0
    ? energyData.reduce((sum, item) => sum + item.savingsPercentage, 0) / energyData.length
    : 0;

  const getSavingsColor = (percentage: number) => {
    return percentage >= 10 ? 'success' : 'error';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header with language switcher */}
          <Header />

          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ElectricBolt color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {t('summaryCards.totalConsumption')}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary">
                  {totalConsumption.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('summaryCards.kwhLastMonths')}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {t('summaryCards.totalCost')}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="secondary">
                  ${totalCost.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('summaryCards.usdLastMonths')}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingDown color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {t('summaryCards.energySaved')}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="success.main">
                  {totalSaved.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('summaryCards.kwhSavedBaseline')}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {t('summaryCards.moneySaved')}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="success.main">
                  ${totalMoneySaved.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('summaryCards.usdSavedBaseline')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Average Savings Indicator */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('performance.title')}
            </Typography>
            <Chip
              icon={averageSavingsPercentage >= 10 ? <TrendingUp /> : <TrendingDown />}
              label={`${averageSavingsPercentage.toFixed(1)}% ${t('performance.averageSavings')}`}
              color={getSavingsColor(averageSavingsPercentage)}
              size="medium"
              sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
            />
          </Box>

          {/* Data Table */}
          <EnergyDataTable data={energyData} onDataChange={handleDataChange} />

          {/* Footer with language switcher */}
          <Footer />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
