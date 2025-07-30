'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const t = useTranslations('header');

    return (
        <Box sx={{ mb: 4 }}>
            {/* Language switcher in top right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <LanguageSwitcher />
            </Box>

            {/* Main header content */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    {t('title')}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {t('subtitle')}
                </Typography>
            </Box>
        </Box>
    );
} 