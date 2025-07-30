'use client';

import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    Box,
    Typography
} from '@mui/material';
import { Language } from '@mui/icons-material';

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const defaultLocale = useLocale();
    const locale = (params.locale as string) || defaultLocale;
    const t = useTranslations('language');



    const handleLanguageChange = (event: SelectChangeEvent<string>) => {
        const newLocale = event.target.value;
        // Remove current locale from path
        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        // Add new locale
        const newPath = `/${newLocale}${pathWithoutLocale}`;
        router.push(newPath);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language sx={{ color: 'text.secondary' }} />
            <FormControl size="small" variant="outlined">
                <Select
                    value={locale}
                    onChange={handleLanguageChange}
                    sx={{
                        minWidth: 120,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    <MenuItem value="en">
                        <Typography variant="body2">{t('english')}</Typography>
                    </MenuItem>
                    <MenuItem value="pl">
                        <Typography variant="body2">{t('polish')}</Typography>
                    </MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
} 