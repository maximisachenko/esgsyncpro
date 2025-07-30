'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';

export default function Footer() {
    const t = useTranslations('footer');

    return (
        <Box sx={{ mt: 4, py: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                {t('copyright')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('description')}
            </Typography>
        </Box>
    );
} 